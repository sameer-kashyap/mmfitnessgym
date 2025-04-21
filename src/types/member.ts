
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
  email?: string; // Make email optional as we're phasing it out
  reminderSent?: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
  createdAt?: string; // Add timestamp for analytics
  updatedAt?: string; // Add timestamp for analytics
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon' | 'grace-period';

export type FilterType = 'all' | 'active' | 'expiring-soon' | 'grace-period';
