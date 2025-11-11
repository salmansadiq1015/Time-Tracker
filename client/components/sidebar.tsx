'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Clock, Users, BarChart3, LogOut, Menu, X, MessageCircle, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { FaTools } from 'react-icons/fa';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('Tuser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('Ttoken');
    localStorage.removeItem('Tuser');
    router.push('/login');
  };

  const menuItems = [
    // { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    ...(user?.role === 'admin' || user?.role === 'dispatcher'
      ? [{ label: 'Users', href: '/dashboard/users', icon: Users }]
      : []),
    ...(user?.role === 'admin' || user?.role === 'dispatcher' || user?.role === 'user'
      ? [{ label: 'Time Tracker', href: '/dashboard/time-tracker', icon: Clock }]
      : []),
    { label: 'Projects', href: '/dashboard/projects', icon: BarChart3 },
    { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { label: 'Chat', href: '/dashboard/chat', icon: MessageCircle },
    ...(user?.role === 'admin' || user?.role === 'dispatcher'
      ? [{ label: 'Equipments', href: '/dashboard/equipments', icon: FaTools }]
      : []),
    // ...(use
    // r?.role === "admin"
    //   ? [
    //       {
    //         label: "Admin Dashboard",
    //         href: "/dashboard/admin",
    //         icon: BarChart3,
    //       },
    //     ]
    //   : []),
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`md:hidden fixed top-4 ${
          isOpen ? 'right-3 hidden' : 'left-4 '
        } z-50 p-2 bg-primary text-primary-foreground rounded-lg`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`
        fixed md:relative w-64 h-screen bg-gradient-to-b from-[#1f1f1f] via-[#252525] to-[#1b1b1b]
        text-gray-100 border-r border-black/20 shadow-xl shadow-black/20 backdrop-blur-sm
        transition-transform duration-300 z-[99998]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        custom-scrollbar
      `}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden fixed top-4 ${
            isOpen ? 'right-3' : 'left-4 '
          } z-50 p-2 bg-primary text-primary-foreground rounded-lg`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="px-4 py-[8.5px] border-b border-white/10 flex items-center justify-center bg-gradient-to-r from-[#c16840] via-[#d17a4f] to-[#c16840]">
          <div className="relative w-24 flex items-center justify-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            <Image
              src="/w_noclaim.png"
              alt="logo"
              width={110}
              height={120}
              className="object-contain hover:scale-105 transition-transform duration-200"
              priority
            />
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems?.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className={`
                  w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-white/10 text-white ring-1 ring-white/10'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <span
                  className={`h-5 w-1 rounded-full transition-colors ${
                    isActive ? 'bg-[#d17a4f]' : 'bg-transparent group-hover:bg-white/30'
                  }`}
                />
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                  }`}
                />
                <span
                  className={`font-medium tracking-wide ${
                    isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-3 bg-black/10">
          <div className="px-4 py-3 bg-white/5 rounded-lg">
            <p className="text-xs text-gray-400">Logged in as</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-white truncate max-w-[9rem]">{user?.name}</p>
              <span className="text-[10px] capitalize bg-green-500/90 rounded-full px-2 py-0.5 text-white tracking-wide">
                {user?.role}
              </span>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-white/10 cursor-pointer text-white bg-red-500/10 hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
