"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalHours: number;
  averageHoursPerUser: number;
  usersByRole: { role: string; count: number }[];
  hoursThisWeek: { day: string; hours: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("Tuser");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Check if user has admin access
      if (parsedUser.role !== "admin") {
        router.push("/dashboard");
        return;
      }
    }

    // Mock admin stats
    setStats({
      totalUsers: 24,
      activeUsers: 18,
      totalHours: 1250.5,
      averageHoursPerUser: 52.1,
      usersByRole: [
        { role: "Admin", count: 2 },
        { role: "Dispatcher", count: 5 },
        { role: "User", count: 17 },
      ],
      hoursThisWeek: [
        { day: "Mon", hours: 185 },
        { day: "Tue", hours: 192 },
        { day: "Wed", hours: 178 },
        { day: "Thu", hours: 205 },
        { day: "Fri", hours: 198 },
        { day: "Sat", hours: 120 },
        { day: "Sun", hours: 95 },
      ],
    });

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const COLORS = [
    "hsl(var(--color-primary))",
    "hsl(var(--color-accent))",
    "hsl(var(--color-chart-2))",
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and analytics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats?.totalUsers}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold mt-2">{stats?.activeUsers}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.totalHours.toFixed(0)}
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours/User</p>
                <p className="text-3xl font-bold mt-2">
                  {stats?.averageHoursPerUser.toFixed(1)}
                </p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours This Week */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Hours Tracked This Week</CardTitle>
            <CardDescription>Daily breakdown of tracked hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.hoursThisWeek}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--color-border))"
                />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--color-muted-foreground))"
                />
                <YAxis stroke="hsl(var(--color-muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--color-card))",
                    border: "1px solid hsl(var(--color-border))",
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="hsl(var(--color-primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, count }) => `${role}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats?.usersByRole.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--color-card))",
                    border: "1px solid hsl(var(--color-border))",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Current system status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-foreground">API Response Time</p>
                <p className="text-sm text-muted-foreground">
                  Average response time
                </p>
              </div>
              <p className="text-lg font-bold text-primary">45ms</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-foreground">Database Status</p>
                <p className="text-sm text-muted-foreground">
                  Connection status
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium text-green-500">Connected</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/30">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Currently logged in users
                </p>
              </div>
              <p className="text-lg font-bold text-primary">
                {stats?.activeUsers}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
