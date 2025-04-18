import React, { useState, useRef } from "react";
import { useMembers } from "../../context/MemberContext";
import MemberCard from "./MemberCard";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, UserX, FileText, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { calculateDaysLeft, formatDate } from "../../lib/utils";
import { toast } from "../ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

const MemberList: React.FC = () => {
  const {
    filteredMembers,
    addMember
  } = useMembers();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importedMembers, setImportedMembers] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allMembers = filteredMembers('all');
  const activeMembers = filteredMembers('active');
  const expiringSoonMembers = filteredMembers('expiring-soon');
  const graceMembers = filteredMembers('grace-period');
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };
  
  const getFilteredMembers = (tab: string) => {
    let members;
    switch (tab) {
      case 'active':
        members = activeMembers;
        break;
      case 'expiring-soon':
        members = expiringSoonMembers;
        break;
      case 'grace-period':
        members = graceMembers;
        break;
      default:
        members = allMembers;
    }
    if (searchTerm) {
      return members.filter(member => 
        member.fullName.toLowerCase().includes(searchTerm) || 
        member.phone.toLowerCase().includes(searchTerm)
      );
    }
    return members;
  };
  
  const displayMembers = getFilteredMembers(activeTab);

  const exportToCSV = () => {
    const membersToExport = getFilteredMembers(activeTab);
    
    if (membersToExport.length === 0) {
      toast.error("No members to export");
      return;
    }
    
    const headers = [
      "Full Name",
      "Phone Number",
      "Subscription Duration (days)",
      "Subscription End Date",
      "Days Left",
      "Payment Status"
    ];
    
    const csvData = membersToExport.map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const endDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));
      
      return [
        member.fullName,
        member.phone,
        member.subscriptionDuration,
        formatDate(endDate.toISOString()),
        daysLeft,
        member.paymentStatus
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    link.setAttribute("href", url);
    link.setAttribute("download", `mm-fitness-members-${dateStr}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV downloaded successfully");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      parseCSV(csv);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      toast.error("CSV file appears to be empty or invalid");
      return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone'));
    const durationIndex = headers.findIndex(h => 
      h.toLowerCase().includes('duration') || 
      h.toLowerCase().includes('days') || 
      h.toLowerCase().includes('subscription')
    );
    const paymentStatusIndex = headers.findIndex(h => 
      h.toLowerCase().includes('payment') || 
      h.toLowerCase().includes('status')
    );

    if (phoneIndex === -1 || durationIndex === -1) {
      toast.error("CSV is missing required columns. Need at least Phone and Subscription Duration.");
      return;
    }

    const parsedMembers: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      
      const fullName = nameIndex !== -1 ? values[nameIndex] : `Member ${i}`;
      const phone = phoneIndex !== -1 ? values[phoneIndex] : '';
      const durationStr = durationIndex !== -1 ? values[durationIndex] : '';
      const paymentStatus = paymentStatusIndex !== -1 
        ? values[paymentStatusIndex].toLowerCase() === 'paid' ? 'paid' : 'unpaid'
        : 'unpaid';
      
      if (!phone || phone.length < 10) {
        errors.push(`Row ${i}: Invalid phone number`);
        continue;
      }
      
      const duration = parseInt(durationStr);
      if (isNaN(duration) || duration < 1 || duration > 365) {
        errors.push(`Row ${i}: Invalid subscription duration (must be 1-365)`);
        continue;
      }
      
      parsedMembers.push({
        fullName,
        phone,
        subscriptionDuration: duration,
        paymentStatus
      });
    }
    
    setImportedMembers(parsedMembers);
    setImportErrors(errors);
    setIsImportDialogOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    let importedCount = 0;
    let duplicateCount = 0;
    
    const existingPhones = new Set(allMembers.map(m => m.phone));
    
    importedMembers.forEach(member => {
      if (existingPhones.has(member.phone)) {
        duplicateCount++;
      } else {
        addMember({
          fullName: member.fullName,
          phone: member.phone,
          subscriptionDuration: member.subscriptionDuration,
          paymentStatus: member.paymentStatus
        });
        existingPhones.add(member.phone);
        importedCount++;
      }
    });
    
    setIsImportDialogOpen(false);
    setImportedMembers([]);
    setImportErrors([]);
    
    if (duplicateCount > 0) {
      toast.info(`Imported ${importedCount} members. Skipped ${duplicateCount} duplicate phone numbers.`);
    } else {
      toast.success(`Successfully imported ${importedCount} members.`);
    }
  };

  const dragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const dragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const dragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const fileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target?.result as string;
          parseCSV(csv);
        };
        reader.readAsText(file);
      } else {
        toast.error("Please upload a CSV file");
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search members..." 
            className="pl-8" 
            value={searchTerm} 
            onChange={handleSearch} 
          />
        </div>
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
              onChange={handleFileChange}
            />
          </Button>
          <Button 
            onClick={exportToCSV} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 py-0 mx-0 px-0 rounded-none">
          <TabsTrigger value="all">
            All ({allMembers.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeMembers.length})
          </TabsTrigger>
          <TabsTrigger value="expiring-soon">
            Expiring ({expiringSoonMembers.length})
          </TabsTrigger>
          <TabsTrigger value="grace-period">
            Grace ({graceMembers.length})
          </TabsTrigger>
        </TabsList>

        {['all', 'active', 'expiring-soon', 'grace-period'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {displayMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No members found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "No results match your search criteria" : "Add members to see them here"}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Members Preview</DialogTitle>
          </DialogHeader>
          
          {importErrors.length > 0 && (
            <div className="bg-red-50 p-3 rounded-md mb-4">
              <h4 className="text-red-600 font-medium mb-1">Errors in CSV File:</h4>
              <ul className="text-red-600 text-sm list-disc list-inside">
                {importErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Subscription (Days)</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedMembers.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>{member.fullName}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.subscriptionDuration}</TableCell>
                    <TableCell>{member.paymentStatus}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {importedMembers.length} members ready to import
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={confirmImport}
                disabled={importedMembers.length === 0}
                className="bg-royal-purple hover:bg-royal-light"
              >
                <Upload className="mr-2 h-4 w-4" />
                Confirm Import
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div
        onDragOver={dragOver}
        onDragEnter={dragEnter}
        onDragLeave={dragLeave}
        onDrop={fileDrop}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center pointer-events-none"
        style={{ display: 'none' }}
      >
        <div className="bg-white p-10 rounded-lg text-center">
          <Upload className="h-16 w-16 mx-auto text-royal-purple mb-4" />
          <h3 className="text-xl font-bold">Drop CSV File Here</h3>
          <p className="text-gray-500">Release to upload</p>
        </div>
      </div>
    </div>
  );
};

export default MemberList;
