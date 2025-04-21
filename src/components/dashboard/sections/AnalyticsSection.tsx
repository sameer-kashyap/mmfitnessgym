
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMembers } from "@/context/MemberContext";
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval, getDay } from "date-fns";
import { TrendingUp, TrendingDown, Users, PieChart, DollarSign, Calendar } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart as ReChartPieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { calculateDaysLeft } from "@/lib/utils";

export const AnalyticsSection = () => {
  const { members } = useMembers();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const isDateInRange = (dateString: string, start: Date, end: Date) => {
    if (!dateString) return false;
    try {
      const date = parseISO(dateString);
      return isWithinInterval(date, { start, end });
    } catch (error) {
      return false;
    }
  };

  const analytics = useMemo(() => {
    const currentMonthMembers = members.filter(member => 
      member.createdAt && isDateInRange(member.createdAt, currentMonthStart, currentMonthEnd)
    );
    
    const lastMonthMembers = members.filter(member => 
      member.createdAt && isDateInRange(member.createdAt, lastMonthStart, lastMonthEnd)
    );

    const currentMonthDeposits = currentMonthMembers.reduce((total, member) => total + (member.deposit || 0), 0);
    const lastMonthDeposits = lastMonthMembers.reduce((total, member) => total + (member.deposit || 0), 0);

    const memberPercentChange = lastMonthMembers.length > 0 
      ? ((currentMonthMembers.length - lastMonthMembers.length) / lastMonthMembers.length) * 100 
      : 100;
    
    const depositPercentChange = lastMonthDeposits > 0 
      ? ((currentMonthDeposits - lastMonthDeposits) / lastMonthDeposits) * 100 
      : 100;

    const active = members.filter(m => calculateDaysLeft(m.startDate, m.subscriptionDuration) > 7).length;
    const expiringSoon = members.filter(m => {
      const days = calculateDaysLeft(m.startDate, m.subscriptionDuration);
      return days <= 7 && days > 0;
    }).length;
    const expired = members.filter(m => calculateDaysLeft(m.startDate, m.subscriptionDuration) <= 0).length;

    const totalDues = members.reduce((total, member) => total + (member.due || 0), 0);

    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    currentMonthMembers.forEach(member => {
      if (member.createdAt) {
        const day = getDay(parseISO(member.createdAt));
        dayCount[day]++;
      }
    });
    
    const bestDayIndex = dayCount.indexOf(Math.max(...dayCount));
    const bestDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bestDayIndex];

    return {
      newMembers: currentMonthMembers.length,
      totalEarnings: currentMonthDeposits,
      memberPercentChange,
      depositPercentChange,
      memberStats: [
        { name: "Active", value: active },
        { name: "Expiring Soon", value: expiringSoon },
        { name: "Expired", value: expired }
      ],
      totalDues,
      bestDay: dayCount.every(count => count === 0) ? "No data" : bestDay
    };
  }, [members, currentMonthStart, currentMonthEnd, lastMonthStart, lastMonthEnd]);

  const COLORS = ["#4ade80", "#fbbf24", "#ef4444"];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>Track your gym's performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">New Members</p>
                    <h3 className="text-2xl font-bold">{analytics.newMembers}</h3>
                    <div className="flex items-center mt-1">
                      {analytics.memberPercentChange > 0 ? (
                        <>
                          <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                          <span className="text-xs text-green-500">
                            +{analytics.memberPercentChange.toFixed(1)}% from last month
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="text-red-500 h-4 w-4 mr-1" />
                          <span className="text-xs text-red-500">
                            {analytics.memberPercentChange.toFixed(1)}% from last month
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Users className="h-10 w-10 text-muted-foreground opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <h3 className="text-2xl font-bold">₹{analytics.totalEarnings}</h3>
                    <div className="flex items-center mt-1">
                      {analytics.depositPercentChange > 0 ? (
                        <>
                          <TrendingUp className="text-green-500 h-4 w-4 mr-1" />
                          <span className="text-xs text-green-500">
                            +{analytics.depositPercentChange.toFixed(1)}% from last month
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="text-red-500 h-4 w-4 mr-1" />
                          <span className="text-xs text-red-500">
                            {analytics.depositPercentChange.toFixed(1)}% from last month
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <DollarSign className="h-10 w-10 text-muted-foreground opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Best Day for Signups</p>
                    <h3 className="text-2xl font-bold">{analytics.bestDay}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(now, 'MMMM yyyy')}
                      </span>
                    </div>
                  </div>
                  <Calendar className="h-10 w-10 text-muted-foreground opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Member Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full sm:h-[250px]">
                  <ChartContainer config={{
                    active: { color: "#4ade80" },
                    expiringSoon: { color: "#fbbf24" },
                    expired: { color: "#ef4444" },
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ReChartPieChart>
                        <Pie
                          data={analytics.memberStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="45%"
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {analytics.memberStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend 
                          layout="horizontal" 
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{
                            paddingTop: '20px',
                            fontSize: '12px'
                          }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </ReChartPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-lg">Dues Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center h-full justify-center flex-col py-8">
                  <h3 className="text-4xl font-bold mb-2 text-center">₹{analytics.totalDues}</h3>
                  <p className="text-muted-foreground text-center">Total Unpaid Dues</p>
                  <p className="text-xs text-muted-foreground mt-6 text-center">
                    {members.filter(m => (m.due || 0) > 0).length} members have outstanding dues
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
