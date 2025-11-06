'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PhotoCapture } from './photo-capture';

interface TimeEntry {
  _id?: string;
  id?: string;
  startTime?: Date | string;
  start?: {
    startTime: string | Date;
    location: string;
    lat: number;
    lng: number;
  };
  startLocation?: {
    lat: number;
    lng: number;
    address?: string;
    location?: string;
  };
  description: string;
  isActive?: boolean;
}

interface ActiveTimerDisplayProps {
  activeTimer: TimeEntry | null;
  onStop: (id: string, data: any) => void;
}

export function ActiveTimerDisplay({ activeTimer, onStop }: ActiveTimerDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [endDescription, setEndDescription] = useState('');
  const [endLocation, setEndLocation] = useState({ lat: 0, lng: 0, address: '' });
  const [loading, setLoading] = useState(false);
  const [endPhotos, setEndPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTimeStr = activeTimer.start?.startTime || activeTimer.startTime;
      if (!startTimeStr) return;
      const startTime = new Date(startTimeStr);
      const diff = now.getTime() - startTime.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsedTime({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  useEffect(() => {
    if (showStopDialog && navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEndLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(
              4
            )}`,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoading(false);
        }
      );
    }
  }, [showStopDialog]);

  if (!activeTimer) return null;

  const formatTime = (num: number) => String(num).padStart(2, '0');

  const getLocationInfo = () => {
    if (activeTimer.start) {
      return {
        address: activeTimer.start.location || 'Unknown Location',
        lat: activeTimer.start.lat || 0,
        lng: activeTimer.start.lng || 0,
      };
    }
    if (activeTimer.startLocation) {
      return {
        address:
          activeTimer.startLocation.address ||
          activeTimer.startLocation.location ||
          'Unknown Location',
        lat: activeTimer.startLocation.lat || 0,
        lng: activeTimer.startLocation.lng || 0,
      };
    }
    return {
      address: 'Unknown Location',
      lat: 0,
      lng: 0,
    };
  };

  const locationInfo = getLocationInfo();
  const timerId = activeTimer._id || activeTimer.id || '';

  const handleConfirmStop = () => {
    onStop(timerId, {
      location: {
        address: endLocation.address || locationInfo.address,
        lat: endLocation.lat || locationInfo.lat,
        lng: endLocation.lng || locationInfo.lng,
      },
      description: endDescription || activeTimer?.description,
      photos: endPhotos,
    });

    setShowStopDialog(false);
    setEndDescription('');
    setEndPhotos([]);
  };

  return (
    <>
      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg py-0 pb-3">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Timer Display */}
            <div className="flex-1">
              <div className="flex items-center flex-col sm:flex-row  gap-4">
                {/* Animated Pulse Indicator */}
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-pulse w-4 h-4 bg-primary rounded-full"></div>
                  <span className="text-xs font-semibold text-primary">ACTIVE</span>
                </div>

                {/* Timer Content */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Task</p>
                  <p className="font-semibold text-foreground text-lg mb-3">
                    {activeTimer.description || 'No description'}
                  </p>

                  {/* Large Timer Display */}
                  <div className="bg-secondary/50 rounded-lg p-4 border border-primary/20 mb-3">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-5xl font-bold text-primary font-mono">
                        {formatTime(elapsedTime.hours)}
                      </span>
                      <span className="text-3xl text-primary/70 font-mono">:</span>
                      <span className="text-5xl font-bold text-primary font-mono">
                        {formatTime(elapsedTime.minutes)}
                      </span>
                      <span className="text-3xl text-primary/70 font-mono">:</span>
                      <span className="text-5xl font-bold text-primary font-mono">
                        {formatTime(elapsedTime.seconds)}
                      </span>
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-2">HH:MM:SS</p>
                  </div>

                  {/* Location Info */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{locationInfo.address}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Lat: {locationInfo.lat.toFixed(4)}, Lng: {locationInfo.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stop Button */}
            <div className="flex flex-col gap-2 md:w-auto w-full">
              <Button
                onClick={() => {
                  setShowStopDialog(true);
                  setEndDescription(activeTimer?.description || '');
                }}
                variant="destructive"
                size="lg"
                className="w-full md:w-auto"
              >
                <Pause className="w-5 h-5 mr-2" />
                Stop Timer
              </Button>
              <p className="text-xs text-center text-muted-foreground">Click to end tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stop Timer Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stop Timer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">End Description</label>
              <Textarea
                placeholder="What did you complete?"
                value={endDescription}
                onChange={(e) => setEndDescription(e.target.value)}
                className="bg-gray-50 border-gray-300 resize-none h-20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                End Location
              </label>
              {loading ? (
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                  <p className="text-sm text-muted-foreground">Getting location...</p>
                </div>
              ) : (
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                  <p className="text-sm font-mono">
                    {endLocation.address || 'Location not available'}
                  </p>
                  {endLocation.lat !== 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Lat: {endLocation.lat.toFixed(4)}, Lng: {endLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              )}
            </div>

            <PhotoCapture onPhotosChange={setEndPhotos} maxPhotos={5} />

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStopDialog(false);
                  setEndDescription('');
                  setEndPhotos([]);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmStop} variant="destructive" className="flex-1">
                <Pause className="w-4 h-4 mr-2" />
                Stop Timer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
