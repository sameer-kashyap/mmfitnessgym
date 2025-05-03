
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Member } from "@/types/member";

export const notificationService = {
  async sendNewMemberAlert(member: Member): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          memberName: member.full_name,
          phoneNumber: member.phone,
          messageType: 'new-member'
        }
      });

      if (error) {
        throw error;
      }

      console.log('New member notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending new member notification:', error);
      return false;
    }
  },

  async sendExpiryAlert(member: Member): Promise<boolean> {
    try {
      // Calculate expiry date
      const startDate = new Date(member.start_date);
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + member.subscription_duration);
      
      const formattedExpiryDate = format(expiryDate, 'dd/MM/yyyy');
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          memberName: member.full_name,
          phoneNumber: member.phone,
          messageType: 'expiry',
          expiryDate: formattedExpiryDate
        }
      });

      if (error) {
        throw error;
      }

      console.log('Expiry notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error sending expiry notification:', error);
      return false;
    }
  }
};
