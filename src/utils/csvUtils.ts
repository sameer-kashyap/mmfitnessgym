
import { Member } from '@/types/member';
import { calculateDaysLeft, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

/**
 * Parses CSV text into member data
 */
export const parseCSV = (csvText: string) => {
  const lines = csvText.split('\n');
  if (lines.length < 2) {
    toast.error("CSV file appears to be empty or invalid");
    return { parsedMembers: [], errors: [] };
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
  const startDateIndex = headers.findIndex(h => 
    h.toLowerCase().includes('joining') || 
    h.toLowerCase().includes('start')
  );

  if (phoneIndex === -1 || durationIndex === -1) {
    toast.error("CSV is missing required columns. Need at least Phone and Subscription Duration.");
    return { parsedMembers: [], errors: [] };
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
    let startDate = new Date().toISOString().split('T')[0];
    if (startDateIndex !== -1 && values[startDateIndex]) {
      try {
        const dateParts = values[startDateIndex].split('/');
        if (dateParts.length === 3) {
          const parsedDate = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0])
          );
          if (!isNaN(parsedDate.getTime())) {
            startDate = parsedDate.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        errors.push(`Row ${i}: Invalid joining date format, using today's date`);
      }
    }
    
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
      full_name: fullName,
      phone,
      subscriptionDuration: duration,
      subscription_duration: duration,
      paymentStatus,
      payment_status: paymentStatus,
      startDate,
      start_date: startDate
    });
  }
  
  return { parsedMembers, errors };
};

/**
 * Exports members data to CSV file
 */
export const exportToCSV = (members: Member[]) => {
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
