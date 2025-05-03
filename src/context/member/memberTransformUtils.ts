
import { Member } from "@/types/member";

// Helper function to transform database records to our frontend model
export const transformMemberFromDB = (dbMember: any): Member => {
  return {
    // Required fields
    id: dbMember.id,
    
    // Snake case (DB format)
    full_name: dbMember.full_name,
    phone: dbMember.phone,
    start_date: dbMember.start_date,
    subscription_duration: dbMember.subscription_duration,
    payment_status: dbMember.payment_status as 'paid' | 'unpaid',
    date_of_birth: dbMember.date_of_birth,
    deposit: dbMember.deposit,
    due: dbMember.due,
    email: dbMember.email,
    description: dbMember.description,
    created_at: dbMember.created_at,
    updated_at: dbMember.updated_at,
    
    // Camel case (frontend format)
    fullName: dbMember.full_name,
    startDate: dbMember.start_date,
    subscriptionDuration: dbMember.subscription_duration,
    paymentStatus: dbMember.payment_status,
    dateOfBirth: dbMember.date_of_birth,
    createdAt: dbMember.created_at,
    updatedAt: dbMember.updated_at,
    
    // Special fields
    reminder_sent: dbMember.reminder_sent
  };
};

// Helper function to transform frontend model to database format
export const transformMemberToDB = (member: Partial<Member>): any => {
  const dbMember: any = {};
  
  // Handle both camelCase and snake_case properties
  // Snake case properties take precedence
  
  if (member.full_name !== undefined) dbMember.full_name = member.full_name;
  else if (member.fullName !== undefined) dbMember.full_name = member.fullName;
  
  if (member.phone !== undefined) dbMember.phone = member.phone;
  
  if (member.start_date !== undefined) dbMember.start_date = member.start_date;
  else if (member.startDate !== undefined) dbMember.start_date = member.startDate;
  
  if (member.subscription_duration !== undefined) dbMember.subscription_duration = member.subscription_duration;
  else if (member.subscriptionDuration !== undefined) dbMember.subscription_duration = member.subscriptionDuration;
  
  if (member.payment_status !== undefined) dbMember.payment_status = member.payment_status;
  else if (member.paymentStatus !== undefined) dbMember.payment_status = member.paymentStatus;
  
  if (member.date_of_birth !== undefined) dbMember.date_of_birth = member.date_of_birth;
  else if (member.dateOfBirth !== undefined) dbMember.date_of_birth = member.dateOfBirth;
  
  if (member.deposit !== undefined) dbMember.deposit = member.deposit;
  if (member.due !== undefined) dbMember.due = member.due;
  if (member.description !== undefined) dbMember.description = member.description;
  if (member.email !== undefined) dbMember.email = member.email;
  
  if (member.updated_at !== undefined) dbMember.updated_at = member.updated_at;
  else if (member.updatedAt !== undefined) dbMember.updated_at = member.updatedAt;
  
  if (member.reminder_sent !== undefined) dbMember.reminder_sent = member.reminder_sent;
  
  return dbMember;
};
