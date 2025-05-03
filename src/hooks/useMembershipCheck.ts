
import { useEffect } from 'react';
import { Member } from '../types/member';
import { calculateDaysLeft, getMemberStatus } from '../lib/utils';
import { toast } from "../components/ui/sonner";
import { notificationService } from '../services/notificationService';

export function useMembershipCheck(
  members: Member[], 
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>
) {
  const checkExpiringMemberships = async () => {
    console.log("Checking for expiring memberships...");
    
    const updatedMembers = [...members].map(member => {
      const daysLeft = calculateDaysLeft(member.start_date, member.subscription_duration);
      const memberStatus = getMemberStatus(member);
      let updatedMember = { ...member };
      let shouldSendExpiryNotification = false;

      // Automatically set payment status to "unpaid" if expired and status is "paid"
      if (daysLeft < 0 && updatedMember.payment_status === "paid") {
        updatedMember.payment_status = "unpaid";
        toast.info(
          `${updatedMember.full_name}'s payment status auto-updated to 'Unpaid' due to subscription expiry`
        );
      }

      if (memberStatus === 'expiring-soon' && updatedMember.reminder_sent) {
        if (daysLeft === 7 && !updatedMember.reminder_sent.sevenDays) {
          console.log(`Member ${member.full_name} has 7 days left in subscription`);
          updatedMember.reminder_sent.sevenDays = true;
          shouldSendExpiryNotification = true;
        } 
        
        if (daysLeft === 3 && !updatedMember.reminder_sent.threeDays) {
          console.log(`Member ${member.full_name} has 3 days left in subscription`);
          updatedMember.reminder_sent.threeDays = true;
          shouldSendExpiryNotification = true;
        } 
        
        if (daysLeft === 1 && !updatedMember.reminder_sent.oneDay) {
          console.log(`Member ${member.full_name} has 1 day left in subscription`);
          updatedMember.reminder_sent.oneDay = true;
          shouldSendExpiryNotification = true;
        }
      }
      
      // Send WhatsApp notification for expiring membership
      if (shouldSendExpiryNotification) {
        notificationService.sendExpiryAlert(updatedMember);
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
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [members]);
}
