'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Camera, Map as MapIcon, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Feed', href: '/feed', icon: Bell },
    { name: 'Report', href: '/report', icon: Camera },
    { name: 'Map', href: '/map', icon: MapIcon },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-[#E2E8DC] max-w-md mx-auto left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-between items-center">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 flex-1 ${
                isActive ? 'text-[#4D6C1D] bg-[#D4F67B]/20 rounded-xl' : 'text-gray-400'
              }`}
            >
              <div
                className={`transition-all duration-200 ${
                  isActive ? 'bg-[#D4F67B] rounded-full p-1.5' : 'p-1.5'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#192625]' : ''} />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
