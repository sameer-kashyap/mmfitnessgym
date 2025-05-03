
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types/member";
import { toast } from "@/components/ui/sonner";

export const memberService = {
  async getMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
      return [];
    }
  },

  async addMember(member: Omit<Member, 'id'>): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([member])
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      toast.success(`${member.full_name} has been added as a member`);
      return data;
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
      return null;
    }
  },

  async updateMember(id: string, updates: Partial<Member>): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      toast.success('Member details updated');
      return data;
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
      return null;
    }
  },

  async deleteMember(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Member has been removed');
      return true;
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
      return false;
    }
  },
};
