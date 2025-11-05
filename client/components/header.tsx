'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Search, Home, ChevronRight } from 'lucide-react';
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
    <header className="sticky top-0 z-30  border-b border-white/10 bg-gradient-to-r from-[#c16840] via-[#d17a4f] to-[#c16840] text-white shadow-lg">
      <div className="px-4 md:px-6 ">
        {/* Top Row: Breadcrumbs + Search + Actions */}
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-2 text-white/90">
            <Home className="w-4 h-4" />
            {crumbs.length === 0 ? (
              <span className="text-sm/none">dashboard</span>
            ) : (
              crumbs.map((c, idx) => (
                <div key={c.href} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 opacity-70" />
                  <span
                    className={`capitalize text-sm ${
                      idx === crumbs.length - 1 ? 'font-semibold' : 'opacity-90'
                    }`}
                  >
                    {c.label}
                  </span>
                </div>
              ))
            )}
          </nav>

          {/* Search */}
          {/* <div className="flex-1 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-2 rounded-lg focus-within:ring-2 ring-white/30 transition">
              <Search className="w-4 h-4 text-white/80" />
              <Input
                placeholder="Search..."
                className="h-8 bg-transparent border-0 text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
              <Settings className="w-5 h-5" />
            </Button> */}
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center ring-1 ring-white/20">
              <span className="text-xs font-semibold">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
