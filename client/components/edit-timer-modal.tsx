"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
}

interface EditTimerModalProps {
  entry: TimeEntry;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function EditTimerModal({
  entry,
  onClose,
  onSave,
}: EditTimerModalProps) {
  const [description, setDescription] = useState(entry.description);
  const [startTime, setStartTime] = useState(entry.start.startTime);
  const [endTime, setEndTime] = useState(entry.end?.endTime || "");
  const [startLocation, setStartLocation] = useState(entry.start.location);
  const [endLocation, setEndLocation] = useState(entry.end?.location || "");
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
      };

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-purple-600 bg-gray-800/90 py-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-purple-600 py-3">
          <CardTitle>Edit Timer</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={saving}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What were you working on?"
              className="bg-gray-800 border-gray-700 resize-none h-20"
              disabled={saving}
            />
          </div>

          {/* Start Time & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="datetime-local"
                value={startTime.slice(0, 16)}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-gray-800 border-gray-700"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Location</label>
              <Input
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="Location address"
                className="bg-gray-800 border-gray-700"
                disabled={saving}
              />
            </div>
          </div>

          {/* End Time & Location */}
          {entry.end && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="datetime-local"
                  value={endTime.slice(0, 16)}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                  disabled={saving}
                  min={startTime ? startTime.slice(0, 16) : undefined}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Location</label>
                <Input
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="Location address"
                  className="bg-gray-800 border-gray-700"
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border/30 py-4">
            <Button
              variant="destructive"
              onClick={onClose}
              disabled={saving}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
