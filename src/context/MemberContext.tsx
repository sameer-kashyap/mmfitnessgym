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

// Helper function to transform database records to our frontend model
const transformMemberFromDB = (dbMember: any): Member => {
  return {
    // Required fields
    id: dbMember.id,
    
    // Snake case (DB format)
    full_name: dbMember.full_name,
    phone: dbMember.phone,
    start_date: dbMember.start_date,
    subscription_duration: dbMember.subscription_duration,
    payment_status: dbMember.payment_status as 'paid' | 'unpaid',
    date_of_birth: dbMember.date_of_birth,
    deposit: dbMember.deposit,
    due: dbMember.due,
    email: dbMember.email,
    description: dbMember.description,
    created_at: dbMember.created_at,
    updated_at: dbMember.updated_at,
    
    // Camel case (frontend format)
    fullName: dbMember.full_name,
    startDate: dbMember.start_date,
    subscriptionDuration: dbMember.subscription_duration,
    paymentStatus: dbMember.payment_status,
    dateOfBirth: dbMember.date_of_birth,
    createdAt: dbMember.created_at,
    updatedAt: dbMember.updated_at,
    
    // Special fields
    reminder_sent: dbMember.reminder_sent
  };
};

// Helper function to transform frontend model to database format
const transformMemberToDB = (member: Partial<Member>): any => {
  const dbMember: any = {};
  
  // Handle both camelCase and snake_case properties
  // Snake case properties take precedence
  
  if (member.full_name !== undefined) dbMember.full_name = member.full_name;
  else if (member.fullName !== undefined) dbMember.full_name = member.fullName;
  
  if (member.phone !== undefined) dbMember.phone = member.phone;
  
  if (member.start_date !== undefined) dbMember.start_date = member.start_date;
  else if (member.startDate !== undefined) dbMember.start_date = member.startDate;
  
  if (member.subscription_duration !== undefined) dbMember.subscription_duration = member.subscription_duration;
  else if (member.subscriptionDuration !== undefined) dbMember.subscription_duration = member.subscriptionDuration;
  
  if (member.payment_status !== undefined) dbMember.payment_status = member.payment_status;
  else if (member.paymentStatus !== undefined) dbMember.payment_status = member.paymentStatus;
  
  if (member.date_of_birth !== undefined) dbMember.date_of_birth = member.date_of_birth;
  else if (member.dateOfBirth !== undefined) dbMember.date_of_birth = member.dateOfBirth;
  
  if (member.deposit !== undefined) dbMember.deposit = member.deposit;
  if (member.due !== undefined) dbMember.due = member.due;
  if (member.description !== undefined) dbMember.description = member.description;
  
  if (member.updated_at !== undefined) dbMember.updated_at = member.updated_at;
  else if (member.updatedAt !== undefined) dbMember.updated_at = member.updatedAt;
  
  if (member.reminder_sent !== undefined) dbMember.reminder_sent = member.reminder_sent;
  
  return dbMember;
};

export function MemberProvider({ children }: { children: ReactNode }) {
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
