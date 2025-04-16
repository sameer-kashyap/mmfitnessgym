
import React, { useState } from "react";
import { useMembers } from "../../context/MemberContext";
import MemberCard from "./MemberCard";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Search, UserX, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { calculateDaysLeft, formatDate } from "../../lib/utils";
import { toast } from "../ui/sonner";

const MemberList: React.FC = () => {
  const {
    filteredMembers
  } = useMembers();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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
      return members.filter(member => member.fullName.toLowerCase().includes(searchTerm) || member.email.toLowerCase().includes(searchTerm) || member.phone.toLowerCase().includes(searchTerm));
    }
    return members;
  };
  
  const displayMembers = getFilteredMembers(activeTab);
  
  const exportToCSV = () => {
    // Get the currently displayed members based on active tab and search
    const membersToExport = getFilteredMembers(activeTab);
    
    if (membersToExport.length === 0) {
      toast.error("No members to export");
      return;
    }
    
    // Define CSV headers
    const headers = [
      "Full Name",
      "Email Address",
      "Phone Number",
      "Subscription Duration (days)",
      "Subscription End Date",
      "Days Left",
      "Payment Status"
    ];
    
    // Format data for CSV
    const csvData = membersToExport.map(member => {
      const daysLeft = calculateDaysLeft(member.startDate, member.subscriptionDuration);
      const endDate = new Date(new Date(member.startDate).getTime() + (member.subscriptionDuration * 24 * 60 * 60 * 1000));
      
      return [
        member.fullName,
        member.email,
        member.phone,
        member.subscriptionDuration,
        formatDate(endDate.toISOString()),
        daysLeft,
        member.paymentStatus
      ];
    });
    
    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
    
    // Create a blob with the CSV data
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a download link and trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Get current date for filename
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    link.setAttribute("href", url);
    link.setAttribute("download", `royal-fitness-members-${dateStr}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV downloaded successfully");
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
    </div>
  );
};

export default MemberList;
