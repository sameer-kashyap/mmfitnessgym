
import { useEffect } from 'react';
import { Member } from '../types/member';

export function useLocalStorage(
  members: Member[],
  loading: boolean
) {
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("gym-members", JSON.stringify(members));
    }
  }, [members, loading]);
}
