
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Member } from "../types/member";
import { calculateDaysLeft, generateId, getMemberStatus } from "../lib/utils";
import { sendWelcomeEmail, sendPaymentReminderEmail } from "../lib/email";
import { toast } from "../components/ui/sonner";

type MemberContextType = {
  members: Member[];
  addMember: (member: Omit<Member, "id" | "startDate" | "reminderSent">) => void;
  removeMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  updateMember: (id: string, member: Partial<Member>) => void;
  filteredMembers: (status: 'all' | 'active' | 'expiring-soon' | 'expired' | 'grace-period') => Member[];
  loading: boolean;
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailJSLoaded, setEmailJSLoaded] = useState(false);

  useEffect(() => {
    const loadMembers = () => {
      const savedMembers = localStorage.getItem("gym-members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
      setLoading(false);
    };

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      console.log("EmailJS script loaded");
      window.emailjs.init("H-8V_wOp5vS_BD8gO");
      setEmailJSLoaded(true);
      loadMembers();
    };
    script.onerror = () => {
      console.error("Failed to load EmailJS");
      toast.error("Failed to load email service");
      loadMembers();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Function to check for expiring memberships and send reminders
  const checkExpiringMemberships = () => {
    if (!emailJSLoaded) return;

    console.log("Checking for expiring memberships...");
    const updatedMembers = [...members].map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const memberStatus = getMemberStatus(member);
      let updatedMember = { ...member };

      // Check specifically for 7, 3, and 1 days left
      if (memberStatus === 'expiring-soon') {
        if (daysLeft === 7 && !member.reminderSent.sevenDays) {
          console.log(`Sending 7-day reminder to ${member.fullName} (${member.email})`);
          sendPaymentReminderEmail(member, 7)
            .then(success => {
              if (success) {
                console.log(`Successfully sent 7-day reminder to ${member.email}`);
              }
            });
          updatedMember.reminderSent.sevenDays = true;
        } 
        
        if (daysLeft === 3 && !member.reminderSent.threeDays) {
          console.log(`Sending 3-day reminder to ${member.fullName} (${member.email})`);
          sendPaymentReminderEmail(member, 3)
            .then(success => {
              if (success) {
                console.log(`Successfully sent 3-day reminder to ${member.email}`);
              }
            });
          updatedMember.reminderSent.threeDays = true;
        } 
        
        if (daysLeft === 1 && !member.reminderSent.oneDay) {
          console.log(`Sending 1-day reminder to ${member.fullName} (${member.email})`);
          sendPaymentReminderEmail(member, 1)
            .then(success => {
              if (success) {
                console.log(`Successfully sent 1-day reminder to ${member.email}`);
              }
            });
          updatedMember.reminderSent.oneDay = true;
        }
      }

      return updatedMember;
    });

    // Update members with updated reminder status
    setMembers(updatedMembers);
  };

  // Set up scheduled function to check expiring memberships daily
  useEffect(() => {
    if (loading) return;

    // First check immediately when the component loads
    checkExpiringMemberships();

    // Then set up an interval to check regularly (every hour)
    const interval = setInterval(() => {
      checkExpiringMemberships();

      // Also check for expired memberships to remove
      const filteredMembers = [...members].filter(member => {
        const status = getMemberStatus(member);
        return status !== 'expired';
      });

      if (filteredMembers.length !== members.length) {
        toast.info(`${members.length - filteredMembers.length} expired member(s) have been automatically removed.`);
        setMembers(filteredMembers);
      }
      
    }, 60 * 60 * 1000); // Check every hour

    // Also check once daily at midnight for new day triggers
    const scheduleDailyCheck = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // tomorrow
        0, 0, 0 // at 00:00:00
      );
      const timeUntilMidnight = night.getTime() - now.getTime();
      
      setTimeout(() => {
        console.log("Running scheduled midnight membership check");
        checkExpiringMemberships();
        scheduleDailyCheck(); // Schedule the next day's check
      }, timeUntilMidnight);
    };
    
    scheduleDailyCheck();

    return () => clearInterval(interval);
  }, [members, loading, emailJSLoaded]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("gym-members", JSON.stringify(members));
    }
  }, [members, loading]);

  const addMember = (memberData: Omit<Member, "id" | "startDate" | "reminderSent">) => {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
      startDate: new Date().toISOString(),
      reminderSent: {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
      },
    };

    setMembers(prev => [...prev, newMember]);
    
    console.log("Attempting to send welcome email to:", newMember.email);
    if (emailJSLoaded) {
      sendWelcomeEmail(newMember)
        .then(success => {
          if (!success) {
            console.error("Failed to send welcome email");
          }
        });
    } else {
      console.error("EmailJS not loaded, can't send welcome email");
      toast.error("Email service not ready, welcome email could not be sent");
    }
    
    toast.success(`${newMember.fullName} has been added as a member`);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id));
    toast.success("Member has been removed");
  };

  const getMember = (id: string) => {
    return members.find(member => member.id === id);
  };

  const updateMember = (id: string, memberUpdate: Partial<Member>) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, ...memberUpdate } : member
      )
    );
    toast.success("Member details updated");
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
      loading
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
