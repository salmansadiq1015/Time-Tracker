'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarX, Clock, Play, Users } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { PiClipboardTextBold } from 'react-icons/pi';
import { ExportButtons } from '@/components/export-button';

interface CreatedByDetails {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface TimeEntry {
  _id: string;
  start: {
    startTime: string;
    location: string;
    lat: number;
    lng: number;
    photos?: string[];
  };
  end?: {
    endTime: string;
    location: string;
    lat: number;
    lng: number;
    photos?: string[];
  };
  description: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
  photos?: string[];
  status?: string;
  paused?: boolean;
  pausedAt?: string;
  pausedDuration?: number;
  pausePeriods?: Array<{
    pausedAt: string;
    resumedAt?: string;
    duration?: number;
  }>;
  verifiedByClient?: boolean;
  client?: string | { _id: string; name: string; email: string };
  project?: string | { _id: string; name: string };
  assignment?: string | { _id: string; description: string };
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    status?: string;
    createdby?: CreatedByDetails | string;
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

interface SelectedUserDetails {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  createdBy?: CreatedByDetails;
}

export default function TimeTrackerPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [pausedTimers, setPausedTimers] = useState<TimeEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const pauseInProgressRef = useRef<Set<string>>(new Set());
  const resumeInProgressRef = useRef<Set<string>>(new Set());
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
  const [selectedUserDetails, setSelectedUserDetails] = useState<SelectedUserDetails | null>(null);
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
      });

      const userId = auth.user.role === 'user' ? auth?.user?._id : filters.selectedUser;
      if (userId) params.append('user', userId);

      if (filters.startDate) params.append('start', filters.startDate);
      if (filters.endDate) params.append('end', filters.endDate);
      if (filters.searchQuery) params.append('search', filters.searchQuery);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/all?${params}`
      );

      if (response.data?.success && response.data?.data) {
        setEntries(response.data.data.timers || []);
        setSummary(response.data.data.summary);
        const paginationData = response.data.data.pagination;
        setPagination(paginationData);

        // Find active timer (only non-paused ones) - strict check
        const active = response.data.data.timers?.find(
          (t: TimeEntry) =>
            t.isActive === true &&
            t.paused !== true &&
            t.status !== 'paused' &&
            (!t.pausedAt || t.pausedAt === null)
        );
        setActiveTimer(active || null);

        // Find paused timers (for the paused list)
        const paused =
          response.data.data.timers?.filter(
            (t: TimeEntry) => t.isActive && (t.paused || t.status === 'paused')
          ) || [];
        setPausedTimers(paused);
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

  // Reset to page 1 if current page exceeds total pages after pagination data is received
  useEffect(() => {
    if (pagination && page > pagination.totalPages && pagination.totalPages > 0) {
      setPage(1);
    }
  }, [pagination, page]);

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

  const handleFilterByUser = (userId: string, userInfo?: SelectedUserDetails) => {
    if (!userId) return;

    setFilters((prev) => ({
      ...prev,
      selectedUser: userId,
    }));

    if (userInfo) {
      setSelectedUserDetails({
        _id: userId,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        role: userInfo.role,
        status: userInfo.status,
        createdBy: userInfo.createdBy,
      });
    }

    setPage(1);
  };

  const clearUserFilter = () => {
    setFilters((prev) => ({
      ...prev,
      selectedUser: '',
    }));
    setSelectedUserDetails(null);
    setPage(1);
  };

  useEffect(() => {
    if (!filters.selectedUser) {
      setSelectedUserDetails(null);
      return;
    }

    setSelectedUserDetails((prev) => {
      const entryMatch = entries.find((entry) => entry.user?._id === filters.selectedUser)?.user;
      const userMatch = users.find((user) => user._id === filters.selectedUser);
      const source = entryMatch || userMatch;

      if (!source) {
        return prev || null;
      }

      const mapCreatedBy = (): CreatedByDetails | undefined => {
        const raw = source.createdby;
        if (!raw) return undefined;
        if (typeof raw === 'object') {
          return {
            _id: raw._id ?? raw.id,
            name: raw.name,
            email: raw.email,
            phone: raw.phone,
            role: raw.role,
          };
        }
        const creator = users.find((u) => u._id === raw);
        if (creator) {
          return {
            _id: creator._id,
            name: creator.name,
            email: creator.email,
            phone: creator.phone,
            role: creator.role,
          };
        }
        if (typeof raw === 'string') {
          return { _id: raw };
        }
        return undefined;
      };

      const nextDetails: SelectedUserDetails = {
        _id: filters.selectedUser,
        name: source.name,
        email: source.email,
        phone: source.phone,
        role: source.role,
        status: source.status,
        createdBy: mapCreatedBy(),
      };

      if (
        prev &&
        prev._id === nextDetails._id &&
        prev.name === nextDetails.name &&
        prev.email === nextDetails.email &&
        prev.phone === nextDetails.phone &&
        prev.role === nextDetails.role &&
        prev.status === nextDetails.status &&
        JSON.stringify(prev.createdBy) === JSON.stringify(nextDetails.createdBy)
      ) {
        return prev;
      }

      return nextDetails;
    });
  }, [filters.selectedUser, entries, users]);

  // Handle Starting Timer
  const handleStartTimer = async (data: any) => {
    // Check if there's already an active timer
    if (activeTimer && activeTimer.status !== 'paused' && !activeTimer.paused) {
      toast({
        title: 'Timer Already Running',
        description:
          'You already have an active timer running. Please pause or stop it before starting a new one.',
        variant: 'destructive',
      });
      return;
    }

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
          project: data.project,
          assignment: data.assignment,
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
      // Handle case where timer is already running
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast({
          title: 'Timer Already Running',
          description: error.response.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to start timer',
          variant: 'destructive',
        });
      }
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

  // Handle Pausing Timer
  const handlePauseTimer = async (id: string) => {
    // Prevent duplicate calls
    if (!id) return;

    // Check if pause is already in progress for this timer
    if (pauseInProgressRef.current.has(id)) {
      return;
    }

    // Mark as in progress
    pauseInProgressRef.current.add(id);

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/pause/${id}`
      );

      if (response.data) {
        const pausedTimer = response.data.timer;
        window.location.reload();
        // Clear active timer since it's now paused
        setActiveTimer(null);
        // Update entries
        setEntries(entries.map((entry) => (entry._id === id ? pausedTimer : entry)));
        // Add to paused timers list
        setPausedTimers((prev) => {
          const exists = prev.find((t) => t._id === id);
          if (exists) {
            return prev.map((t) => (t._id === id ? pausedTimer : t));
          }
          return [...prev, pausedTimer];
        });
        // Refresh to get updated data
        await fetchEntries();
        toast({
          title: 'Timer Paused',
          description: 'You can now start a new timer or resume this one later.',
        });
      }
    } catch (error: any) {
      console.error('Error pausing timer:', error);
      // Don't show error if timer is already paused (expected case)
      if (
        error.response?.status !== 400 ||
        !error.response?.data?.message?.includes('already paused')
      ) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to pause timer',
          variant: 'destructive',
        });
      }
    } finally {
      // Remove from in-progress set
      pauseInProgressRef.current.delete(id);
    }
  };

  // Handle Resuming Timer
  const handleResumeTimer = async (id: string) => {
    // Prevent duplicate calls
    if (!id) return;

    // Check if there's already an active timer running
    if (activeTimer) {
      toast({
        title: 'Timer Already Running',
        description:
          'You already have an active timer running. Please pause or stop it before resuming another timer.',
        variant: 'destructive',
      });
      return;
    }

    // Check if resume is already in progress for this timer
    if (resumeInProgressRef.current.has(id)) {
      return;
    }

    // Mark as in progress
    resumeInProgressRef.current.add(id);

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/resume/${id}`
      );

      if (response.data?.success) {
        const resumedTimer = response.data.timer;
        // Set as active timer
        setActiveTimer(resumedTimer);
        // Remove from paused timers
        setPausedTimers((prev) => prev.filter((t) => t._id !== id));
        // Update entries
        setEntries(entries.map((entry) => (entry._id === id ? resumedTimer : entry)));
        // Refresh to get updated data
        await fetchEntries();
        toast({
          title: 'Timer Resumed',
          description: 'Timer has been resumed successfully.',
        });
      }
    } catch (error: any) {
      console.error('Error resuming timer:', error);
      // Handle case where timer is already running
      if (error.response?.status === 400 && error.response?.data?.message) {
        toast({
          title: 'Timer Already Running',
          description: error.response.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to resume timer',
          variant: 'destructive',
        });
      }
    } finally {
      // Remove from in-progress set
      resumeInProgressRef.current.delete(id);
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
    if (!newFilters.selectedUser) {
      setSelectedUserDetails(null);
    }
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
    setSelectedUserDetails(null);
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
    <div className="min-h-screen bg-[#0f1419]">
      <div className="space-y-6">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-[#1e2339]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-gray-400 to-gray-600 shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Time Tracker</h1>
                <p className="text-xs text-gray-400">
                  Track your work hours with precision and advanced analytics
                </p>
              </div>
            </div>
            {auth.user.role === 'user' && (
              <Button
                onClick={() => setShowForm(!showForm)}
                disabled={!!activeTimer}
                className="gap-2 bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 shadow-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            )}
          </div>
        </header>

        <div className="px-4 md:px-8 flex flex-col gap-4 pb-8">
          {/* Stats Cards - compact, elegant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

          {/* Active Timer Display - Only show non-paused active timers */}
          {auth?.user?.role === 'user' &&
            activeTimer &&
            activeTimer.paused !== true &&
            activeTimer.status !== 'paused' &&
            (!activeTimer.pausedAt || activeTimer.pausedAt === null) && (
              <ActiveTimerDisplay
                activeTimer={activeTimer}
                onStop={handleStopTimer}
                onPause={handlePauseTimer}
                onResume={handleResumeTimer}
              />
            )}

          {/* Paused Timers List */}
          {auth?.user?.role === 'user' && pausedTimers.length > 0 && (
            <Card className="border-yellow-500/30 bg-[#1e2339] shadow-lg">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Paused Timers ({pausedTimers.length})
                </h3>
                <div className="space-y-3">
                  {pausedTimers.map((timer) => {
                    // Calculate elapsed time when paused
                    const startTime = timer.start?.startTime
                      ? new Date(timer.start.startTime)
                      : null;
                    const pausedAt = timer.pausedAt ? new Date(timer.pausedAt) : null;
                    let elapsedMinutes = 0;

                    if (startTime && pausedAt) {
                      const totalMinutes = (pausedAt.getTime() - startTime.getTime()) / (60 * 1000);
                      const pausedDuration = timer.pausedDuration || 0;
                      elapsedMinutes = Math.max(0, totalMinutes - pausedDuration);
                    }

                    const hours = Math.floor(elapsedMinutes / 60);
                    const minutes = Math.floor(elapsedMinutes % 60);
                    const seconds = Math.floor((elapsedMinutes % 1) * 60);

                    return (
                      <div
                        key={timer._id}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-yellow-500/20"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{timer.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span>
                              Time: {String(hours).padStart(2, '0')}:
                              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </span>
                            <span>
                              Paused:{' '}
                              {timer.pausedAt
                                ? new Date(timer.pausedAt).toLocaleString()
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleResumeTimer(timer._id)}
                          disabled={!!activeTimer}
                          className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          size="sm"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected User Summary */}
          {selectedUserDetails && (
            <Card className="border-gray-700/50 bg-[#1e2339] shadow-lg">
              <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Showing entries for
                  </p>
                  <h3 className="text-xl font-semibold text-white">
                    {selectedUserDetails.name || 'Unknown User'}
                  </h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                    {selectedUserDetails.email && <span>Email: {selectedUserDetails.email}</span>}
                    {selectedUserDetails.phone && <span>Phone: {selectedUserDetails.phone}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserDetails.role && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-600/20 text-gray-300 border-gray-500/50"
                      >
                        {selectedUserDetails.role}
                      </Badge>
                    )}
                    {selectedUserDetails.status && (
                      <Badge
                        variant={
                          selectedUserDetails.status === 'active' ? 'outline' : 'destructive'
                        }
                        className={
                          selectedUserDetails.status === 'active'
                            ? 'border-green-500/50 text-green-300'
                            : ''
                        }
                      >
                        {selectedUserDetails.status}
                      </Badge>
                    )}
                  </div>
                  {selectedUserDetails.createdBy && (
                    <div className="pt-3 space-y-1">
                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Created by
                      </p>
                      <div className="text-sm font-medium text-white">
                        {selectedUserDetails.createdBy.name || 'Unknown'}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        {selectedUserDetails.createdBy.email && (
                          <span>Email: {selectedUserDetails.createdBy.email}</span>
                        )}
                        {selectedUserDetails.createdBy.phone && (
                          <span>Phone: {selectedUserDetails.createdBy.phone}</span>
                        )}
                      </div>
                      {selectedUserDetails.createdBy.role && (
                        <Badge variant="outline" className="text-amber-700 border-amber-200">
                          {selectedUserDetails.createdBy.role}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={clearUserFilter}
                  className="self-start md:self-auto"
                >
                  Clear user filter
                </Button>
              </CardContent>
            </Card>
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
              onFilterByUser={handleFilterByUser}
            />
          ) : (
            <TimeTrackerTable
              entries={entries}
              onDelete={handleDeleteEntry}
              onEdit={setEditingEntry}
              loading={loading}
              pagination={pagination || undefined}
              onPageChange={(newPage) => setPage(newPage)}
              onFilterByUser={handleFilterByUser}
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
