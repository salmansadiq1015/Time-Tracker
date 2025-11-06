'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarX, Clock, Play, Users, Download } from 'lucide-react';
import { TimeTrackerForm } from '@/components/time-tracker-form';
import { ActiveTimerDisplay } from '@/components/active-timer-display';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useAuthContent } from '@/app/context/authContext';
import { TimeTrackerCards } from '@/components/time-tracker-cards';
import { TimeTrackerTable } from '@/components/time-tracker-table';
import { EditTimerModal } from '@/components/edit-timer-modal';
import { AdvancedFilters } from '@/components/timer-filters';
import { Card, CardContent } from '@/components/ui/card';
import { PiClipboardTextBold } from 'react-icons/pi';
import { ExportButtons } from '@/components/export-button';

interface TimeEntry {
  _id: string;
  start: {
    startTime: string;
    location: string;
    lat: number;
    lng: number;
  };
  end?: {
    endTime: string;
    location: string;
    lat: number;
    lng: number;
  };
  description: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  photos?: string[];
  status?: string;
  verifiedByClient?: boolean;
  client?: string | { _id: string; name: string; email: string };
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface PaginationData {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FilterState {
  selectedUser: string;
  startDate: string;
  endDate: string;
  searchQuery?: string;
  dateRange: string;
}

export default function TimeTrackerPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [summary, setSummary] = useState<any>({
    totalDuration: 0,
    totalLeaves: 0,
    totalCount: 0,
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    selectedUser: '',
    startDate: '',
    endDate: '',
    searchQuery: '',
    dateRange: '',
  });

  const [users, setUsers] = useState<any[]>([]);
  const { auth } = useAuthContent();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch All Timers
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        user: auth.user.role === 'user' ? auth?.user?._id : filters.selectedUser,
      });

      if (filters.startDate) params.append('start', filters.startDate);
      if (filters.endDate) params.append('end', filters.endDate);
      if (filters.searchQuery) params.append('search', filters.searchQuery);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/all?${params}`
      );

      if (response.data?.success && response.data?.data) {
        setEntries(response.data.data.timers || []);
        setSummary(response.data.data.summary);
        setPagination(response.data.data.pagination);

        const active = response.data.data.timers?.find((t: TimeEntry) => t.isActive);
        setActiveTimer(active || null);
      }
    } catch (error: any) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch time entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters, auth, toast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (auth?.user?.role !== 'admin' && auth.user.role !== 'dispatcher') return;
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all`);

      if (response.data?.success && response.data) {
        setUsers(response.data.results.users);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
    }
  }, [auth]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Starting Timer
  const handleStartTimer = async (data: any) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/start`,
        {
          user: auth?.user?._id || data.userId,
          start: {
            startTime: new Date(),
            location: data?.location?.address,
            lat: data.location.lat,
            lng: data.location.lng,
          },
          description: data.description,
          photos: data.photos || [],
        }
      );

      if (response.data?.success) {
        const newEntry = response.data.timer;
        setActiveTimer(newEntry);
        setEntries([newEntry, ...entries]);
        fetchEntries();
        setShowForm(false);
        toast({
          title: 'Success',
          description: 'Timer started successfully',
        });
      }
    } catch (error: any) {
      console.error('Error starting timer:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start timer',
        variant: 'destructive',
      });
    }
  };

  // Handle Stopping Timer
  const handleStopTimer = async (id: string, endData: any) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/stop/${id}`,
        {
          end: {
            endTime: new Date(),
            location: endData?.location?.address,
            lat: endData.location.lat,
            lng: endData.location.lng,
          },
          description: endData.description,
          photos: endData.photos || [],
        }
      );

      if (response.data?.success) {
        setEntries(entries.map((entry) => (entry._id === id ? response.data.timer : entry)));
        setActiveTimer(null);
        fetchEntries();
        toast({
          title: 'Success',
          description: 'Timer stopped successfully',
        });
      }
    } catch (error: any) {
      console.error('Error stopping timer:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to stop timer',
        variant: 'destructive',
      });
    }
  };

  // Handle Deleting Timer
  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/delete/${id}`
      );

      if (response.data?.success) {
        setEntries(entries.filter((entry) => entry._id !== id));
        toast({
          title: 'Success',
          description: 'Timer deleted successfully',
        });
      }
    } catch (error: any) {
      console.error('Error deleting timer:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete timer',
        variant: 'destructive',
      });
    }
  };

  // Handle Editing Timer
  const handleEditEntry = async (updatedData: any) => {
    if (!editingEntry) return;
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/update/${editingEntry._id}`,
        updatedData
      );

      if (data?.success) {
        setEntries(entries.map((e) => (e._id === editingEntry._id ? data.timer : e)));
        fetchEntries();
        setEditingEntry(null);
        toast({
          title: 'Success',
          description: 'Timer updated successfully',
        });
      }
    } catch (error: any) {
      console.error('Error updating timer:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update timer',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      selectedUser: '',
      startDate: '',
      endDate: '',
      searchQuery: '',
      dateRange: '',
    });
    setPage(1);
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hrs}h:${mins}m`;
  };

  const cards = [
    {
      title: 'Total Count',
      value: summary?.totalCount || 0,
      icon: <PiClipboardTextBold className="w-8 h-8 text-sky-400" />,
      glow: 'shadow-[0_0_25px_rgba(56,189,248,0.4)]',
      border: 'border-sky-500/30',
      gradient: 'from-sky-500 to-sky-400',
    },
    {
      title: 'Total Duration',
      value: formatDuration(summary?.totalDuration || 0),
      icon: <Clock className="w-8 h-8 text-green-400" />,
      glow: 'shadow-[0_0_25px_rgba(74,222,128,0.4)]',
      border: 'border-green-500/30',
      gradient: 'from-green-500 to-green-400',
    },
    {
      title: 'Total Leaves',
      value: summary?.totalLeaves || 0,
      icon: <CalendarX className="w-8 h-8 text-pink-400" />,
      glow: 'shadow-[0_0_25px_rgba(244,114,182,0.4)]',
      border: 'border-pink-500/30',
      gradient: 'from-pink-500 to-pink-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className=" space-y-6">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-amber-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700">
                <span className="text-sm font-bold text-white">TT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Time Tracker</h1>
                <p className="text-xs text-muted-foreground">
                  Track your work hours with precision and advanced analytics
                </p>
              </div>
            </div>
            {auth.user.role === 'user' && (
              <Button
                onClick={() => setShowForm(!showForm)}
                disabled={!!activeTimer}
                className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            )}
          </div>
        </header>

        <div className="px-4 md:px-8 flex flex-col gap-4 pb-8 ">
          {/* Stats Cards - compact, elegant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <Card
                key={i}
                className={`relative overflow-hidden ${card.border} bg-linear-to-br ${card.gradient} 
          backdrop-blur-md border rounded-xl p-0.5 transition-all duration-300 hover:shadow-xl hover:${card.glow}`}
              >
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 bg-white/70 rounded-lg border border-white/10 backdrop-blur-sm">
                      {card.icon}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-100/90 font-semibold tracking-wider uppercase">
                      {card.title}
                    </p>
                    <p className="text-3xl font-extrabold text-white mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.08)]">
                      {card.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start Timer Form */}
          {showForm && (
            <TimeTrackerForm
              onSubmit={handleStartTimer}
              onCancel={() => setShowForm(false)}
              isStarting={true}
            />
          )}

          {/* Active Timer Display */}
          {auth?.user?.role === 'user' && (
            <ActiveTimerDisplay activeTimer={activeTimer} onStop={handleStopTimer} />
          )}

          {/* Advanced Filters */}
          <AdvancedFilters
            filters={filters}
            users={users}
            entries={entries}
            summary={summary}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            isAdmin={auth?.user?.role === 'admin' || auth?.user?.role === 'dispatcher'}
          />

          {/* Export Buttons */}
          {/* <div className="flex justify-end">
          <ExportButtons entries={entries} summary={summary} />
        </div> */}

          {/* Table/Cards View */}
          {isMobile ? (
            <TimeTrackerCards
              entries={entries}
              onDelete={handleDeleteEntry}
              onEdit={setEditingEntry}
              loading={loading}
              pagination={pagination || undefined}
              onPageChange={(newPage) => setPage(newPage)}
            />
          ) : (
            <TimeTrackerTable
              entries={entries}
              onDelete={handleDeleteEntry}
              onEdit={setEditingEntry}
              loading={loading}
              pagination={pagination || undefined}
              onPageChange={(newPage) => setPage(newPage)}
            />
          )}
        </div>

        {/* Edit Modal */}
        {editingEntry && (
          <EditTimerModal
            entry={editingEntry}
            onClose={() => setEditingEntry(null)}
            onSave={handleEditEntry}
          />
        )}
      </div>
    </div>
  );
}
