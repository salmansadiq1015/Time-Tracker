"use client";

import { useEffect, useState } from "react";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("Tuser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="border-b border-gray-800/50 bg-gray-950 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          {/* <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button> */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
