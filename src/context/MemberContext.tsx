import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Member } from "../types/member";
import { generateId, getMemberStatus } from "../lib/utils";
import { toast } from "../components/ui/sonner";
import { useEmailJS } from "../hooks/useEmailJS";
import { useMembershipCheck } from "../hooks/useMembershipCheck";
import { useLocalStorage } from "../hooks/useLocalStorage";

type MemberContextType = {
  members: Member[];
  addMember: (member: Omit<Member, "id" | "reminderSent" | "email">) => void;
  removeMember: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  updateMember: (id: string, member: Partial<Member>) => void;
  filteredMembers: (status: 'all' | 'active' | 'expiring-soon' | 'expired' | 'grace-period') => Member[];
  loading: boolean;
};

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const emailJSLoaded = useEmailJS();

  // Initialize members from localStorage
  useEffect(() => {
    const savedMembers = localStorage.getItem("gym-members");
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }
    setLoading(false);
  }, []);

  // Hook for checking memberships
  useMembershipCheck(members, emailJSLoaded, setMembers);

  // Hook for localStorage sync
  useLocalStorage(members, loading);

  const addMember = (memberData: Omit<Member, "id" | "reminderSent" | "email">) => {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
      reminderSent: {
        sevenDays: false,
        threeDays: false,
        oneDay: false,
      },
    };

    setMembers(prev => [...prev, newMember]);
    
    toast.success(`${newMember.fullName} has been added as a member`);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id));
    toast.success("Member has been removed");
  };

  const getMember = (id: string) => {
    return members.find(member => member.id === id);
  };

  const updateMember = (id: string, memberUpdate: Partial<Member>) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, ...memberUpdate } : member
      )
    );
    toast.success("Member details updated");
  };

  const filteredMembers = (status: 'all' | 'active' | 'expiring-soon' | 'expired' | 'grace-period') => {
    if (status === 'all') return members;
    
    return members.filter(member => {
      const memberStatus = getMemberStatus(member);
      return memberStatus === status;
    });
  };

  return (
    <MemberContext.Provider value={{ 
      members, 
      addMember, 
      removeMember, 
      getMember, 
      updateMember, 
      filteredMembers,
      loading
    }}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MemberContext);
  if (context === undefined) {
    throw new Error("useMembers must be used within a MemberProvider");
  }
  return context;
}
