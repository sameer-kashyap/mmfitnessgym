
import { Member } from '@/types/member';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useMemberImport } from '@/hooks/useMemberImport';
import { exportToCSV } from '@/utils/csvUtils';

export const useCSVOperations = (members: Member[]) => {
  const {
    importedMembers,
    importErrors,
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleFileChange,
    setImportedMembers,
    setImportErrors
  } = useFileUpload();
  
  const { confirmImport } = useMemberImport(members);

  const handleConfirmImport = () => {
    confirmImport(importedMembers);
    setIsImportDialogOpen(false);
    setImportedMembers([]);
    setImportErrors([]);
  };

  const handleExportToCSV = () => {
    exportToCSV(members);
  };

  return {
    isImportDialogOpen,
    setIsImportDialogOpen,
    importedMembers,
    importErrors,
    handleFileChange,
    exportToCSV: handleExportToCSV,
    confirmImport: handleConfirmImport
  };
};
