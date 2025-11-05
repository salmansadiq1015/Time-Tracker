'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  X,
  Loader2,
  Clock,
  MapPin,
  FileText,
  Camera,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { PhotoCapture } from './photo-capture';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  isActive: boolean;
  photos?: string[];
  status?: string;
  verifiedByClient?: boolean;
  client?: string | { _id: string; name: string; email: string };
}

interface EditTimerModalProps {
  entry: TimeEntry;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function EditTimerModal({ entry, onClose, onSave }: EditTimerModalProps) {
  const { auth } = useAuthContent();
  const [description, setDescription] = useState(entry.description);
  const [startTime, setStartTime] = useState(entry.start.startTime);
  const [endTime, setEndTime] = useState(entry.end?.endTime || '');
  const [startLocation, setStartLocation] = useState(entry.start.location);
  const [endLocation, setEndLocation] = useState(entry.end?.location || '');
  const [photos, setPhotos] = useState<string[]>(entry.photos || []);
  const [status, setStatus] = useState<string>(entry.status || 'active');
  const [verifiedByClient, setVerifiedByClient] = useState<boolean>(
    entry.verifiedByClient || false
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {
        description,
        start: {
          startTime,
          location: startLocation,
          lat: entry.start.lat,
          lng: entry.start.lng,
        },
        photos,
        status,
        verifiedByClient,
      };

      // Always set client to current user ID
      updateData.client = auth?.user?._id || '';

      if (endTime) {
        updateData.end = {
          endTime,
          location: endLocation,
          lat: entry.end?.lat || entry.start.lat,
          lng: entry.end?.lng || entry.start.lng,
        };
      }

      onSave(updateData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-3xl border-0 bg-white shadow-2xl shadow-black/50 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[97vh] overflow-y-auto py-0 pb-4">
        {/* Header */}
        <CardHeader className="relative bg-gradient-to-r from-[#c16840] via-[#d17a4f] to-[#c16840] py-4 px-6 border-b border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-white text-xl font-semibold">Edit Timer Entry</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={saving}
              className="text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Description Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-semibold text-black">Description</label>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What were you working on?"
                className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 resize-none h-24 focus:border-[#c16840]/50 focus:ring-1 focus:ring-[#c16840]/20 transition-all"
                disabled={saving}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Start Time & Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-semibold text-black">Start Details</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Start Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={startTime.slice(0, 16)}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840]/50 focus:ring-1 focus:ring-[#c16840]/20 transition-all"
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    Start Location
                  </label>
                  <Input
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Enter location address"
                    className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-[#c16840]/50 focus:ring-1 focus:ring-[#c16840]/20 transition-all"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* End Time & Location */}
            {entry.end && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <label className="text-sm font-semibold text-black">End Details</label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        End Time
                      </label>
                      <Input
                        type="datetime-local"
                        value={endTime.slice(0, 16)}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840]/50 focus:ring-1 focus:ring-[#c16840]/20 transition-all"
                        disabled={saving}
                        min={startTime ? startTime.slice(0, 16) : undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        End Location
                      </label>
                      <Input
                        value={endLocation}
                        onChange={(e) => setEndLocation(e.target.value)}
                        placeholder="Enter location address"
                        className="bg-gray-50 border-gray-300 text-black placeholder:text-gray-500 focus:border-[#c16840]/50 focus:ring-1 focus:ring-[#c16840]/20 transition-all"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Photos Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-semibold text-black">Photos</label>
                {photos.length > 0 && (
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
                  </span>
                )}
              </div>
              <PhotoCapture onPhotosChange={setPhotos} existingPhotos={photos} maxPhotos={5} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-semibold text-black">Status</label>
              </div>
              <div className="space-y-2">
                <Select value={status} onValueChange={setStatus} disabled={saving}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840]/50 focus:ring-1 focus:ring-[#c16840]/20 transition-all">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="active" className="text-black focus:bg-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Active
                      </span>
                    </SelectItem>
                    <SelectItem value="approved" className="text-black focus:bg-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Approved
                      </span>
                    </SelectItem>
                    <SelectItem value="flagged" className="text-black focus:bg-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Flagged
                      </span>
                    </SelectItem>
                    <SelectItem value="archived" className="text-black focus:bg-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                        Archived
                      </span>
                    </SelectItem>
                    <SelectItem value="pending" className="text-black focus:bg-gray-100">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Pending
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Verified By Client */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <Checkbox
                id="verifiedByClient"
                checked={verifiedByClient}
                onCheckedChange={(checked) => setVerifiedByClient(checked === true)}
                disabled={saving}
                className="border-gray-400 data-[state=checked]:bg-[#c16840] data-[state=checked]:border-[#c16840]"
              />
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle2
                  className={`w-4 h-4 ${verifiedByClient ? 'text-green-500' : 'text-gray-400'}`}
                />
                <label
                  htmlFor="verifiedByClient"
                  className="text-sm font-medium text-black leading-none cursor-pointer select-none"
                >
                  Verified By Client
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-300">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="flex-1 bg-transparent border-gray-300 text-black hover:bg-gray-100 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#c16840] to-[#d17a4f] hover:from-[#d17a4f] hover:to-[#c16840] text-white shadow-lg shadow-[#c16840]/20 hover:shadow-[#c16840]/30 transition-all font-medium"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
