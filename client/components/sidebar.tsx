"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Clock, Users, BarChart3, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("Tuser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("Ttoken");
    localStorage.removeItem("Tuser");
    router.push("/login");
  };

  const menuItems = [
    // { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    ...(user?.role === "admin" || user?.role === "dispatcher"
      ? [{ label: "Users", href: "/dashboard/users", icon: Users }]
      : []),
    { label: "Time Tracker", href: "/dashboard/time-tracker", icon: Clock },
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
          isOpen ? "right-3 hidden" : "left-4 "
        } z-50 p-2 bg-primary text-primary-foreground rounded-lg`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`
        fixed md:relative w-64 h-screen bg-gray-950 border-r border-sidebar-border
        transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden fixed top-4 ${
            isOpen ? "right-3" : "left-4 "
          } z-50 p-2 bg-primary text-primary-foreground rounded-lg`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="p-3 border-b border-sidebar-border flex items-center justify-center ">
          <div className="relative w-28 flex items-center justify-center">
            <Image
              src="/w_noclaim.png"
              alt="logo"
              width={110}
              height={120}
              className="object-contain drop-shadow-lg hover:scale-105 transition-transform duration-200"
              priority
            />
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
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
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border space-y-3">
          <div className="px-4 py-2 bg-sidebar-accent/10 rounded-lg">
            <p className="text-xs text-sidebar-foreground/70">Logged in as</p>
            <div className="flex items-center gap-1">
              <p className="text-lg font-semibold text-sidebar-foreground">
                {user?.name}
              </p>
              <p className="text-xs capitalize bg-green-500 rounded-full px-2 w-fit text-white">
                {user?.role}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/20 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
