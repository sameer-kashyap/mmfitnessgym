
import React from "react";
import { MemberProvider } from "../context/MemberContext";
import Dashboard from "../components/dashboard/Dashboard";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <QueryClientProvider client={queryClient}>
        <MemberProvider>
          <Dashboard />
        </MemberProvider>
      </QueryClientProvider>
    </div>
  );
};

export default Index;
