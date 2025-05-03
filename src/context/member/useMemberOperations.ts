
import { useState } from "react";
import { Member } from "@/types/member";
import { memberService } from "@/services/memberService";
import { transformMemberFromDB, transformMemberToDB } from "./memberTransformUtils";
import { toast } from "@/components/ui/sonner";
import { getMemberStatus } from "@/lib/utils";
import { calculateDaysLeft } from "@/lib/utils";

export const useMemberOperations = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const fetchedMembers = await memberService.getMembers();
      // Transform DB members to frontend format
      const transformedMembers = fetchedMembers.map(transformMemberFromDB);
      setMembers(transformedMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Could not load members");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (memberData: Omit<Member, "id" | "reminder_sent" | "email">) => {
    const newMember = {
      ...memberData,
      reminder_sent: {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
      },
    };

    // Transform to DB format before sending to API
    const dbMember = transformMemberToDB(newMember);
    const addedMember = await memberService.addMember(dbMember);
    
    if (addedMember) {
      // Transform back to frontend format
      const transformedMember = transformMemberFromDB(addedMember);
      setMembers(prev => [transformedMember, ...prev]);
    }
  };

  const removeMember = async (id: string) => {
    const success = await memberService.deleteMember(id);
    
    if (success) {
      setMembers(prev => prev.filter(member => member.id !== id));
    }
  };

  const getMember = (id: string) => {
    return members.find(member => member.id === id);
  };

  const updateMember = async (id: string, memberUpdate: Partial<Member>) => {
    // Convert to DB format
    const dbMemberUpdate = transformMemberToDB(memberUpdate);
    
    const updatedMember = await memberService.updateMember(id, dbMemberUpdate);
    
    if (updatedMember) {
      // Transform back to frontend format
      const transformedMember = transformMemberFromDB(updatedMember);
      
      setMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, ...transformedMember } : member
        )
      );
    }
  };

  const filteredMembers = (status: 'all' | 'active' | 'expiring-soon' | 'expired' | 'grace-period') => {
    if (status === 'all') return members;
    
    return members.filter(member => {
      const memberStatus = getMemberStatus(member);
      return memberStatus === status;
    });
  };

  // Check expiring memberships and update statuses
  const checkExpiringMemberships = () => {
    console.log("Checking for expiring memberships...");
    
    const updatedMembers = [...members].map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const memberStatus = getMemberStatus(member);
      let updatedMember = { ...member };

      // Automatically set payment status to "unpaid" if expired and status is "paid"
      if (daysLeft < 0 && updatedMember.paymentStatus === "paid") {
        updateMember(member.id, { paymentStatus: "unpaid" });
        updatedMember.paymentStatus = "unpaid";
        toast.info(
          `${updatedMember.fullName}'s payment status auto-updated to 'Unpaid' due to subscription expiry`
        );
      }

      if (memberStatus === 'expiring-soon' && updatedMember.reminder_sent) {
        let shouldUpdate = false;
        
        if (daysLeft === 7 && !updatedMember.reminder_sent.sevenDays) {
          console.log(`Member ${member.fullName} has 7 days left in subscription`);
          updatedMember.reminder_sent.sevenDays = true;
          shouldUpdate = true;
        } 
        
        if (daysLeft === 3 && !updatedMember.reminder_sent.threeDays) {
          console.log(`Member ${member.fullName} has 3 days left in subscription`);
          updatedMember.reminder_sent.threeDays = true;
          shouldUpdate = true;
        } 
        
        if (daysLeft === 1 && !updatedMember.reminder_sent.oneDay) {
          console.log(`Member ${member.fullName} has 1 day left in subscription`);
          updatedMember.reminder_sent.oneDay = true;
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          updateMember(member.id, { 
            reminder_sent: updatedMember.reminder_sent 
          });
        }
      }

      return updatedMember;
    });

    setMembers(updatedMembers);
  };

  return {
    members,
    loading,
    refreshMembers,
    addMember,
    removeMember,
    getMember,
    updateMember,
    filteredMembers,
    checkExpiringMemberships
  };
};
