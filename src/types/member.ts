
export type PaymentStatus = 'paid' | 'unpaid';

export type MemberStatus = 'active' | 'expiring-soon' | 'expired' | 'grace-period';

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subscriptionDuration: number; // in days
  startDate: string; // ISO date string
  paymentStatus: PaymentStatus;
  reminderSent: {
    sevenDays: boolean;
    threeDays: boolean;
    oneDay: boolean;
  };
}

