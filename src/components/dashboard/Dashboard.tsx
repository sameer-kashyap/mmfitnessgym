import React from "react";
import { Separator } from "../ui/separator";
import MemberForm from "./MemberForm";
import MemberList from "./MemberList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useMembers } from "../../context/MemberContext";
import { Dumbbell, UserCheck, Clock, AlertTriangle } from "lucide-react";
const Dashboard: React.FC = () => {
  const {
    filteredMembers
  } = useMembers();
  const totalMembers = filteredMembers('all').length;
  const activeMembers = filteredMembers('active').length;
  const expiringSoonMembers = filteredMembers('expiring-soon').length;
  const graceMembers = filteredMembers('grace-period').length;
  return <div className="dashboard-container">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-royal-purple">Royal Fitness Gym</h1>
            <p className="text-muted-foreground">Member Management Dashboard</p>
          </div>
          <Dumbbell className="h-10 w-10 text-royal-purple" strokeWidth={1.5} />
        </div>
        
        <Separator />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="gym-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Members</CardDescription>
              <CardTitle className="text-2xl">{totalMembers}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCheck className="h-6 w-6 text-royal-purple opacity-70" />
            </CardContent>
          </Card>
          
          <Card className="gym-card">
            <CardHeader className="pb-2">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-2xl">{activeMembers}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCheck className="h-6 w-6 text-green-600 opacity-70" />
            </CardContent>
          </Card>
          
          <Card className="gym-card">
            <CardHeader className="pb-2">
              <CardDescription>Expiring Soon</CardDescription>
              <CardTitle className="text-2xl">{expiringSoonMembers}</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="h-6 w-6 text-amber-600 opacity-70" />
            </CardContent>
          </Card>
          
          <Card className="gym-card">
            <CardHeader className="pb-2">
              <CardDescription>Grace Period</CardDescription>
              <CardTitle className="text-2xl">{graceMembers}</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertTriangle className="h-6 w-6 text-royal-red opacity-70" />
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MemberForm />
          </div>
          
          {/* Member List */}
          <div className="lg:col-span-3">
            <Card className="gym-card">
              <CardHeader>
                <CardTitle>Member Directory</CardTitle>
                <CardDescription>
                  Manage your gym members and track their subscription status
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <MemberList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;