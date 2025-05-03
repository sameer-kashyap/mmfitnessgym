
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Member } from "../types/member";
import { getMemberStatus } from "../lib/utils";
import { toast } from "../components/ui/sonner";
import { memberService } from "../services/memberService";
import { calculateDaysLeft } from "@/lib/utils";

type MemberContextType = {
  members: Member[];
  addMember: (member: Omit<Member, "id" | "reminder_sent" | "email">) => void;
  removeMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  updateMember: (id: string, member: Partial<Member>) => void;
  filteredMembers: (status: 'all' | 'active' | 'expiring-soon' | 'expired' | 'grace-period') => Member[];
  loading: boolean;
  refreshMembers: () => Promise<void>;
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const fetchedMembers = await memberService.getMembers();
      setMembers(fetchedMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Could not load members");
    } finally {
      setLoading(false);
    }
  };

  // Initial load of members from Supabase
  useEffect(() => {
    refreshMembers();
  }, []);

  // Check expiring memberships and update statuses
  useEffect(() => {
    if (!members.length) return;

    const checkExpiringMemberships = () => {
      console.log("Checking for expiring memberships...");
      
      const updatedMembers = [...members].map(member => {
        const daysLeft = calculateDaysLeft(member.start_date, member.subscription_duration);
        const memberStatus = getMemberStatus(member);
        let updatedMember = { ...member };

        // Automatically set payment status to "unpaid" if expired and status is "paid"
        if (daysLeft < 0 && updatedMember.payment_status === "paid") {
          updateMember(member.id, { payment_status: "unpaid" });
          updatedMember.payment_status = "unpaid";
          toast.info(
            `${updatedMember.full_name}'s payment status auto-updated to 'Unpaid' due to subscription expiry`
          );
        }

        if (memberStatus === 'expiring-soon' && updatedMember.reminder_sent) {
          let shouldUpdate = false;
          
          if (daysLeft === 7 && !updatedMember.reminder_sent.sevenDays) {
            console.log(`Member ${member.full_name} has 7 days left in subscription`);
            updatedMember.reminder_sent.sevenDays = true;
            shouldUpdate = true;
          } 
          
          if (daysLeft === 3 && !updatedMember.reminder_sent.threeDays) {
            console.log(`Member ${member.full_name} has 3 days left in subscription`);
            updatedMember.reminder_sent.threeDays = true;
            shouldUpdate = true;
          } 
          
          if (daysLeft === 1 && !updatedMember.reminder_sent.oneDay) {
            console.log(`Member ${member.full_name} has 1 day left in subscription`);
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

    // First check immediately
    checkExpiringMemberships();

    // Schedule periodic checks
    const interval = setInterval(checkExpiringMemberships, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [members]);

  const addMember = async (memberData: Omit<Member, "id" | "reminder_sent" | "email">) => {
    const newMember = {
      ...memberData,
      reminder_sent: {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
      },
    };

    const addedMember = await memberService.addMember(newMember);
    
    if (addedMember) {
      setMembers(prev => [addedMember, ...prev]);
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
    const updatedMember = await memberService.updateMember(id, memberUpdate);
    
    if (updatedMember) {
      setMembers(prev => 
        prev.map(member => 
          member.id === id ? { ...member, ...updatedMember } : member
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

  return (
    <MemberContext.Provider value={{ 
      members, 
      addMember, 
      removeMember, 
      getMember, 
      updateMember, 
      filteredMembers,
      loading,
      refreshMembers
    }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error("useMembers must be used within a MemberProvider");
  }
  return context;
}
