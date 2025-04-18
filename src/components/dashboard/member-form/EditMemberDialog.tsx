
import React from "react";
import { Member } from "@/types/member";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "./FormField";
import { PaymentStatusSelect } from "./PaymentStatusSelect";
import { useEditMember } from "@/hooks/useEditMember";
import { Pencil } from "lucide-react";

interface EditMemberDialogProps {
  member: Member;
}

export const EditMemberDialog = ({ member }: EditMemberDialogProps) => {
  const {
    isOpen,
    setIsOpen,
    formData,
    formErrors,
    handleChange,
    handleSelectChange,
    handleSubmit,
  } = useEditMember(member);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Member: {member.fullName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
