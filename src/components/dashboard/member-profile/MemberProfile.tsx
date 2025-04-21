
import React from "react";
import { Member } from "@/types/member";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { EditMemberDialog } from "../member-form/EditMemberDialog";

interface MemberProfileProps {
  member: Member;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const MemberProfile = ({ member, isOpen, setIsOpen }: MemberProfileProps) => {
  const endDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[600px] p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{member.fullName}</DialogTitle>
            <EditMemberDialog member={member} />
          </div>
        </DialogHeader>
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{member.phone}</p>
                </div>
                {member.dateOfBirth && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{format(new Date(member.dateOfBirth), "dd/MM/yyyy")}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{formatDate(member.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{formatDate(endDate.toISOString())}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Duration</p>
                  <p className="font-medium">{member.subscriptionDuration} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <p className="font-medium capitalize">{member.paymentStatus}</p>
                </div>
                {(member.deposit !== undefined && member.deposit > 0) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Deposit Paid</p>
                    <p className="font-medium">₹{member.deposit}</p>
                  </div>
                )}
                {(member.due !== undefined && member.due > 0) && (
                  <div>
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className="font-medium">₹{member.due}</p>
                  </div>
                )}
              </div>
              {member.description && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1 whitespace-pre-wrap">{member.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
