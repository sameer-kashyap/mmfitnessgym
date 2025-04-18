
import { useState } from "react";
import { Member } from "@/types/member";
import { useMembers } from "@/context/MemberContext";
import { toast } from "@/components/ui/sonner";

interface EditFormData {
  phone: string;
  subscriptionDuration: string;
  paymentStatus: string;
}

interface EditFormErrors {
  phone: boolean;
}

export const useEditMember = (member: Member) => {
  const { updateMember } = useMembers();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    phone: member.phone,
    subscriptionDuration: member.subscriptionDuration.toString(),
    paymentStatus: member.paymentStatus,
  });
  const [formErrors, setFormErrors] = useState<EditFormErrors>({
    phone: false,
  });

  const validatePhone = (phone: string): boolean => {
    const re = /^[0-9\-\+\s\(\)]{10,15}$/;
    return re.test(phone);
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
    return !Object.values(newFormErrors).some(error => error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Reset start date if subscription duration is changed
    const resetStartDate = parseInt(formData.subscriptionDuration) !== member.subscriptionDuration;
    
    updateMember(member.id, {
      phone: formData.phone.trim(),
      subscriptionDuration: parseInt(formData.subscriptionDuration),
      paymentStatus: formData.paymentStatus as 'paid' | 'unpaid',
      ...(resetStartDate && { startDate: new Date().toISOString() })
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
  };
};
