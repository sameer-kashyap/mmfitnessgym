// This hook is no longer needed since we're using Supabase
// We'll keep it for reference but with minimal functionality
import { useEffect } from 'react';
import { Member } from '../types/member';

export function useLocalStorage(
  members: Member[],
  loading: boolean
) {
  // No-op as we're now using Supabase for persistence
  // This is kept only for backward compatibility
}
