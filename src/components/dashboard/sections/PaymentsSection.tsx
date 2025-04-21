
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMembers } from "@/context/MemberContext";

export const PaymentsSection = () => {
  const { members } = useMembers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Overview</CardTitle>
        <CardDescription>Track member payments and dues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{member.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  Status: {member.paymentStatus}
                </p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Deposit</p>
                  <p className="font-semibold">₹{member.deposit || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due</p>
                  <p className="font-semibold text-destructive">
                    ₹{member.due || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
