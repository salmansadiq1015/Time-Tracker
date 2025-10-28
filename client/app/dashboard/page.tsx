"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Users, Activity, TrendingUp } from "lucide-react";
import { useAuthContent } from "../context/authContext";

interface DashboardStats {
  totalHours: number;
  activeTimers: number;
  totalUsers: number;
  thisWeekHours: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalHours: 0,
    activeTimers: 0,
    totalUsers: 0,
    thisWeekHours: 0,
  });
  const { auth } = useAuthContent();

  useEffect(() => {
    // Mock stats - replace with API call
    setStats({
      totalHours: 156.5,
      activeTimers: 3,
      totalUsers: 24,
      thisWeekHours: 42.5,
    });
  }, []);

  const statCards = [
    {
      title: "Total Hours",
      value: stats.totalHours.toFixed(1),
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Timers",
      value: stats.activeTimers,
      icon: Activity,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "This Week",
      value: `${stats.thisWeekHours}h`,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {auth?.user?.name || "User"}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your dashboard overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border-border/50 hover:border-primary/50 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest time entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30"
              >
                <div>
                  <p className="font-medium">Project Work</p>
                  <p className="text-sm text-muted-foreground">
                    Today at 9:00 AM
                  </p>
                </div>
                <p className="font-semibold text-primary">8.5 hours</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
