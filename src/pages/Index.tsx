
import React from "react";
import { MemberProvider } from "../context/MemberContext";
import Dashboard from "../components/dashboard/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MemberProvider>
        <Dashboard />
      </MemberProvider>
    </div>
  );
};

export default Index;
