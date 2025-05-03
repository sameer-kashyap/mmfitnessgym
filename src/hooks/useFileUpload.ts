
import { useState } from 'react';
import { parseCSV } from '@/utils/csvUtils';

export const useFileUpload = () => {
  const [importedMembers, setImportedMembers] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const { parsedMembers, errors } = parseCSV(csv);
      
      setImportedMembers(parsedMembers);
      setImportErrors(errors);
      setIsImportDialogOpen(true);
    };
    reader.readAsText(file);
  };

  return {
    importedMembers,
    importErrors,
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleFileChange,
    setImportedMembers,
    setImportErrors
  };
};
