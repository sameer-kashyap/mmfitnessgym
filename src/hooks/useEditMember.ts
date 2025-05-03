
import { useState } from "react";
import { Member } from "@/types/member";
import { useMembers } from "@/context/MemberContext";
import { toast } from "@/components/ui/sonner";
import { format, parse, isValid } from "date-fns";

interface EditFormData {
  phone: string;
  subscription_duration: string;
  payment_status: string;
  deposit: string;
  due: string;
}

interface EditFormErrors {
  phone: boolean;
}

export const useEditMember = (member: Member) => {
  const { updateMember } = useMembers();
  const [isOpen, setIsOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    member.date_of_birth 
      ? format(new Date(member.date_of_birth), "dd/MM/yyyy") 
      : ""
  );
  
  const [formData, setFormData] = useState<EditFormData>({
    phone: member.phone,
    subscription_duration: member.subscription_duration.toString(),
    payment_status: member.payment_status,
    deposit: member.deposit?.toString() || "0",
    due: member.due?.toString() || "0",
  });
  const [formErrors, setFormErrors] = useState<EditFormErrors>({
    phone: false,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'phone') {
      setFormErrors(prev => ({ ...prev, phone: false }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newFormErrors = {
      phone: !validatePhone(formData.phone),
    };
    
    setFormErrors(newFormErrors);
    
    // Also validate the date of birth if it's provided
    if (dateOfBirth && !validateDateOfBirth(dateOfBirth)) {
      toast.error("Please enter a valid date of birth in DD/MM/YYYY format");
      return false;
    }
    
    return !Object.values(newFormErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Reset start date if subscription duration is changed
    const resetStartDate = parseInt(formData.subscription_duration) !== member.subscription_duration;
    const now = new Date();
    
    let formattedDob = undefined;
    if (dateOfBirth?.trim()) {
      const parsedDob = parse(dateOfBirth, 'dd/MM/yyyy', new Date());
      if (isValid(parsedDob)) {
        formattedDob = format(parsedDob, "yyyy-MM-dd");
      }
    }
    
    updateMember(member.id, {
      phone: formData.phone.trim(),
      subscription_duration: parseInt(formData.subscription_duration),
      payment_status: formData.payment_status as 'paid' | 'unpaid',
      deposit: parseFloat(formData.deposit) || 0,
      due: parseFloat(formData.due) || 0,
      date_of_birth: formattedDob,
      updated_at: now.toISOString(),
      ...(resetStartDate && { start_date: now.toISOString() })
    });
    
    setIsOpen(false);
    toast.success("Member updated successfully");
  };

  return {
    isOpen,
    setIsOpen,
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit,
    dateOfBirth,
    setDateOfBirth,
  };
};
