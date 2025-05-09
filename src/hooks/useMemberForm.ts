
import { useState } from "react";
import { useMembers } from "../context/MemberContext";
import { parse, isValid, format } from "date-fns";
import { toast } from "@/components/ui/sonner";

interface FormData {
  full_name: string;
  phone: string;
  subscription_duration: string;
  payment_status: string;
  date_of_birth: string;
  joining_date: string;
  deposit: string;
  due: string;
  description?: string;
}

interface FormErrors {
  full_name: boolean;
  phone: boolean;
  date_of_birth: boolean;
  joining_date: boolean;
}

const initialFormData: FormData = {
  full_name: "",
  phone: "",
  subscription_duration: "30",
  payment_status: "paid",
  date_of_birth: "",
  joining_date: "",
  deposit: "0",
  due: "0",
  description: "",
};

const initialFormErrors: FormErrors = {
  full_name: false,
  phone: false,
  date_of_birth: false,
  joining_date: false,
};

export const useMemberForm = () => {
  const { addMember } = useMembers();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>(initialFormErrors);

  const validatePhone = (phone: string): boolean => {
    const re = /^[0-9\-\+\s\(\)]{10,15}$/;
    return re.test(phone);
  };

  const validateDateOfBirth = (dateString: string): boolean => {
    if (!dateString?.trim()) return true;
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) && 
           parsedDate < new Date() && 
           parsedDate > new Date("1900-01-01");
  };

  const validateJoiningDate = (dateString: string): boolean => {
    if (!dateString?.trim()) return false;
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) && parsedDate > new Date('1900-01-01');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (Object.keys(formErrors).includes(name)) {
      setFormErrors(prev => ({ ...prev, [name as keyof FormErrors]: false }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newFormErrors = {
      full_name: formData.full_name.trim() === "",
      phone: !validatePhone(formData.phone),
      date_of_birth: !validateDateOfBirth(formData.date_of_birth),
      joining_date: !validateJoiningDate(formData.joining_date),
    };
    setFormErrors(newFormErrors);
    return !Object.values(newFormErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const parsedJoiningDate = parse(formData.joining_date, 'dd/MM/yyyy', new Date());
    
    // Format the joining_date for database insertion (YYYY-MM-DD)
    const formattedJoiningDate = format(parsedJoiningDate, "yyyy-MM-dd");

    let formattedDob = undefined;
    if (formData.date_of_birth?.trim()) {
      const parsedDob = parse(formData.date_of_birth, 'dd/MM/yyyy', new Date());
      formattedDob = isValid(parsedDob)
        ? format(parsedDob, "yyyy-MM-dd")
        : undefined;
    }

    // Create a member data object with snake_case keys for the database
    const memberData = {
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      subscription_duration: parseInt(formData.subscription_duration),
      payment_status: formData.payment_status as 'paid' | 'unpaid',
      dob: formattedDob, // Changed from date_of_birth to dob to match DB schema
      joining_date: formattedJoiningDate, // Changed from start_date to joining_date
      deposit: parseFloat(formData.deposit) || 0,
      due: parseFloat(formData.due) || 0,
      description: formData.description?.trim(),
    };

    console.log("Submitting member data:", memberData);
    addMember(memberData);
    setFormData(initialFormData);
  };

  return {
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit,
  };
};
