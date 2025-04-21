
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
  reminderSent?: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
  description?: string; // Add description field
  createdAt?: string;
  updatedAt?: string;
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon' | 'grace-period';

export type FilterType = 'all' | 'active' | 'expiring-soon' | 'grace-period';
