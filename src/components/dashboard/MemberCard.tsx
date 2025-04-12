
import React from "react";
import { Member } from "../../types/member";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { calculateDaysLeft, formatDate, getMemberStatus } from "../../lib/utils";
import { useMembers } from "../../context/MemberContext";
import { Calendar, Mail, Phone, Trash2 } from "lucide-react";

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const { removeMember } = useMembers();
  const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
  const status = getMemberStatus(member);
  const expiryDate = new Date(new Date(member.startDate).getTime() + member.subscriptionDuration * 24 * 60 * 60 * 1000);
  
  let statusLabel = "";
  let statusClass = "";
  
  switch (status) {
    case "active":
      statusLabel = "Active";
      statusClass = "status-active";
      break;
    case "expiring-soon":
      statusLabel = `Expiring in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
      statusClass = "status-expiring";
      break;
    case "grace-period":
      statusLabel = "Grace Period";
      statusClass = "status-expired";
      break;
    case "expired":
      statusLabel = "Expired";
      statusClass = "status-expired";
      break;
  }
  
  return (
    <Card className="gym-card h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{member.fullName}</CardTitle>
          <span className={`status-badge ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{member.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{member.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Expires: {formatDate(expiryDate.toISOString())}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className={`status-badge ${member.paymentStatus === 'paid' ? 'status-active' : 'status-unpaid'}`}>
            {member.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full" 
          onClick={() => removeMember(member.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Member
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MemberCard;
