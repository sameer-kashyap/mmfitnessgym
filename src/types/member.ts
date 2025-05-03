
export interface Member {
  id: string;
  full_name: string;
  phone: string;
  start_date: string;
  subscription_duration: number;
  payment_status: 'paid' | 'unpaid';
  date_of_birth?: string;
  deposit?: number;
  due?: number;
  email?: string;
  reminder_sent?: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon' | 'grace-period';

export type FilterType = 'all' | 'active' | 'expiring-soon' | 'grace-period';
