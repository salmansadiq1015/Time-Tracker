'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  project?: string | { _id: string; name: string };
  task?: string | { _id: string; title: string };
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

interface TimeTrackerCardsProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
  loading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  onFilterByUser?: (
    userId: string,
    userDetails?: {
      _id: string;
      name?: string;
      email?: string;
      phone?: string;
      role?: string;
      status?: string;
      createdBy?: CreatedByDetails;
    }
  ) => void;
}

export function TimeTrackerCards({
  entries,
  onDelete,
  onEdit,
  loading = false,
  pagination,
  onPageChange,
  onFilterByUser,
}: TimeTrackerCardsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Invalid';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid';
    }
  };

  const getDurationDisplay = (entry: TimeEntry) => {
    if (typeof entry.duration === 'number') {
      const hours = entry.duration / 60;
      if (Number.isFinite(hours) && hours > 0) {
        return hours.toFixed(2);
      }
    }

    const start = entry.start?.startTime;
    const end = entry.end?.endTime;
    if (!start || !end) return null;

    try {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      let diffHours = (endTime - startTime) / 3600000;
      if (!Number.isFinite(diffHours)) return null;
      if (diffHours < 0) {
        diffHours = Math.abs(diffHours);
      }
      return diffHours.toFixed(2);
    } catch {
      return null;
    }
  };

  const getProjectName = (project?: string | { _id: string; name: string }) => {
    if (!project) return null;
    if (typeof project === 'string') return project;
    return project.name || null;
  };

  const getTaskName = (task?: string | { _id: string; title: string }) => {
    if (!task) return null;
    if (typeof task === 'string') return task;
    return task.title || null;
  };

  const validEntries = entries.filter((entry) => entry && entry._id);

  return (
    <div className="space-y-4">
      {loading ? (
        <>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </>
      ) : validEntries.length === 0 ? (
        <Card className="border-gray-700/50 bg-[#1e2339]">
          <CardContent className="py-8">
            <p className="text-center text-gray-400">No time entries found</p>
          </CardContent>
        </Card>
      ) : (
        validEntries.map((entry) => {
          const startTime = entry.start?.startTime;
          const endTime = entry.end?.endTime;
          const duration = getDurationDisplay(entry);

          return (
            <Card
              key={entry._id}
              className={`border-gray-700/50 bg-[#1e2339] text-white backdrop-blur-sm hover:border-blue-500/50 transition-all shadow-lg ${
                entry.isActive ? 'ring-2 ring-blue-500/50' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {entry.description || 'Untitled'}
                        </h3>
                        {entry.isActive && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/50">
                            Active
                          </span>
                        )}
                      </div>
                      {(getProjectName(entry.project) || getTaskName(entry.task)) && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getProjectName(entry.project) && (
                            <span className="px-2 py-0.5 bg-blue-600/20 text-blue-300 text-xs font-medium rounded border border-blue-500/50">
                              Project: {getProjectName(entry.project)}
                            </span>
                          )}
                          {getTaskName(entry.task) && (
                            <span className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs font-medium rounded border border-purple-500/50">
                              Task: {getTaskName(entry.task)}
                            </span>
                          )}
                        </div>
                      )}
                      {entry.user?._id ? (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() =>
                              entry.user?._id &&
                              onFilterByUser?.(entry.user._id, {
                                _id: entry.user._id,
                                name: entry.user.name,
                                email: entry.user.email,
                                phone: entry.user.phone,
                                role: entry.user.role,
                                status: entry.user.status,
                                createdBy:
                                  entry.user.createdby && typeof entry.user.createdby === 'object'
                                    ? {
                                        _id: entry.user.createdby._id,
                                        name: entry.user.createdby.name,
                                        email: entry.user.createdby.email,
                                        phone: entry.user.createdby.phone,
                                        role: entry.user.createdby.role,
                                      }
                                    : typeof entry.user.createdby === 'string'
                                    ? { _id: entry.user.createdby }
                                    : undefined,
                              })
                            }
                            className="text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline underline-offset-2 transition"
                          >
                            {entry.user?.name || 'Unknown User'}
                          </button>
                          {entry.user?.email && (
                            <p className="text-xs text-gray-400">{entry.user.email}</p>
                          )}
                          {entry.user?.role && (
                            <p className="text-[11px] uppercase tracking-wide text-gray-500">
                              {entry.user.role}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">N/A</p>
                      )}
                    </div>
                    {duration && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{duration}h</p>
                        <p className="text-xs text-gray-400">Duration</p>
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-700/50">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Start Date</p>
                      <p className="text-sm font-mono font-semibold text-white">
                        {formatDate(startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Start Time</p>
                      <p className="text-sm font-mono font-semibold text-white">
                        {formatTime(startTime)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Start Location</p>
                      <p className="text-sm text-white">
                        {entry.start?.location || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.start?.lat.toFixed(4)}, {entry.start?.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* End time and location */}
                  {endTime && entry.end && (
                    <>
                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-700/50">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">End Date</p>
                          <p className="text-sm font-mono font-semibold text-white">
                            {formatDate(endTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">End Time</p>
                          <p className="text-sm font-mono font-semibold text-white">
                            {formatTime(endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1">End Location</p>
                          <p className="text-sm text-white">
                            {entry.end.location || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.end.lat.toFixed(4)}, {entry.end.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-gray-700/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="flex-1 gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDeletingId(entry._id);
                        onDelete(entry._id);
                      }}
                      disabled={deletingId === entry._id}
                      className="flex-1 gap-2 border-red-600/50 text-red-400 hover:bg-red-600/20 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card className="border-gray-700/50 bg-[#1e2339]">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(1)}
                  disabled={!pagination.hasPrevPage}
                  className="bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {(() => {
                  const pages: number[] = [];
                  const maxVisible = 5;
                  const halfWindow = Math.floor(maxVisible / 2);

                  let startPage = Math.max(1, pagination.currentPage - halfWindow);
                  const endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);

                  // Adjust start if we're near the end
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  // Generate page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }

                  return pages.map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange?.(pageNum)}
                      className={
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                          : 'bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    >
                      {pageNum}
                    </Button>
                  ));
                })()}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="bg-[#1e2339] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
                >
                  Last
                </Button>
              </div>
              <div className="text-sm text-gray-400">{pagination.limit} per page</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
