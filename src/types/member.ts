
export interface Member {
  id: string;
  fullName: string;
  phone: string;
  startDate: string;
  subscriptionDuration: number;
  paymentStatus: 'paid' | 'unpaid';
  dateOfBirth?: string;
  email?: string; // Make email optional as we're phasing it out
  reminderSent?: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
}

export type MemberStatus = 'active' | 'expired' | 'expiring-soon' | 'grace-period';

export type FilterType = 'all' | 'active' | 'expiring-soon' | 'grace-period';
