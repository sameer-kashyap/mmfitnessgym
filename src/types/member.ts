export interface Member {
  id: string;
  fullName: string;
  phone: string;
  startDate: string;
  subscriptionDuration: number;
  paymentStatus: 'paid' | 'unpaid';
  dateOfBirth?: string;
  deposit?: number;
  due?: number;
  email?: string;
  reminder_sent?: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Keep the original database field names for compatibility with Supabase
  full_name?: string;
  start_date?: string;
  subscription_duration?: number;
  payment_status?: 'paid' | 'unpaid';
  date_of_birth?: string;
  created_at?: string;
  updated_at?: string;
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon' | 'grace-period';

export type FilterType = 'all' | 'active' | 'expiring-soon' | 'grace-period';
