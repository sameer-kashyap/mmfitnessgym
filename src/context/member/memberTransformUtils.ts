
import { Member } from "@/types/member";
import { calculateDaysLeft } from "@/lib/utils";

export const transformMemberFromDB = (dbMember: any): Member => {
  const member: Member = {
    // ID fields
    id: dbMember.id,
    
    // CamelCase (frontend) properties
    fullName: dbMember.full_name,
    phone: dbMember.phone,
    startDate: dbMember.joining_date,
    subscriptionDuration: dbMember.subscription_duration,
    paymentStatus: dbMember.payment_status,
    dateOfBirth: dbMember.dob, // Map from dob to dateOfBirth
    description: dbMember.description,
    email: dbMember.email,
    createdAt: dbMember.created_at,
    updatedAt: dbMember.updated_at,
    
    // Snake_case (DB) properties
    full_name: dbMember.full_name,
    start_date: dbMember.joining_date,
    subscription_duration: dbMember.subscription_duration,
    payment_status: dbMember.payment_status,
    date_of_birth: dbMember.dob, // Map from dob to date_of_birth
    deposit: dbMember.deposit,
    due: dbMember.due,
    created_at: dbMember.created_at,
    updated_at: dbMember.updated_at,
    
    // Special properties
    reminder_sent: dbMember.reminder_sent || {
      sevenDays: false,
      threeDays: false,
      oneDay: false,
    }
  };
  
  return member;
};

export const transformMemberToDB = (member: Partial<Member>): any => {
  const dbMember: any = {};
  
  // ID fields (if present)
  if (member.id) dbMember.id = member.id;
  
  // Map all relevant fields to snake_case for DB
  if (member.fullName || member.full_name) dbMember.full_name = member.fullName || member.full_name;
  if (member.phone) dbMember.phone = member.phone;
  if (member.startDate || member.start_date) dbMember.joining_date = member.startDate || member.start_date;
  if (member.subscriptionDuration || member.subscription_duration) dbMember.subscription_duration = member.subscriptionDuration || member.subscription_duration;
  if (member.paymentStatus || member.payment_status) dbMember.payment_status = member.paymentStatus || member.payment_status;
  if (member.dateOfBirth || member.date_of_birth) dbMember.dob = member.dateOfBirth || member.date_of_birth;
  if (member.description) dbMember.description = member.description;
  if (member.deposit) dbMember.deposit = member.deposit;
  if (member.due) dbMember.due = member.due;
  if (member.reminder_sent) dbMember.reminder_sent = member.reminder_sent;
  
  return dbMember;
};
