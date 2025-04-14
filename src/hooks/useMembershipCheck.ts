
import { useEffect } from 'react';
import { Member } from '../types/member';
import { calculateDaysLeft, getMemberStatus } from '../lib/utils';
import { sendPaymentReminderEmail } from '../lib/email';
import { toast } from "../components/ui/sonner";

export function useMembershipCheck(
  members: Member[], 
  emailJSLoaded: boolean,
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>
) {
  const checkExpiringMemberships = () => {
    if (!emailJSLoaded) return;

    console.log("Checking for expiring memberships...");
    const updatedMembers = [...members].map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const memberStatus = getMemberStatus(member);
      let updatedMember = { ...member };

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
