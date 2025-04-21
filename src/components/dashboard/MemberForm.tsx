
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FormField } from "./member-form/FormField";
import { PaymentStatusSelect } from "./member-form/PaymentStatusSelect";
import { useMemberForm } from "@/hooks/useMemberForm";

const MemberForm: React.FC = () => {
  const {
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit
  } = useMemberForm();

  return (
    <Card className="gym-card">
      <CardHeader>
        <CardTitle className="text-royal-purple">Add New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <PaymentStatusSelect
            value={formData.paymentStatus}
            onChange={(value) => handleSelectChange('paymentStatus', value)}
          />

          <Button type="submit" className="w-full bg-royal-purple hover:bg-royal-light">
            Add Member
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberForm;
