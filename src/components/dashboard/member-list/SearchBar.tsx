
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ searchTerm, onSearch }: SearchBarProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        type="search" 
        placeholder="Search members..." 
        className="pl-8" 
        value={searchTerm} 
        onChange={onSearch} 
      />
    </div>
  );
};
