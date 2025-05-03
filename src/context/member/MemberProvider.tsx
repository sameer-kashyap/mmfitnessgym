
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Member } from "@/types/member";
import { MemberContextType } from "./memberContextTypes";
import { useMemberOperations } from "./useMemberOperations";

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export function MemberProvider({ children }: { children: ReactNode }) {
  const {
    members,
    loading,
    refreshMembers,
    addMember,
    removeMember,
    getMember,
    updateMember,
    filteredMembers,
    checkExpiringMemberships
  } = useMemberOperations();

  // Initial load of members from Supabase
  useEffect(() => {
    refreshMembers();
  }, []);

  // Check expiring memberships and update statuses
  useEffect(() => {
    if (!members.length) return;

    // First check immediately
    checkExpiringMemberships();

    // Schedule periodic checks
    const interval = setInterval(checkExpiringMemberships, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [members]);

  return (
    <MemberContext.Provider value={{ 
      members, 
      addMember, 
      removeMember, 
      getMember, 
      updateMember, 
      filteredMembers,
      loading,
      refreshMembers
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
