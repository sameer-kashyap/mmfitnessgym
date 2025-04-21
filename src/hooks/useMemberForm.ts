
import { useState } from "react";
import { useMembers } from "../context/MemberContext";
import { parse, isValid, format } from "date-fns";
import { toast } from "@/components/ui/sonner";

interface FormData {
  fullName: string;
  phone: string;
  subscriptionDuration: string;
  paymentStatus: string;
  dateOfBirth: string;
  joiningDate: string;
  deposit: string;
  due: string;
}

interface FormErrors {
  fullName: boolean;
  phone: boolean;
  dateOfBirth: boolean;
  joiningDate: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  subscriptionDuration: "30",
  paymentStatus: "paid",
  dateOfBirth: "",
  joiningDate: "",
  deposit: "0",
  due: "0",
};

const initialFormErrors: FormErrors = {
  fullName: false,
  phone: false,
  dateOfBirth: false,
  joiningDate: false,
};

export const useMemberForm = () => {
  const { addMember } = useMembers();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>(initialFormErrors);

  const validatePhone = (phone: string): boolean => {
    const re = /^[0-9\-\+\s\(\)]{10,15}$/;
    return re.test(phone);
  };

  // Make date of birth validation only if filled
  const validateDateOfBirth = (dateString: string): boolean => {
    if (!dateString?.trim()) return true; // Optional
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) && 
           parsedDate < new Date() && 
           parsedDate > new Date("1900-01-01");
  };

  const validateJoiningDate = (dateString: string): boolean => {
    if (!dateString?.trim()) return false; // Required
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    // Allow any "valid" date after 1900, in the past or today or later (future allowed)
    return isValid(parsedDate) && parsedDate > new Date('1900-01-01');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      fullName: formData.fullName.trim() === "",
      phone: !validatePhone(formData.phone),
      dateOfBirth: !validateDateOfBirth(formData.dateOfBirth),
      joiningDate: !validateJoiningDate(formData.joiningDate),
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

    const parsedJoiningDate = parse(formData.joiningDate, 'dd/MM/yyyy', new Date());

    let formattedDob = undefined;
    if (formData.dateOfBirth?.trim()) {
      const parsedDob = parse(formData.dateOfBirth, 'dd/MM/yyyy', new Date());
      formattedDob = isValid(parsedDob)
        ? format(parsedDob, "yyyy-MM-dd")
        : undefined;
    }

    const now = new Date();

    addMember({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      subscriptionDuration: parseInt(formData.subscriptionDuration),
      paymentStatus: formData.paymentStatus as 'paid' | 'unpaid',
      dateOfBirth: formattedDob,
      startDate: format(parsedJoiningDate, "yyyy-MM-dd"),
      deposit: parseFloat(formData.deposit) || 0,
      due: parseFloat(formData.due) || 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    });

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
