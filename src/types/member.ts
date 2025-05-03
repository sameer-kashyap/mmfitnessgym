export interface Member {
  id: string;
  
  // We'll keep both naming conventions for compatibility during transition
  // CamelCase properties (for frontend components)
  fullName: string;
  phone: string;
  startDate: string;
  subscriptionDuration: number;
  paymentStatus: 'paid' | 'unpaid';
  dateOfBirth?: string;
  deposit?: number;
  due?: number;
  email?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Snake_case properties (for database interaction)
  full_name: string;
  start_date: string;
  subscription_duration: number;
  payment_status: 'paid' | 'unpaid';
  date_of_birth?: string;
  deposit?: number;
  due?: number;
  created_at?: string;
  updated_at?: string;
  
  // Special properties
  reminder_sent?: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon' | 'grace-period';

export type FilterType = 'all' | 'active' | 'expiring-soon' | 'grace-period';
