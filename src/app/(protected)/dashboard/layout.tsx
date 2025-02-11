'use client';

import React from 'react';
import DashboardTabs from './DashboardTabs';
import { UserButton, useUser } from "@clerk/nextjs";

// Add children to the props
const Dashboard = ({
  children,  // This lets the layout know what page to show
}: {
  children: React.ReactNode
}) => {
  // Get the user's information from Clerk
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar with user profile */}
      <nav className="border-b p-4 flex justify-between items-center bg-white">
        <h1 className="text-xl font-bold">My Shopping Notebook</h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-600">
              {user.primaryEmailAddress?.emailAddress}
            </span>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Tab navigation */}
      <DashboardTabs />

      {/* Main content area */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default Dashboard;