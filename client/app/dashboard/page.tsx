'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { useAuthContent } from '../context/authContext';

interface DashboardStats {
  totalHours: number;
  activeTimers: number;
  totalUsers: number;
  thisWeekHours: number;
}

export default function DashboardPage() {
  const [stats] = useState<DashboardStats>({
    totalHours: 156.5,
    activeTimers: 3,
    totalUsers: 24,
    thisWeekHours: 42.5,
  });
  const { auth } = useAuthContent();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statCards = [
    {
      title: 'Total Hours',
      value: stats.totalHours.toFixed(1),
      icon: Clock,
      gradient: 'from-gray-500 to-cyan-500',
      bgGradient: 'from-gray-500/10 to-cyan-500/10',
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-600',
    },
    {
      title: 'Active Timers',
      value: stats.activeTimers,
      icon: Activity,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      title: 'This Week',
      value: `${stats.thisWeekHours}h`,
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#c16840] via-[#d97a52] to-[#c16840] p-8 md:p-12 text-white shadow-2xl">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-white/90 text-sm font-medium uppercase tracking-wider">
                {getGreeting()}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                {auth?.user?.name || 'User'}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              Here's your dashboard overview. Stay productive and keep track of your progress.
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-900 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>
                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${stat.iconBg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {stat.title}
                    </p>
                    <p
                      className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`mt-4 h-1 bg-gradient-to-r ${stat.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  ></div>
                </CardContent>
              </Card>
            );
          })}
        </div> */}

        {/* Recent Activity */}
        {/* <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  Your latest time entries
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200/50 dark:border-gray-800/50 hover:border-[#c16840]/50 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c16840]/20 to-[#d97a52]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-[#c16840]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Project Work</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Today at 9:00 AM</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#c16840] to-[#d97a52] text-white font-semibold shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                    8.5h
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
