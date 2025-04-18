
import { useState, useRef } from 'react';
import { Member } from '@/types/member';
import { useMembers } from '@/context/MemberContext';
import { toast } from '@/components/ui/sonner';
import { calculateDaysLeft, formatDate } from '@/lib/utils';

export const useCSVOperations = (members: Member[]) => {
  const { addMember } = useMembers();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importedMembers, setImportedMembers] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      toast.error("CSV file appears to be empty or invalid");
      return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone'));
    const durationIndex = headers.findIndex(h => 
      h.toLowerCase().includes('duration') || 
      h.toLowerCase().includes('days') || 
      h.toLowerCase().includes('subscription')
    );
    const paymentStatusIndex = headers.findIndex(h => 
      h.toLowerCase().includes('payment') || 
      h.toLowerCase().includes('status')
    );

    if (phoneIndex === -1 || durationIndex === -1) {
      toast.error("CSV is missing required columns. Need at least Phone and Subscription Duration.");
      return;
    }

    const parsedMembers: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      
      const fullName = nameIndex !== -1 ? values[nameIndex] : `Member ${i}`;
      const phone = phoneIndex !== -1 ? values[phoneIndex] : '';
      const durationStr = durationIndex !== -1 ? values[durationIndex] : '';
      const paymentStatus = paymentStatusIndex !== -1 
        ? values[paymentStatusIndex].toLowerCase() === 'paid' ? 'paid' : 'unpaid'
        : 'unpaid';
      
      if (!phone || phone.length < 10) {
        errors.push(`Row ${i}: Invalid phone number`);
        continue;
      }
      
      const duration = parseInt(durationStr);
      if (isNaN(duration) || duration < 1 || duration > 365) {
        errors.push(`Row ${i}: Invalid subscription duration (must be 1-365)`);
        continue;
      }
      
      parsedMembers.push({
        fullName,
        phone,
        subscriptionDuration: duration,
        paymentStatus
      });
    }
    
    setImportedMembers(parsedMembers);
    setImportErrors(errors);
    setIsImportDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    if (members.length === 0) {
      toast.error("No members to export");
      return;
    }
    
    const headers = [
      "Full Name",
      "Phone Number",
      "Subscription Duration (days)",
      "Subscription End Date",
      "Days Left",
      "Payment Status"
    ];
    
    const csvData = members.map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const endDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));
      
      return [
        member.fullName,
        member.phone,
        member.subscriptionDuration,
        formatDate(endDate.toISOString()),
        daysLeft,
        member.paymentStatus
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `mm-fitness-members-${dateStr}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV downloaded successfully");
  };

  const confirmImport = () => {
    let importedCount = 0;
    let duplicateCount = 0;
    
    const existingPhones = new Set(members.map(m => m.phone));
    
    importedMembers.forEach(member => {
      if (existingPhones.has(member.phone)) {
        duplicateCount++;
      } else {
        addMember({
          fullName: member.fullName,
          phone: member.phone,
          subscriptionDuration: member.subscriptionDuration,
          paymentStatus: member.paymentStatus
        });
        existingPhones.add(member.phone);
        importedCount++;
      }
    });
    
    setIsImportDialogOpen(false);
    setImportedMembers([]);
    setImportErrors([]);
    
    if (duplicateCount > 0) {
      toast.info(`Imported ${importedCount} members. Skipped ${duplicateCount} duplicate phone numbers.`);
    } else {
      toast.success(`Successfully imported ${importedCount} members.`);
    }
  };

  return {
    isImportDialogOpen,
    setIsImportDialogOpen,
    importedMembers,
    importErrors,
    handleFileChange,
    exportToCSV,
    confirmImport
  };
};
