'use client';

import { Fragment, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthContent } from '@/app/context/authContext';

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
  verifiedByClient?: boolean;
  client?: string | { _id: string; name: string; email: string };
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

interface TimeTrackerTableProps {
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

export function TimeTrackerTable({
  entries,
  onDelete,
  onEdit,
  loading = false,
  pagination,
  onPageChange,
  onFilterByUser,
}: TimeTrackerTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);
  const [photoModalTitle, setPhotoModalTitle] = useState<string>('Photos');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
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
      const diffHours = (endTime - startTime) / 3600000;
      if (!Number.isFinite(diffHours) || diffHours <= 0) return null;
      return diffHours.toFixed(2);
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

  const getProjectName = (project?: string | { _id: string; name: string }) => {
    if (!project) return '-';
    if (typeof project === 'string') return project;
    return project.name || '-';
  };

  const getTaskName = (task?: string | { _id: string; title: string }) => {
    if (!task) return '-';
    if (typeof task === 'string') return task;
    return task.title || '-';
  };

  const normalizeCoordinate = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const isValidLatLng = (lat: number | null, lng: number | null) => {
    if (lat === null || lng === null) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  const openLocationOnMap = (lat?: unknown, lng?: unknown) => {
    const normalizedLat = normalizeCoordinate(lat);
    const normalizedLng = normalizeCoordinate(lng);

    if (!isValidLatLng(normalizedLat, normalizedLng)) {
      alert('Invalid latitude or longitude values.');
      return;
    }

    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${normalizedLat},${normalizedLng}`
    )}`;
    window.open(mapsUrl, '_blank');
  };

  const openRouteInMaps = (
    startCoords?: { lat?: unknown; lng?: unknown },
    endCoords?: { lat?: unknown; lng?: unknown }
  ) => {
    const startLat = normalizeCoordinate(startCoords?.lat);
    const startLng = normalizeCoordinate(startCoords?.lng);
    const endLat = normalizeCoordinate(endCoords?.lat);
    const endLng = normalizeCoordinate(endCoords?.lng);

    if (!isValidLatLng(startLat, startLng) || !isValidLatLng(endLat, endLng)) {
      alert('Start or end location missing or invalid for this entry.');
      return;
    }

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${encodeURIComponent(`${startLat},${startLng}`)}` +
      `&destination=${encodeURIComponent(`${endLat},${endLng}`)}` +
      `&travelmode=driving`;

    window.open(mapsUrl, '_blank');
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openPhotoModal = (photos: string[] | undefined, title: string) => {
    if (!photos || photos.length === 0) return;
    setSelectedPhotos(photos);
    setPhotoModalTitle(title);
  };

  const renderPhotoPreview = (photos: string[] | undefined, title: string) => {
    if (!photos || photos.length === 0) {
      return <p className="text-xs text-muted-foreground">No photos uploaded.</p>;
    }

    const previewPhotos = photos.slice(0, 3);

    return (
      <div className="flex flex-wrap gap-3">
        {previewPhotos.map((photoUrl, idx) => (
          <button
            type="button"
            key={`${title}-${idx}`}
            onClick={() => openPhotoModal(photos, title)}
            className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:border-[#c16840] hover:shadow-md transition"
            title={`View ${title.toLowerCase()}`}
          >
            <img
              src={photoUrl}
              alt={`${title} ${idx + 1}`}
              className="h-full w-full object-cover"
            />
            {idx === previewPhotos.length - 1 && photos.length > previewPhotos.length && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-xs font-semibold text-white">
                  +{photos.length - previewPhotos.length}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderLocationContent = (
    address: string | undefined,
    lat?: number | null,
    lng?: number | null,
    fallbackLabel?: string,
    variant: 'start' | 'end' = 'start'
  ) => {
    const hasCoords = lat != null && lng != null && isValidLatLng(lat, lng);
    const cleanedAddress = address
      ?.replace(/\r?\n|\r/g, ' ')
      ?.replace(/\s+/g, ' ')
      ?.trim();

    if (hasCoords && lat != null && lng != null) {
      const titleParts = [] as string[];
      titleParts.push(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      if (cleanedAddress) titleParts.push(cleanedAddress);
      if (fallbackLabel) titleParts.push(fallbackLabel);
      const title = titleParts.filter(Boolean).join(' • ');
      const Icon = variant === 'end' ? Map : MapPin;

      return (
        <button
          type="button"
          onClick={() => openLocationOnMap(lat, lng)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 hover:text-amber-800"
          title={title || 'Open in Google Maps'}
        >
          <Icon className="h-4 w-4" />
        </button>
      );
    }

    if (cleanedAddress) {
      return (
        <span className="text-xs text-gray-700 max-w-[200px] line-clamp-2">{cleanedAddress}</span>
      );
    }

    return (
      <span className="text-[11px] uppercase tracking-wide text-gray-400">
        {fallbackLabel || 'No location provided'}
      </span>
    );
  };

  const validEntries = entries.filter((entry) => entry && entry._id);

  return (
    <Card className="border-gray-200 bg-white shadow-lg overflow-hidden py-0">
      <CardContent className="p-0 ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-[#c16840] to-[#d17a4f] text-white border-b-2 border-gray-200">
              <tr>
                <th className="w-12 px-4" />
                <th className="text-left py-4 px-4 min-w-40 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  User
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider min-w-60">
                  Description
                </th>
                <th className="text-left py-4 px-4 min-w-32 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Project
                </th>
                <th className="text-left py-4 px-4 min-w-32 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Task
                </th>

                <th className="text-left py-4 px-4 min-w-60 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Start Time
                </th>
                <th className="text-left py-4 px-4 font-semibold min-w-25 text-gray-50 uppercase text-xs tracking-wider">
                  Start Location
                </th>
                <th className="text-left py-4 px-4 min-w-36 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  End Time
                </th>
                <th className="text-left py-4 px-4 font-semibold  min-w-25 text-gray-50 uppercase text-xs tracking-wider">
                  End Location
                </th>
                <th className="text-right py-4 px-4 font-semibold text-gray-50 uppercase text-xs tracking-wider">
                  Duration
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
                      <td colSpan={12} className="py-4 px-4">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : validEntries.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 px-4 text-center">
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
                  const duration = getDurationDisplay(entry);
                  const startLat = normalizeCoordinate(entry.start?.lat);
                  const startLng = normalizeCoordinate(entry.start?.lng);
                  const endLat = normalizeCoordinate(entry.end?.lat);
                  const endLng = normalizeCoordinate(entry.end?.lng);
                  const startPhotos = entry.start?.photos || [];
                  const endPhotos = entry.end?.photos || [];
                  const startPhotoSet = new Set(startPhotos);
                  const endPhotoSet = new Set(endPhotos);
                  const additionalPhotos =
                    entry.photos?.filter(
                      (photo) => !startPhotoSet.has(photo) && !endPhotoSet.has(photo)
                    ) || [];

                  return (
                    <Fragment key={entry._id}>
                      <tr
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          entry.isActive ? 'bg-orange-50/50' : ''
                        }`}
                      >
                        <td className="py-4 px-4 align-top">
                          <button
                            type="button"
                            onClick={() => toggleRow(entry._id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#c16840] hover:text-[#c16840] transition"
                            aria-label={
                              expandedRows[entry._id] ? 'Collapse details' : 'Expand details'
                            }
                          >
                            {expandedRows[entry._id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div className="min-w-0">
                              {entry.user?._id ? (
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
                                        entry.user.createdby &&
                                        typeof entry.user.createdby === 'object'
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
                                  className="text-left text-sm font-semibold text-[#c16840] hover:text-[#9e4f2b] hover:underline underline-offset-2 transition truncate"
                                  title="Filter timers by this user"
                                >
                                  {entry.user?.name || 'Unknown'}
                                </button>
                              ) : (
                                <span className="text-sm font-medium text-gray-700">N/A</span>
                              )}
                              {entry.user?.email && (
                                <p className="text-xs text-gray-500 truncate">{entry.user.email}</p>
                              )}
                              {entry.user?.role && (
                                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                                  {entry.user.role}
                                </p>
                              )}
                            </div>
                          </div>
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
                        <td className="py-4 px-4">
                          <span className="text-gray-700 text-sm">
                            {getProjectName(entry.project)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-700 text-sm">{getTaskName(entry.task)}</span>
                        </td>
                        {/* <td className="py-4 px-4">
                          <button
                            type="button"
                            className="text-gray-600 text-xs font-mono hover:text-[#c16840] transition-colors"
                            onClick={() => openRouteInMaps(entry.start, entry.end)}
                          >
                            {formatDate(startTime)}
                          </button>
                        </td> */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-700 text-xs font-mono">
                              {formatDate(startTime)} - {formatTime(startTime)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {renderLocationContent(
                              entry.start?.location,
                              startLat,
                              startLng,
                              'Start location',
                              'start'
                            )}
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
                          <div className="flex items-center gap-2">
                            {entry.end?.location || isValidLatLng(endLat, endLng) ? (
                              renderLocationContent(
                                entry.end?.location,
                                endLat,
                                endLng,
                                'End location',
                                'end'
                              )
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {duration ? (
                            <span className="font-bold text-[#c16840] text-sm">{duration}h</span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openRouteInMaps(entry.start, entry.end)}
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
                      {expandedRows[entry._id] && (
                        <tr className="bg-gray-50/70">
                          <td colSpan={12} className="px-6 py-5">
                            <div className="flex flex-col gap-6">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="text-xs uppercase tracking-wide text-gray-500">
                                    Selected Timer
                                  </p>
                                  <h4 className="text-lg font-semibold text-gray-900">
                                    {entry.description || 'Untitled'}
                                  </h4>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => openRouteInMaps(entry.start, entry.end)}
                                  >
                                    <Map className="h-4 w-4" />
                                    View Route
                                  </Button>
                                  {startPhotos.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2"
                                      onClick={() => openPhotoModal(startPhotos, 'Start Photos')}
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                      Start Photos
                                    </Button>
                                  )}
                                  {endPhotos.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2"
                                      onClick={() => openPhotoModal(endPhotos, 'End Photos')}
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                      End Photos
                                    </Button>
                                  )}
                                  {additionalPhotos.length > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2"
                                      onClick={() =>
                                        openPhotoModal(additionalPhotos, 'Additional Photos')
                                      }
                                    >
                                      <ImageIcon className="h-4 w-4" />
                                      Extra Photos
                                    </Button>
                                  )}
                                </div>
                              </div>

                              <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-3">
                                  <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Clock className="h-4 w-4 text-[#c16840]" />
                                    Start Details
                                  </h5>
                                  <div className="space-y-1 text-sm text-gray-700">
                                    <p>
                                      <span className="font-medium text-gray-900">Time:</span>{' '}
                                      {formatDate(startTime)} • {formatTime(startTime)}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium text-gray-900">Location:</span>
                                      {renderLocationContent(
                                        entry.start?.location,
                                        startLat,
                                        startLng,
                                        'Start location',
                                        'start'
                                      )}
                                      {!isValidLatLng(startLat, startLng) && (
                                        <span className="text-[11px] text-gray-400">
                                          Lat/Lng unavailable
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                      Start Photos
                                    </p>
                                    {renderPhotoPreview(startPhotos, 'Start Photos')}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Clock className="h-4 w-4 text-[#c16840]" />
                                    End Details
                                  </h5>
                                  <div className="space-y-1 text-sm text-gray-700">
                                    <p>
                                      <span className="font-medium text-gray-900">Time:</span>{' '}
                                      {endTime
                                        ? `${formatDate(endTime)} • ${formatTime(endTime)}`
                                        : 'N/A'}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                      <span className="font-medium text-gray-900">Location:</span>
                                      {renderLocationContent(
                                        entry.end?.location,
                                        endLat,
                                        endLng,
                                        'End location',
                                        'end'
                                      )}
                                      {entry.end?.location && !isValidLatLng(endLat, endLng) && (
                                        <span className="text-[11px] text-gray-400">
                                          Lat/Lng unavailable
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                      End Photos
                                    </p>
                                    {renderPhotoPreview(endPhotos, 'End Photos')}
                                  </div>
                                </div>
                              </div>

                              {additionalPhotos.length > 0 && (
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                    Uploaded Photos
                                  </p>
                                  {renderPhotoPreview(additionalPhotos, 'Additional Photos')}
                                </div>
                              )}

                              {/* <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                    Status
                                  </p>
                                  {getStatusBadge(entry.status)}
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                    Client
                                  </p>
                                  <div className="flex items-center gap-1 text-sm text-gray-700">
                                    <User className="h-3 w-3 text-gray-400 shrink-0" />
                                    <span>{getClientName(entry.client)}</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                                    Verified
                                  </p>
                                  {entry.verifiedByClient ? (
                                    <span className="inline-flex items-center gap-1 text-sm text-green-600">
                                      <CheckCircle2 className="h-4 w-4" /> Approved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                      <XCircle className="h-4 w-4" /> Pending
                                    </span>
                                  )}
                                </div>
                              </div> */}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
          <DialogHeader className="bg-linear-to-r from-[#c16840] to-[#d17a4f] text-white -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {photoModalTitle} ({selectedPhotos?.length || 0})
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
