'use client';

import { useAuth } from "@clerk/nextjs";  // Changed this line!

export default function DashboardPage() {
  const { userId } = useAuth();  // Changed this line!
  
  console.log('Dashboard rendering with userId:', userId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      <div className="grid gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-2">Quick Actions</h2>
          <p>Your shopping tools will appear here...</p>
        </div>
      </div>
    </div>
  );
}