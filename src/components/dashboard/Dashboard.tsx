
import React from "react";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useMembers } from "../../context/MemberContext";
import { UserCheck, Clock, AlertTriangle, Plus, Users, IndianRupee, BarChart3, Settings } from "lucide-react";
import { AddMemberSection } from "./sections/AddMemberSection";
import { MembersSection } from "./sections/MembersSection";
import { PaymentsSection } from "./sections/PaymentsSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { Link } from "react-router-dom";
import { LogoutButton } from "../auth/LogoutButton";
import { useAuth } from "@/context/AuthContext";

const Dashboard: React.FC = () => {
  const { filteredMembers } = useMembers();
  const { user } = useAuth();
  
  const totalMembers = filteredMembers('all').length;
  const activeMembers = filteredMembers('active').length;
  const expiringSoonMembers = filteredMembers('expiring-soon').length;
  const graceMembers = filteredMembers('grace-period').length;

  return (
    <div className="dashboard-container">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-royal-purple">MM Fitness</h1>
            <p className="text-muted-foreground">Member Management Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{user?.email}</span>
            </div>
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </Link>
            <LogoutButton />
            <img
              src="/lovable-uploads/988c260d-5fb3-4221-baf8-10d17709045b.png"
              alt="MM Fitness Logo"
              className="h-16 w-auto"
            />
          </div>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              <span>Payments</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="m-0">
            <MembersSection />
          </TabsContent>

          <TabsContent value="add" className="m-0">
            <AddMemberSection />
          </TabsContent>

          <TabsContent value="payments" className="m-0">
            <PaymentsSection />
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <AnalyticsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
