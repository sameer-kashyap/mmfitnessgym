
import React, { useState } from "react";
import { Member } from "../../types/member";
import { useMembers } from "../../context/MemberContext";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { calculateDaysLeft, formatDate } from "../../lib/utils";
import { Trash2 } from "lucide-react";
import { EditMemberDialog } from "./member-form/EditMemberDialog";
import { MemberProfile } from "./member-profile/MemberProfile";

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const { removeMember } = useMembers();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
  const endDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));

  const getStatusColorClass = () => {
    if (daysLeft > 7) return "bg-green-100 text-green-800 border-green-200";
    if (daysLeft > 0) return "bg-amber-100 text-amber-800 border-amber-200";
    if (daysLeft === 0) return "bg-amber-100 text-amber-800 border-amber-200";
    if (daysLeft < 0) return "bg-[#ea384c] text-white border-transparent animate-pulse";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Improved event target checking - check if clicking on or within a button
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }
    setIsProfileOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeMember(member.id);
  };

  return (
    <>
      <Card 
        className="gym-card relative overflow-visible cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
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
                onClick={handleDeleteClick}
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
            <div className="flex justify-between items-center mt-2">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-bold shadow transition-all ${getStatusColorClass()}`}
                aria-label={
                  daysLeft > 0
                    ? `${daysLeft} days left`
                    : daysLeft === 0
                    ? "Expires today"
                    : `Expired: ${-daysLeft} day${-daysLeft !== 1 ? "s" : ""} ago`
                }
              >
                {daysLeft > 0 && (
                  <>
                    {daysLeft} day{daysLeft !== 1 && "s"} left
                  </>
                )}
                {daysLeft === 0 && <>Expires today</>}
                {daysLeft < 0 && (
                  <>
                    <span className="text-lg font-extrabold mr-1">-{-daysLeft}</span>
                    day{-daysLeft !== 1 && "s"} expired
                  </>
                )}
              </span>
              <span
                className={`ml-2 status-badge px-3 py-1 rounded-full text-xs font-semibold ${
                  member.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-gray-200 text-[#ea384c] border border-[#ea384c]"
                }`}
              >
                {member.paymentStatus === "paid" ? "Paid" : "Unpaid"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <MemberProfile 
        member={member}
        isOpen={isProfileOpen}
        setIsOpen={setIsProfileOpen}
      />
    </>
  );
};

export default MemberCard;
