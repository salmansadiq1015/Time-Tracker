'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Map,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BiMap } from 'react-icons/bi';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthContent } from '@/app/context/authContext';

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
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);
  const { auth } = useAuthContent();

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

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: {
        label: 'Active',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      approved: {
        label: 'Approved',
        className: 'bg-green-100 text-green-700 border-green-200',
      },
      flagged: {
        label: 'Flagged',
        className: 'bg-red-100 text-red-700 border-red-200',
      },
      archived: {
        label: 'Archived',
        className: 'bg-gray-100 text-gray-700 border-gray-200',
      },
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      },
    };
    const config = statusConfig[status || 'active'] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getClientName = (client?: string | { _id: string; name: string; email: string }) => {
    if (!client) return '-';
    if (typeof client === 'string') return client;
    return client.name || client.email || '-';
  };

  const validEntries = entries.filter((entry) => entry && entry._id);

  return (
    <Card className="border-gray-200 bg-white shadow-lg overflow-hidden py-0">
      <CardContent className="p-0 ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-[#c16840] to-[#d17a4f] text-white border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-4 min-w-[10rem] font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  User
                </th>
                <th className="text-left py-4 px-4 min-w-[9rem] font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Date
                </th>
                <th className="text-left py-4 px-4 min-w-[9rem] font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Start Time
                </th>
                <th className="text-left py-4 px-4 font-semibold min-w-[9rem] text-gray-50 uppercase text-xs tracking-wider">
                  Start Location
                </th>
                <th className="text-left py-4 px-4 min-w-[9rem] font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  End Time
                </th>
                <th className="text-left py-4 px-4 font-semibold min-w-[9rem] text-gray-50 uppercase text-xs tracking-wider">
                  End Location
                </th>
                <th className="text-right py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Duration
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider min-w-[15rem]">
                  Description
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Client
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Verified
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Photo
                </th>
                <th className="text-center py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td colSpan={13} className="py-4 px-4">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : validEntries.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500 font-medium">No time entries found</p>
                    </div>
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
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        entry.isActive ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 capitalize">
                            {entry.user?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div
                          className="text-gray-600 text-xs font-mono cursor-pointer hover:text-[#c16840] transition-colors"
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
                              const originLat =
                                typeof start.lat === 'string' ? parseFloat(start.lat) : start.lat;
                              const originLng =
                                typeof start.lng === 'string' ? parseFloat(start.lng) : start.lng;
                              const destLat =
                                typeof end.lat === 'string' ? parseFloat(end.lat) : end.lat;
                              const destLng =
                                typeof end.lng === 'string' ? parseFloat(end.lng) : end.lng;

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
                                  `&origin=${encodeURIComponent(originLat + ',' + originLng)}` +
                                  `&destination=${encodeURIComponent(destLat + ',' + destLng)}` +
                                  `&travelmode=driving`;

                                window.open(mapsUrl, '_blank');
                              } else {
                                alert('Invalid latitude or longitude values.');
                              }
                            } else {
                              alert('Start or end location missing for this entry.');
                            }
                          }}
                        >
                          {formatDate(startTime)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-700 text-xs font-mono">
                            {formatTime(startTime)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 max-w-[200px]">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span
                            className="text-gray-700 text-xs truncate"
                            title={entry.start?.location || 'Unknown'}
                          >
                            {entry.start?.location || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {endTime ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700 text-xs font-mono">
                              {formatTime(endTime)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {entry.end?.location ? (
                          <div className="flex items-center gap-1 max-w-[200px]">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span
                              className="text-gray-700 text-xs truncate"
                              title={entry.end.location}
                            >
                              {entry.end.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {duration ? (
                          <span className="font-bold text-[#c16840] text-sm">{duration}h</span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 max-w-[250px]">
                          <span
                            className="text-gray-800 text-sm truncate line-clamp-2"
                            title={entry.description}
                          >
                            {entry.description || 'Untitled'}
                          </span>
                          {entry.isActive && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(entry.status)}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 max-w-[150px]">
                          <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span
                            className="text-gray-700 text-xs truncate"
                            title={getClientName(entry.client)}
                          >
                            {getClientName(entry.client)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {entry.verifiedByClient ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {entry.photos && entry.photos.length > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedPhotos(entry.photos || []);
                            }}
                            className="relative group"
                            title={`Click to view all ${entry.photos.length} photo(s)`}
                          >
                            <div className="relative">
                              <img
                                src={entry.photos[0]}
                                alt="Photo"
                                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-[#c16840] transition-all cursor-pointer shadow-sm hover:shadow-md"
                              />
                              {entry.photos.length > 1 && (
                                <div className="absolute -top-1 -right-1 bg-[#c16840] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                                  {entry.photos.length}
                                </div>
                              )}
                            </div>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-1">
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
                                const originLat =
                                  typeof start.lat === 'string'
                                    ? parseFloat(start.lat)
                                    : Number(start.lat);
                                const originLng =
                                  typeof start.lng === 'string'
                                    ? parseFloat(start.lng)
                                    : Number(start.lng);
                                const destLat =
                                  typeof end.lat === 'string'
                                    ? parseFloat(end.lat)
                                    : Number(end.lat);
                                const destLng =
                                  typeof end.lng === 'string'
                                    ? parseFloat(end.lng)
                                    : Number(end.lng);

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
                                    `&origin=${encodeURIComponent(originLat + ',' + originLng)}` +
                                    `&destination=${encodeURIComponent(destLat + ',' + destLng)}` +
                                    `&travelmode=driving`;

                                  window.open(mapsUrl, '_blank');
                                } else {
                                  alert('Invalid latitude or longitude values.');
                                }
                              } else {
                                alert('Start or end location missing for this entry.');
                              }
                            }}
                            className="text-yellow-600 hover:bg-yellow-50 h-8 w-8 rounded-lg transition-colors"
                            title="View on Map"
                          >
                            <BiMap className="w-4 h-4" />
                          </Button>

                          {(auth.user.role === 'admin' ||
                            auth.user.role === 'dispatcher' ||
                            auth.user.role === 'client') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(entry)}
                              className="text-blue-600 hover:bg-blue-50 h-8 w-8 rounded-lg transition-colors"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          )}
                          {(auth.user.role === 'admin' || auth.user.role === 'dispatcher') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingId(entry._id);
                                onDelete(entry._id);
                              }}
                              disabled={deletingId === entry._id}
                              className="text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
        )}
      </CardContent>

      {/* Photos Modal */}
      <Dialog
        open={selectedPhotos !== null}
        onOpenChange={(open) => !open && setSelectedPhotos(null)}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-gradient-to-r from-[#c16840] to-[#d17a4f] text-white -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Photos ({selectedPhotos?.length || 0})
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {selectedPhotos?.map((photoUrl, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group cursor-pointer shadow-md hover:shadow-xl transition-all hover:scale-105"
                onClick={() => window.open(photoUrl, '_blank')}
              >
                <img
                  src={photoUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm text-sm font-semibold">
                    Click to Open Full Size
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
