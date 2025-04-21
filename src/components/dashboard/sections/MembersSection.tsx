
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import MemberList from "../MemberList";

export const MembersSection = () => {
  return (
    <Card>
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
  );
};
