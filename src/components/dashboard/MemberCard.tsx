
import React from "react";
import { Member } from "../../types/member";
import { useMembers } from "../../context/MemberContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { calculateDaysLeft, formatDate } from "../../lib/utils";
import { Trash2 } from "lucide-react";
import { EditMemberDialog } from "./member-form/EditMemberDialog";

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const { removeMember } = useMembers();
  const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
  const endDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));

  const getStatusClass = () => {
    if (daysLeft > 7) return "status-active";
    if (daysLeft > 0) return "status-expiring";
    if (daysLeft > -7) return "status-expired";
    return "status-unpaid";
  };

  return (
    <Card className="gym-card relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{member.fullName}</h3>
            <p className="text-sm text-muted-foreground">{member.phone}</p>
          </div>
          <div className="flex gap-2">
            <EditMemberDialog member={member} />
            <Button 
              variant="destructive" 
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => removeMember(member.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {member.dateOfBirth && (
            <p className="text-sm">
              <span className="text-muted-foreground">DOB:</span> {formatDate(member.dateOfBirth)}
            </p>
          )}
          <div className="flex justify-between items-center text-sm">
            <span>Subscription ends:</span>
            <span>{formatDate(endDate.toISOString())}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`status-badge ${getStatusClass()}`}>
              {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
            </span>
            <span className={`status-badge ${member.paymentStatus === 'paid' ? 'status-active' : 'status-unpaid'}`}>
              {member.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
