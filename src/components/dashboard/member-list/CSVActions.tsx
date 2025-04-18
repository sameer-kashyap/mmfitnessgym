
import React, { useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CSVActionsProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const CSVActions = ({ onFileChange, onExport }: CSVActionsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        variant="outline" 
        size="sm"
        className="w-full sm:w-auto"
      >
        <Upload className="mr-2 h-4 w-4" />
        Import CSV
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".csv" 
          onChange={onFileChange}
        />
      </Button>
      <Button 
        onClick={onExport} 
        variant="outline" 
        size="sm"
        className="w-full sm:w-auto"
      >
        <FileText className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
};
