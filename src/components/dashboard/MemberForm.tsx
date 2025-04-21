import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FormField } from "./member-form/FormField";
import { PaymentStatusSelect } from "./member-form/PaymentStatusSelect";
import { useMemberForm } from "@/hooks/useMemberForm";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

const MemberForm: React.FC = () => {
  const {
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useMemberForm();

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
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={formErrors.fullName}
            errorMessage="Name is required"
          />

          <FormField
            label="Date of Birth (DD/MM/YYYY) (optional)"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            error={formErrors.dateOfBirth}
            errorMessage="Please enter a valid date of birth in DD/MM/YYYY format"
            placeholder="DD/MM/YYYY"
          />

          <FormField
            label="Joining Date (DD/MM/YYYY)"
            id="joiningDate"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            error={formErrors.joiningDate}
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
            id="subscriptionDuration"
            name="subscriptionDuration"
            value={formData.subscriptionDuration}
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
              value={formData.paymentStatus}
              onChange={(value) => handleSelectChange('paymentStatus', value)}
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
