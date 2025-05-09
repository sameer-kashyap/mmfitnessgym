
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const paymentService = {
  async getPayments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, members(full_name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      return [];
    }
  },

  async getPaymentsByMember(memberId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching member payments:', error);
      toast.error('Failed to fetch member payments');
      return [];
    }
  },

  async addPayment(payment: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      toast.success('Payment has been recorded');
      return data;
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to record payment');
      return null;
    }
  },

  async updatePayment(id: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      toast.success('Payment has been updated');
      return data;
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
      return null;
    }
  },

  async deletePayment(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Payment has been deleted');
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Failed to delete payment');
      return false;
    }
  },
};
