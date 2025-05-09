
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/types/member";
import { toast } from "@/components/ui/sonner";

export const memberService = {
  async getMembers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
      return [];
    }
  },

  async addMember(member: any): Promise<any | null> {
    try {
      // Map date_of_birth to dob to match the database schema
      const memberToInsert = { ...member };
      
      if (memberToInsert.date_of_birth) {
        memberToInsert.dob = memberToInsert.date_of_birth;
        delete memberToInsert.date_of_birth;
      }
      
      // Similarly handle any other fields that might be misnamed
      if (memberToInsert.startDate && !memberToInsert.joining_date) {
        memberToInsert.joining_date = memberToInsert.startDate;
      }

      // Remove redundant camelCase properties to avoid conflicts
      delete memberToInsert.fullName;
      delete memberToInsert.dateOfBirth;
      delete memberToInsert.startDate;
      delete memberToInsert.subscriptionDuration;
      delete memberToInsert.paymentStatus;

      console.log('Inserting member with data:', memberToInsert);

      const { data, error } = await supabase
        .from('members')
        .insert([memberToInsert])
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase error adding member:", error);
        throw error;
      }

      toast.success(`${member.full_name} has been added as a member`);
      return data;
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(`Failed to add member: ${error.message || 'Unknown error'}`);
      return null;
    }
  },

  async updateMember(id: string, updates: any): Promise<any | null> {
    try {
      // Map date_of_birth to dob to match the database schema
      const updatesToApply = { ...updates };
      
      if (updatesToApply.date_of_birth) {
        updatesToApply.dob = updatesToApply.date_of_birth;
        delete updatesToApply.date_of_birth;
      }
      
      // Similarly handle any other fields that might be misnamed
      if (updatesToApply.startDate && !updatesToApply.joining_date) {
        updatesToApply.joining_date = updatesToApply.startDate;
      }
      
      // Remove redundant camelCase properties to avoid conflicts
      delete updatesToApply.fullName;
      delete updatesToApply.dateOfBirth;
      delete updatesToApply.startDate;
      delete updatesToApply.subscriptionDuration;
      delete updatesToApply.paymentStatus;

      const { data, error } = await supabase
        .from('members')
        .update(updatesToApply)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase error updating member:", error);
        throw error;
      }

      toast.success('Member details updated');
      return data;
    } catch (error: any) {
      console.error('Error updating member:', error);
      toast.error(`Failed to update member: ${error.message || 'Unknown error'}`);
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
        console.error("Supabase error deleting member:", error);
        throw error;
      }

      toast.success('Member has been removed');
      return true;
    } catch (error: any) {
      console.error('Error deleting member:', error);
      toast.error(`Failed to delete member: ${error.message || 'Unknown error'}`);
      return false;
    }
  },
};
