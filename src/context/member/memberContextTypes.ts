
import { Member } from "@/types/member";

export type MemberContextType = {
  members: Member[];
  addMember: (member: Omit<Member, "id" | "reminder_sent" | "email">) => void;
  removeMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  updateMember: (id: string, member: Partial<Member>) => void;
  filteredMembers: (status: 'all' | 'active' | 'expiring-soon' | 'expired' | 'grace-period') => Member[];
  loading: boolean;
  refreshMembers: () => Promise<void>;
};
