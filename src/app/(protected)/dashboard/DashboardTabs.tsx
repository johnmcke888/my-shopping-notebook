'use client';  // This tells Next.js this code runs in the browser

// Add the Link component to our imports
import Link from 'next/link';
import { usePathname } from 'next/navigation';  // This helps us know which page we're on
import React from 'react';
import { 
  Home, ShoppingCart, History, Calendar,
  Store, Gift, CreditCard, Award
} from "lucide-react";

// We don't need the onTabChange prop anymore since we're using real pages
interface DashboardTabsProps {
  activeTab?: string;  // Made optional since we'll determine active state differently
}

const DashboardTabs: React.FC<DashboardTabsProps> = () => {
  // This tells us which page the user is currently on
  const pathname = usePathname();

  // Updated our tabs array with proper page paths
  const tabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home,
      path: '/dashboard'  // The path to the home page
    },
    { 
      id: 'planner', 
      label: 'Planner', 
      icon: ShoppingCart,
      path: '/dashboard/planner'
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: History,
      path: '/dashboard/purchases'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: Calendar,
      path: '/dashboard/calendar'
    },
    { 
      id: 'portals', 
      label: 'Portals', 
      icon: Store,
      path: '/dashboard/portals'
    },
    { 
      id: 'giftcards', 
      label: 'Gift Cards', 
      icon: Gift,
      path: '/dashboard/gift-cards'  // This will link to our new gift cards page!
    },
    {
      id: 'cardrewards',
      label: 'Card Rewards',
      icon: CreditCard,
      path: '/dashboard/card-rewards'
    },
    {
      id: 'storerewards',
      label: 'Store Rewards',
      icon: Award,
      path: '/dashboard/store-rewards'
    }
  ];

  return (
    <div className="border-b">
      <div className="px-6">
        <div className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            // Check if this tab's path matches where we are
            const isActive = pathname === tab.path;
            
            return (
              // Use Link instead of button - it's like making a real doorway
              <Link
                key={tab.id}
                href={tab.path}
                className={`
                  flex items-center gap-2 px-4 py-2 
                  border-b-2 transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'border-blue-500 text-blue-500' 
                    : 'border-transparent hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardTabs;