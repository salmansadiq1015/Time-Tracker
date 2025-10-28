"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeEntry {
  _id: string;
  start?: {
    startTime: string;
    location: string;
    lat: number;
    lng: number;
  };
  startTime?: string;
  startLocation?: string;
  startLat?: number;
  startLng?: number;
  end?: {
    endTime: string;
    location: string;
    lat: number;
    lng: number;
  };
  endTime?: string;
  endLocation?: string;
  endLat?: number;
  endLng?: number;
  description: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
}

interface TimeTrackerListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
  onStop: (id: string, data: any) => void;
  loading?: boolean;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
}

export function TimeTrackerList({
  entries,
  onDelete,
  onEdit,
  onStop,
  loading = false,
  pagination,
  onPageChange,
}: TimeTrackerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getStartTime = (entry: TimeEntry): string | null => {
    return entry.start?.startTime || entry.startTime || null;
  };

  const getEndTime = (entry: TimeEntry): string | null => {
    return entry.end?.endTime || entry.endTime || null;
  };

  const getStartLocation = (entry: TimeEntry) => {
    return {
      address: entry.start?.location || entry.startLocation || "Unknown",
      lat: entry.start?.lat || entry.startLat || 0,
      lng: entry.start?.lng || entry.startLng || 0,
    };
  };

  const getEndLocation = (entry: TimeEntry) => {
    return {
      address: entry.end?.location || entry.endLocation || "Unknown",
      lat: entry.end?.lat || entry.endLat || 0,
      lng: entry.end?.lng || entry.endLng || 0,
    };
  };

  const calculateDuration = (start: string | null, end?: string | null) => {
    if (!start || !end) return null;
    try {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      const hours = (endTime - startTime) / 3600000;
      return hours.toFixed(2);
    } catch (error) {
      console.error("[v0] Error calculating duration:", error);
      return null;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("[v0] Error formatting time:", error);
      return "Invalid";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("[v0] Error formatting date:", error);
      return "Invalid";
    }
  };

  const validEntries = entries.filter((entry) => {
    const startTime = getStartTime(entry);
    return entry && entry._id && startTime;
  });

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Time Entries</CardTitle>
        {pagination && (
          <span className="text-sm text-muted-foreground">
            {pagination.total} total entries
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </>
          ) : validEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No time entries found
            </p>
          ) : (
            validEntries.map((entry) => {
              const startTime = getStartTime(entry);
              const endTime = getEndTime(entry);
              const startLocation = getStartLocation(entry);
              const endLocation = getEndLocation(entry);

              return (
                <div
                  key={entry._id}
                  className={`p-4 bg-secondary/30 rounded-lg border border-border/30 hover:border-primary/50 transition-all ${
                    entry.isActive ? "ring-2 ring-primary/50" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-foreground">
                          {entry.description || "Untitled"}
                        </p>
                        {entry.isActive && (
                          <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="font-mono">
                            {formatDate(startTime)} • {formatTime(startTime)}
                            {endTime && ` - ${formatTime(endTime)}`}
                          </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p>{startLocation?.address}</p>
                            <p className="text-xs">
                              {startLocation.lat.toFixed(4)},{" "}
                              {startLocation.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>

                        {endTime && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                              <p>{endLocation?.address}</p>
                              <p className="text-xs">
                                {endLocation.lat.toFixed(4)},{" "}
                                {endLocation.lng.toFixed(4)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:flex-col md:items-end">
                      {endTime && (
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {calculateDuration(startTime, endTime)}h
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Duration
                          </p>
                        </div>
                      )}

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(entry)}
                          className="text-blue-500 hover:bg-blue-500/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(entry._id);
                            onDelete(entry._id);
                          }}
                          disabled={deletingId === entry._id}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
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

              {/* Page number buttons */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                  (_, i) => {
                    let pageNum = pagination.currentPage - 2 + i;
                    if (pageNum < 1) pageNum = 1 + i;
                    if (pageNum > pagination.totalPages)
                      pageNum = pagination.totalPages - 4 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === pagination.currentPage
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => onPageChange?.(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>

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
            <div className="text-sm text-muted-foreground">
              {pagination.limit} per page
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
