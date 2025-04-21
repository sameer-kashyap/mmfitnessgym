
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
import { Pencil, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    selectedDate,
    setSelectedDate,
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

          <div className="space-y-2 border p-4 rounded-md">
            <h3 className="font-medium mb-3">Payment Details</h3>
            
            <FormField
              label="Deposit Paid (₹)"
              id="deposit"
              name="deposit"
              value={formData.deposit}
              onChange={handleChange}
              type="number"
              placeholder="Enter deposit amount"
            />

            <FormField
              label="Amount Due (₹)"
              id="due"
              name="due"
              value={formData.due}
              onChange={handleChange}
              type="number"
              placeholder="Enter due amount"
            />

            <PaymentStatusSelect
              value={formData.paymentStatus}
              onChange={(value) => handleSelectChange('paymentStatus', value)}
            />
          </div>

          {!member.dateOfBirth && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth (DD/MM/YYYY)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "dd/MM/yyyy")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

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
