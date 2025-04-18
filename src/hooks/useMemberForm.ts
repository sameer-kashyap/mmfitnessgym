
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
}

interface FormErrors {
  fullName: boolean;
  phone: boolean;
  dateOfBirth: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  phone: "",
  subscriptionDuration: "30",
  paymentStatus: "paid",
  dateOfBirth: ""
};

const initialFormErrors: FormErrors = {
  fullName: false,
  phone: false,
  dateOfBirth: false
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
    const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsedDate) && 
           parsedDate < new Date() && 
           parsedDate > new Date('1900-01-01');
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
      dateOfBirth: !validateDateOfBirth(formData.dateOfBirth)
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
    
    const parsedDate = parse(formData.dateOfBirth, 'dd/MM/yyyy', new Date());
    
    addMember({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      subscriptionDuration: parseInt(formData.subscriptionDuration),
      paymentStatus: formData.paymentStatus as 'paid' | 'unpaid',
      dateOfBirth: format(parsedDate, 'yyyy-MM-dd')
    });
    
    setFormData(initialFormData);
  };

  return {
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit
  };
};
