
import { useEffect } from 'react';
import { Member } from '../types/member';
import { calculateDaysLeft, getMemberStatus } from '../lib/utils';
import { toast } from "../components/ui/sonner";

export function useMembershipCheck(
  members: Member[], 
  emailJSLoaded: boolean,
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>
) {
  const checkExpiringMemberships = () => {
    // Email functionality is disabled since we're no longer collecting emails
    console.log("Checking for expiring memberships...");
    
    // We're not sending emails anymore, but we're keeping the status tracking
    const updatedMembers = [...members].map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const memberStatus = getMemberStatus(member);
      let updatedMember = { ...member };

      // Automatically set payment status to "unpaid" if expired and status is "paid"
      if (daysLeft < 0 && updatedMember.paymentStatus === "paid") {
        updatedMember.paymentStatus = "unpaid";
        toast.info(
          `${updatedMember.fullName}'s payment status auto-updated to 'Unpaid' due to subscription expiry`
        );
      }

      if (memberStatus === 'expiring-soon' && updatedMember.reminderSent) {
        if (daysLeft === 7 && !updatedMember.reminderSent.sevenDays) {
          console.log(`Member ${member.fullName} has 7 days left in subscription`);
          updatedMember.reminderSent.sevenDays = true;
        } 
        
        if (daysLeft === 3 && !updatedMember.reminderSent.threeDays) {
          console.log(`Member ${member.fullName} has 3 days left in subscription`);
          updatedMember.reminderSent.threeDays = true;
        } 
        
        if (daysLeft === 1 && !updatedMember.reminderSent.oneDay) {
          console.log(`Member ${member.fullName} has 1 day left in subscription`);
          updatedMember.reminderSent.oneDay = true;
        }
      }

      return updatedMember;
    });

    setMembers(updatedMembers);
  };

  useEffect(() => {
    if (!members.length) return;

    // First check immediately
    checkExpiringMemberships();

    // Check every hour
    const interval = setInterval(() => {
      checkExpiringMemberships();

      // Check for expired memberships to remove
      const filteredMembers = [...members].filter(member => {
        const status = getMemberStatus(member);
        return status !== 'expired';
      });

      if (filteredMembers.length !== members.length) {
        toast.info(`${members.length - filteredMembers.length} expired member(s) have been automatically removed.`);
        setMembers(filteredMembers);
      }
    }, 60 * 60 * 1000);

    // Schedule daily midnight check
    const scheduleDailyCheck = () => {
      const now = new Date();
      const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
      );
      const timeUntilMidnight = night.getTime() - now.getTime();
      
      setTimeout(() => {
        console.log("Running scheduled midnight membership check");
        checkExpiringMemberships();
        scheduleDailyCheck();
      }, timeUntilMidnight);
    };
    
    scheduleDailyCheck();

    return () => clearInterval(interval);
  }, [members, emailJSLoaded]);
}

