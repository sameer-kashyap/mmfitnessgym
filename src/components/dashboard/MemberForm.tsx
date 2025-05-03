
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FormField } from "./member-form/FormField";
import { PaymentStatusSelect } from "./member-form/PaymentStatusSelect";
import { useMemberForm } from "@/hooks/useMemberForm";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { notificationService } from "@/services/notificationService";
import { useMembers } from "@/context/MemberContext";

const MemberForm: React.FC = () => {
  const {
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useMemberForm();
  
  const { members } = useMembers();

  // Setup WhatsApp notification for new members
  useEffect(() => {
    const lastAddedMember = members[0];
    if (lastAddedMember && new Date(lastAddedMember.created_at || '').getTime() > Date.now() - 5000) {
      // Send WhatsApp notification for new member (only for recently added members)
      notificationService.sendNewMemberAlert(lastAddedMember);
    }
  }, [members]);

  // Calculate total (deposit + due)
  const total = parseFloat(formData.deposit || "0") + parseFloat(formData.due || "0");

  return (
    <Card className="gym-card">
      <CardHeader>
        <CardTitle className="text-royal-purple">Add New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Full Name"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={formErrors.full_name}
            errorMessage="Name is required"
          />

          <FormField
            label="Date of Birth (DD/MM/YYYY) (optional)"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            error={formErrors.date_of_birth}
            errorMessage="Please enter a valid date of birth in DD/MM/YYYY format"
            placeholder="DD/MM/YYYY"
          />

          <FormField
            label="Joining Date (DD/MM/YYYY)"
            id="joining_date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            error={formErrors.joining_date}
            errorMessage="Please enter a valid joining date in DD/MM/YYYY format"
            placeholder="DD/MM/YYYY"
          />

          <FormField
            label="Phone Number"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={formErrors.phone}
            errorMessage="Valid phone number is required"
          />

          <FormField
            label="Subscription (Days)"
            id="subscription_duration"
            name="subscription_duration"
            value={formData.subscription_duration}
            onChange={handleChange}
            type="number"
          />

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Payment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Deposit Paid (₹)"
                id="deposit"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                type="number"
                placeholder="Enter amount paid"
              />

              <FormField
                label="Amount Due (₹)"
                id="due"
                name="due"
                value={formData.due}
                onChange={handleChange}
                type="number"
                placeholder="Enter amount due"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <PaymentStatusSelect
              value={formData.payment_status}
              onChange={(value) => handleSelectChange('payment_status', value)}
            />
          </div>

          <div className="space-y-4 border p-4 rounded-md">
            <h3 className="font-medium">Member Description</h3>
            <div className="space-y-2">
              <Label htmlFor="description">Additional Notes</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Enter any additional notes about the member..."
                className="min-h-[100px]"
              />
            </div>
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
