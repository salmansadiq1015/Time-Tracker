'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Search, Home, ChevronRight, Menu } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('Tuser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const crumbs = useMemo(() => {
    const segments = (pathname || '/').split('/').filter(Boolean);
    const acc: { label: string; href: string }[] = [];
    let path = '';
    segments.forEach((seg) => {
      path += `/${seg}`;
      acc.push({ label: seg.replace(/-/g, ' '), href: path });
    });
    return acc;
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-700/50 bg-[#1e2339] text-white shadow-lg">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between py-2.5 gap-4">
          {/* Left: Hamburger Menu + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:bg-gray-700/50 hover:text-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Logo */}
            {/* <div className="hidden md:flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image
                  src="/w_noclaim.png"
                  alt="logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
            </div> */}
          </div>

          {/* Right: User Avatar */}
          <div className="flex items-center gap-3">
            {/* <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
              <span className="text-xs text-gray-400 capitalize">{user?.role || 'User'}</span>
            </div> */}
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center ring-2 ring-blue-500/50 shadow-lg">
              <span className="text-sm font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
