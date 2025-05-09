
import { fromTable } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const dailySummaryService = {
  async getDailySummaries(): Promise<any[]> {
    try {
      const { data, error } = await fromTable('daily_summary')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching daily summaries:', error);
      toast.error('Failed to fetch daily summaries');
      return [];
    }
  },

  async getDailySummaryByDate(date: string): Promise<any | null> {
    try {
      // Use maybeSingle instead of single to handle the case where no rows are returned
      const { data, error } = await fromTable('daily_summary')
        .select('*')
        .eq('date', date)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      toast.error('Failed to fetch daily summary');
      return null;
    }
  },

  async addDailySummary(summary: any): Promise<any | null> {
    try {
      const { data, error } = await fromTable('daily_summary')
        .insert([summary])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      toast.success('Daily summary has been recorded');
      return data;
    } catch (error) {
      console.error('Error adding daily summary:', error);
      toast.error('Failed to record daily summary');
      return null;
    }
  },

  async updateDailySummary(id: string, updates: any): Promise<any | null> {
    try {
      const { data, error } = await fromTable('daily_summary')
        .update(updates)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      if (error) {
        throw error;
      }

      toast.success('Daily summary has been updated');
      return data;
    } catch (error) {
      console.error('Error updating daily summary:', error);
      toast.error('Failed to update daily summary');
      return null;
    }
  },

  async deleteDailySummary(id: string): Promise<boolean> {
    try {
      const { error } = await fromTable('daily_summary')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Daily summary has been deleted');
      return true;
    } catch (error) {
      console.error('Error deleting daily summary:', error);
      toast.error('Failed to delete daily summary');
      return false;
    }
  },
};
