
import React, { useState } from "react";
import { useMembers } from "../../context/MemberContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { toast } from "../ui/sonner";

const MemberForm: React.FC = () => {
  const { addMember } = useMembers();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    subscriptionDuration: "30", // Default to 30 days
    paymentStatus: "paid"
  });

  const [formErrors, setFormErrors] = useState({
    fullName: false,
    phone: false
  });

  const validatePhone = (phone: string): boolean => {
    const re = /^[0-9\-\+\s\(\)]{10,15}$/;
    return re.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset error state for the field
    if (Object.keys(formErrors).includes(name)) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newFormErrors = {
      fullName: formData.fullName.trim() === "",
      phone: !validatePhone(formData.phone)
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
    
    addMember({
      fullName: formData.fullName.trim(),
      email: "", // Empty email as it's no longer required
      phone: formData.phone.trim(),
      subscriptionDuration: parseInt(formData.subscriptionDuration),
      paymentStatus: formData.paymentStatus as 'paid' | 'unpaid'
    });
    
    // Reset form
    setFormData({
      fullName: "",
      phone: "",
      subscriptionDuration: "30",
      paymentStatus: "paid"
    });
  };

  return (
    <Card className="gym-card">
      <CardHeader>
        <CardTitle className="text-royal-purple">Add New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={formErrors.fullName ? "border-red-500" : ""}
            />
            {formErrors.fullName && (
              <p className="text-red-500 text-sm">Name is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={formErrors.phone ? "border-red-500" : ""}
            />
            {formErrors.phone && (
              <p className="text-red-500 text-sm">Valid phone number is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subscriptionDuration">Subscription (Days)</Label>
            <Input
              id="subscriptionDuration"
              name="subscriptionDuration"
              type="number"
              min="1"
              max="365"
              value={formData.subscriptionDuration}
              onChange={handleChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Payment Status</Label>
            <Select 
              value={formData.paymentStatus}
              onValueChange={(value) => handleSelectChange('paymentStatus', value)}
            >
              <SelectTrigger id="paymentStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full bg-royal-purple hover:bg-royal-light">
            Add Member
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberForm;
