
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Member } from "@/types/member";

// Track sent messages to prevent duplicates
const sentMessages = new Set<string>();

export const notificationService = {
  async sendNewMemberAlert(member: Member): Promise<boolean> {
    try {
      // Check if we've already sent a message to this member
      const messageKey = `new-member-${member.id}`;
      if (sentMessages.has(messageKey)) {
        console.log('Message already sent to this member, skipping duplicate');
        return true;
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          memberName: member.full_name || member.fullName,
          phoneNumber: member.phone || member.phone_number,
          messageType: 'new-member'
        }
      });

      if (error) {
        throw error;
      }

      // Mark this message as sent
      sentMessages.add(messageKey);
      
      console.log('New member notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending new member notification:', error);
      return false;
    }
  },

  async sendExpiryAlert(member: Member): Promise<boolean> {
    try {
      // Create a unique key for this message type
      const messageKey = `expiry-${member.id}`;
      if (sentMessages.has(messageKey)) {
        console.log('Expiry alert already sent to this member, skipping duplicate');
        return true;
      }
      
      // Calculate expiry date
      const startDate = new Date(member.start_date || member.startDate);
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + (member.subscription_duration || member.subscriptionDuration));
      
      const formattedExpiryDate = format(expiryDate, 'dd/MM/yyyy');
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          memberName: member.full_name || member.fullName,
          phoneNumber: member.phone || member.phone_number,
          messageType: 'expiry',
          expiryDate: formattedExpiryDate
        }
      });

      if (error) {
        throw error;
      }

      // Mark this message as sent
      sentMessages.add(messageKey);

      console.log('Expiry notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending expiry notification:', error);
      return false;
    }
  },

  async sendCustomMessage(phoneNumber: string, name: string, message: string): Promise<boolean> {
    try {
      // Basic validation
      if (!phoneNumber || !message) {
        throw new Error("Phone number and message are required");
      }
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          memberName: name,
          phoneNumber: phoneNumber,
          message: message
        }
      });

      if (error) {
        throw error;
      }

      console.log('Custom notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return false;
    }
  },
  
  // Clear message tracking (useful for testing)
  clearMessageTracking(): void {
    sentMessages.clear();
  }
};
