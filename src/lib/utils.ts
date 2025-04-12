
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Member, type MemberStatus } from "../types/member"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDaysLeft(startDate: string, duration: number): number {
  const start = new Date(startDate).getTime();
  const end = start + (duration * 24 * 60 * 60 * 1000);
  const now = new Date().getTime();
  
  const daysLeft = Math.ceil((end - now) / (24 * 60 * 60 * 1000));
  return daysLeft;
}

export function getMemberStatus(member: Member): MemberStatus {
  const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
  
  if (daysLeft <= -7) {
    return 'expired'; // Beyond grace period
  } else if (daysLeft < 0) {
    return 'grace-period'; // In grace period
  } else if (daysLeft <= 7) {
    return 'expiring-soon'; // Expiring soon
  } else {
    return 'active'; // Active
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
