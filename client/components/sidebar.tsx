'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  MessageCircle,
  CheckSquare,
  ChevronRight,
  User,
  FileText,
} from 'lucide-react';
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

  const menuSections = [
    {
      title: 'Core',
      items: [
        ...(user?.role === 'admin' || user?.role === 'dispatcher' || user?.role === 'user'
          ? [{ label: 'Time Tracker', href: '/dashboard/time-tracker', icon: Clock }]
          : []),
        ...(user?.role === 'admin' || user?.role === 'dispatcher'
          ? [{ label: 'Users', href: '/dashboard/users', icon: Users }]
          : []),
      ],
    },
    {
      title: 'Fleet Management',
      items: [
        { label: 'Projects', href: '/dashboard/projects', icon: BarChart3 },
        // { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
        { label: 'Assignments', href: '/dashboard/assignments', icon: FileText },
        ...(user?.role === 'admin' || user?.role === 'dispatcher'
          ? [{ label: 'Equipments', href: '/dashboard/equipments', icon: FaTools }]
          : []),
      ],
    },
    {
      title: 'Communication',
      items: [{ label: 'Chat', href: '/dashboard/chat', icon: MessageCircle }],
    },
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
        fixed md:relative w-64 h-screen bg-gradient-to-b from-[#1a1f35] via-[#1e2339] to-[#161b2f]
        text-gray-100 border-r border-gray-700/50 shadow-2xl
        transition-transform duration-300 z-[99998]
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        custom-scrollbar flex flex-col
      `}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden fixed top-4 ${
            isOpen ? 'right-3' : 'left-4 '
          } z-50 p-2 bg-gradient-to-b from-gray-400 to-gray-600 text-gray-900 rounded-lg`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo Section */}
        <div className="px-4 py-[8.5px] border-b border-gray-700/50 flex items-center justify-center bg-gradient-to-r from-[#1a1f35] via-[#1e2339] to-[#161b2f]">
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

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-2">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
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
                        w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-lg cursor-pointer
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-gray-600/20 text-white border-l-4 border-gray-500'
                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                        />
                        <span
                          className={`font-medium text-sm ${
                            isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-700/50 bg-[#1a1f35] space-y-3">
          <div className="px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400">Logged in as</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-white truncate max-w-[9rem]">
                {user?.name || 'User'}
              </p>
              <span className="text-[10px] capitalize bg-green-500/90 rounded-full px-2 py-0.5 text-white tracking-wide">
                {user?.role || 'User'}
              </span>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-gray-600 cursor-pointer text-white bg-red-500/10 hover:bg-red-500/20 hover:text-red-200"
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
