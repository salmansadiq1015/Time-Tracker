'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  user?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    status?: string;
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
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">No time entries found</p>
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
              className={`border-gray-300 bg-gray-100 text-black backdrop-blur-sm hover:border-primary/50 transition-all ${
                entry.isActive ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-lg">
                          {entry.description || 'Untitled'}
                        </h3>
                        {entry.isActive && (
                          <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                            Active
                          </span>
                        )}
                      </div>
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
                              })
                            }
                            className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-2 transition"
                          >
                            {entry.user?.name || 'Unknown User'}
                          </button>
                          {entry.user?.email && (
                            <p className="text-xs text-muted-foreground">{entry.user.email}</p>
                          )}
                          {entry.user?.role && (
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              {entry.user.role}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">N/A</p>
                      )}
                    </div>
                    {duration && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{duration}h</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/30">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {formatDate(startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                      <p className="text-sm font-mono font-semibold text-foreground">
                        {formatTime(startTime)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Start Location</p>
                      <p className="text-sm text-foreground">
                        {entry.start?.location || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.start?.lat.toFixed(4)}, {entry.start?.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* End time and location */}
                  {endTime && entry.end && (
                    <>
                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/30">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">End Date</p>
                          <p className="text-sm font-mono font-semibold text-foreground">
                            {formatDate(endTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">End Time</p>
                          <p className="text-sm font-mono font-semibold text-foreground">
                            {formatTime(endTime)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">End Location</p>
                          <p className="text-sm text-foreground">
                            {entry.end.location || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.end.lat.toFixed(4)}, {entry.end.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      className="flex-1 gap-2"
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
                      className="flex-1 gap-2 text-destructive hover:text-destructive"
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
        <Card className="border-border/50 bg-card/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(1)}
                  disabled={!pagination.hasPrevPage}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                  let pageNum = pagination.currentPage - 2 + i;
                  if (pageNum < 1) pageNum = 1 + i;
                  if (pageNum > pagination.totalPages) pageNum = pagination.totalPages - 4 + i;

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange?.(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                >
                  Last
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">{pagination.limit} per page</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
