"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Map,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BiMap } from "react-icons/bi";
import Link from "next/link";

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

interface TimeTrackerTableProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntry) => void;
  loading?: boolean;
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
}

export function TimeTrackerTable({
  entries,
  onDelete,
  onEdit,
  loading = false,
  pagination,
  onPageChange,
}: TimeTrackerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
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
    } catch {
      return "Invalid";
    }
  };

  const calculateDuration = (start: string | null, end?: string | null) => {
    if (!start || !end) return null;
    try {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      const hours = (endTime - startTime) / 3600000;
      return hours.toFixed(2);
    } catch {
      return null;
    }
  };

  const validEntries = entries.filter((entry) => entry && entry._id);

  return (
    <Card className="border-gray-300 bg-gray-100 text-black backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <CardTitle>Time Entries</CardTitle>
        {pagination && (
          <span className="text-sm text-muted-foreground">
            {pagination.total} total entries
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 min-w-[8rem] font-semibold text-foreground">
                  User
                </th>
                <th className="text-left py-3 px-4 min-w-[9rem] font-semibold text-foreground">
                  Date
                </th>
                <th className="text-left py-3 px-4 min-w-[9rem] font-semibold text-foreground">
                  Start Time
                </th>
                <th className="text-left py-3 px-4 font-semibold min-w-[9rem] text-foreground">
                  Start Location
                </th>
                <th className="text-left py-3 px-4 min-w-[9rem] font-semibold text-foreground">
                  End Time
                </th>
                <th className="text-left py-3 px-4 font-semibold min-w-[9rem] text-foreground">
                  End Location
                </th>
                <th className="text-right py-3 px-4 font-semibold text-foreground ">
                  Duration
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground min-w-[15rem]">
                  Description
                </th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td colSpan={9} className="py-4 px-4">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : validEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 px-4 text-center">
                    <p className="text-muted-foreground">
                      No time entries found
                    </p>
                  </td>
                </tr>
              ) : (
                validEntries.map((entry) => {
                  const startTime = entry.start?.startTime;
                  const endTime = entry.end?.endTime;
                  const duration = calculateDuration(startTime, endTime);

                  return (
                    <tr
                      key={entry._id}
                      className={`border-b border-border/30 hover:bg-secondary/30 transition-colors ${
                        entry.isActive ? "bg-primary/5" : ""
                      }`}
                    >
                      <td
                        className="py-4 px-4 capitalize text-gray-800 hover:text-blue-600 cursor-pointer"
                        onClick={() => {
                          const start = entry.start;
                          const end = entry.end;

                          if (
                            start?.lat != null &&
                            start?.lng != null &&
                            end?.lat != null &&
                            end?.lng != null
                          ) {
                            // Parse coords as floats
                            const originLat = parseFloat(start.lat);
                            const originLng = parseFloat(start.lng);
                            const destLat = parseFloat(end.lat);
                            const destLng = parseFloat(end.lng);

                            // Validate they are numbers and within valid lat/lng ranges
                            if (
                              !isNaN(originLat) &&
                              !isNaN(originLng) &&
                              originLat >= -90 &&
                              originLat <= 90 &&
                              originLng >= -180 &&
                              originLng <= 180 &&
                              !isNaN(destLat) &&
                              !isNaN(destLng) &&
                              destLat >= -90 &&
                              destLat <= 90 &&
                              destLng >= -180 &&
                              destLng <= 180
                            ) {
                              const mapsUrl =
                                `https://www.google.com/maps/dir/?api=1` +
                                `&origin=${encodeURIComponent(
                                  originLat + "," + originLng
                                )}` +
                                `&destination=${encodeURIComponent(
                                  destLat + "," + destLng
                                )}` +
                                `&travelmode=driving`;

                              window.open(mapsUrl, "_blank");
                            } else {
                              alert("Invalid latitude or longitude values.");
                            }
                          } else {
                            alert(
                              "Start or end location missing for this entry."
                            );
                          }
                        }}
                      >
                        {entry.user?.name || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs font-mono">
                        {formatDate(startTime)}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs font-mono">
                        {formatTime(startTime)}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {entry.start?.location || "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs font-mono">
                        {endTime ? formatTime(endTime) : "-"}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs">
                        {entry.end?.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {entry.end.location}
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {duration ? (
                          <div className="text-right">
                            <p className="font-bold text-primary">
                              {duration}h
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-medium text-foreground truncate  line-clamp-2"
                            title={entry.description}
                          >
                            {entry.description || "Untitled"}
                          </span>
                          {entry.isActive && (
                            <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const start = entry.start;
                              const end = entry.end;

                              if (
                                start?.lat != null &&
                                start?.lng != null &&
                                end?.lat != null &&
                                end?.lng != null
                              ) {
                                // Parse coords as floats
                                const originLat = parseFloat(start.lat);
                                const originLng = parseFloat(start.lng);
                                const destLat = parseFloat(end.lat);
                                const destLng = parseFloat(end.lng);

                                // Validate they are numbers and within valid lat/lng ranges
                                if (
                                  !isNaN(originLat) &&
                                  !isNaN(originLng) &&
                                  originLat >= -90 &&
                                  originLat <= 90 &&
                                  originLng >= -180 &&
                                  originLng <= 180 &&
                                  !isNaN(destLat) &&
                                  !isNaN(destLng) &&
                                  destLat >= -90 &&
                                  destLat <= 90 &&
                                  destLng >= -180 &&
                                  destLng <= 180
                                ) {
                                  const mapsUrl =
                                    `https://www.google.com/maps/dir/?api=1` +
                                    `&origin=${encodeURIComponent(
                                      originLat + "," + originLng
                                    )}` +
                                    `&destination=${encodeURIComponent(
                                      destLat + "," + destLng
                                    )}` +
                                    `&travelmode=driving`;

                                  window.open(mapsUrl, "_blank");
                                } else {
                                  alert(
                                    "Invalid latitude or longitude values."
                                  );
                                }
                              } else {
                                alert(
                                  "Start or end location missing for this entry."
                                );
                              }
                            }}
                            className="text-yellow-400 hover:bg-yellow-400/10 h-8 w-8"
                          >
                            <BiMap className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(entry)}
                            className="text-blue-500 hover:bg-blue-500/10 h-8 w-8"
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
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
