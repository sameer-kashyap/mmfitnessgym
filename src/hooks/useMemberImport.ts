
import { useState } from 'react';
import { Member } from '@/types/member';
import { useMembers } from '@/context/MemberContext';
import { toast } from '@/components/ui/sonner';

export const useMemberImport = (members: Member[]) => {
  const { addMember } = useMembers();
  
  const confirmImport = (importedMembers: any[]) => {
    let importedCount = 0;
    let duplicateCount = 0;
    
    const existingPhones = new Set(members.map(m => m.phone));
    
    importedMembers.forEach(member => {
      if (existingPhones.has(member.phone)) {
        duplicateCount++;
      } else {
        addMember({
          fullName: member.fullName,
          full_name: member.fullName,
          phone: member.phone,
          subscriptionDuration: member.subscriptionDuration,
          subscription_duration: member.subscriptionDuration,
          paymentStatus: member.paymentStatus,
          payment_status: member.paymentStatus,
          startDate: member.startDate,
          start_date: member.startDate
        });
        existingPhones.add(member.phone);
        importedCount++;
      }
    });
    
    if (duplicateCount > 0) {
      toast.info(`Imported ${importedCount} members. Skipped ${duplicateCount} duplicate phone numbers.`);
    } else {
      toast.success(`Successfully imported ${importedCount} members.`);
    }
    
    return { importedCount, duplicateCount };
  };

  return { confirmImport };
};
