'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, MapPin, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PhotoCapture } from './photo-capture';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

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
  status?: string;
  paused?: boolean;
  pausedAt?: string;
  pausedDuration?: number;
}

interface ActiveTimerDisplayProps {
  activeTimer: TimeEntry | null;
  onStop: (id: string, data: any) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
}

export function ActiveTimerDisplay({
  activeTimer,
  onStop,
  onPause,
  onResume,
}: ActiveTimerDisplayProps) {
  const { toast } = useToast();
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
  const [pausing, setPausing] = useState(false);
  const [paused, setPaused] = useState(false);
  const pauseRequestRef = useRef<AbortController | null>(null);
  const resumeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!activeTimer) {
      setPaused(false);
      return;
    }

    // Update paused state
    const isPaused = activeTimer.status === 'paused' || activeTimer.paused || false;
    setPaused(isPaused);

    // If paused, show the time when it was paused (frozen display)
    if (isPaused) {
      const startTimeStr = activeTimer.start?.startTime || activeTimer.startTime;
      if (startTimeStr) {
        const startTime = new Date(startTimeStr);
        const pausedAt = activeTimer.pausedAt ? new Date(activeTimer.pausedAt) : new Date();

        // Calculate elapsed time up to when it was paused, excluding previous paused duration
        const pausedDuration = activeTimer.pausedDuration
          ? activeTimer.pausedDuration * 60 * 1000
          : 0;
        const diff = pausedAt.getTime() - startTime.getTime() - pausedDuration;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setElapsedTime({ hours, minutes, seconds });
      }
      return;
    }

    // Update timer if active
    const interval = setInterval(() => {
      const now = new Date();
      const startTimeStr = activeTimer.start?.startTime || activeTimer.startTime;
      if (!startTimeStr) return;
      const startTime = new Date(startTimeStr);

      // Calculate elapsed time excluding paused duration
      const pausedDuration = activeTimer.pausedDuration
        ? activeTimer.pausedDuration * 60 * 1000
        : 0;
      const diff = now.getTime() - startTime.getTime() - pausedDuration;

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

  const handlePause = async () => {
    // Prevent multiple calls - check all conditions
    if (!activeTimer || pausing || paused) {
      return;
    }

    // Check if already paused
    if (activeTimer.status === 'paused' || activeTimer.paused) {
      setPaused(true);
      return;
    }

    // Cancel any existing pause request
    if (pauseRequestRef.current) {
      pauseRequestRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    pauseRequestRef.current = abortController;

    setPausing(true);
    setPaused(true); // Set immediately to prevent duplicate calls

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/pause/${timerId}`,
        {},
        {
          signal: abortController.signal,
        }
      );

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (response.data?.success) {
        toast({
          title: 'Timer Paused',
          description: 'You can now start a new timer or resume this one later.',
        });
        if (onPause) {
          onPause(timerId);
        }
      } else {
        // Reset if failed
        setPaused(false);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (axios.isCancel(error) || error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }

      console.error('Pause error:', error);
      // Reset on error
      setPaused(false);

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
      setPausing(false);
      pauseRequestRef.current = null;
    }
  };

  const handleResume = async () => {
    // Prevent multiple calls - check all conditions
    if (!activeTimer || pausing || !paused) {
      return;
    }

    // Check if not paused
    if (!activeTimer.paused && activeTimer.status !== 'paused') {
      return;
    }

    // Cancel any existing resume request
    if (resumeRequestRef.current) {
      resumeRequestRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    resumeRequestRef.current = abortController;

    setPausing(true);
    setPaused(false); // Set immediately to prevent duplicate calls

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/time-tracker/resume/${timerId}`,
        {},
        {
          signal: abortController.signal,
        }
      );

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (response.data?.success) {
        toast({
          title: 'Timer Resumed',
          description: 'Timer has been resumed successfully.',
        });
        if (onResume) {
          onResume(timerId);
        }
      } else {
        // Reset if failed
        setPaused(true);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (axios.isCancel(error) || error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }

      console.error('Resume error:', error);
      // Reset on error
      setPaused(true);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to resume timer',
        variant: 'destructive',
      });
    } finally {
      setPausing(false);
      resumeRequestRef.current = null;
    }
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
                  {activeTimer.status === 'paused' || activeTimer.paused ? (
                    <>
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-yellow-500">PAUSED</span>
                    </>
                  ) : (
                    <>
                      <div className="animate-pulse w-4 h-4 bg-primary rounded-full"></div>
                      <span className="text-xs font-semibold text-primary">ACTIVE</span>
                    </>
                  )}
                </div>

                {/* Timer Content */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Work</p>
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

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 md:w-auto w-full">
              {activeTimer.status === 'paused' || activeTimer.paused ? (
                <>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!pausing && paused) {
                        handleResume();
                      }
                    }}
                    disabled={pausing || !paused}
                    variant="default"
                    size="lg"
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {pausing ? 'Resuming...' : 'Resume Timer'}
                  </Button>
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
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!pausing && !paused) {
                        handlePause();
                      }
                    }}
                    disabled={pausing || paused}
                    variant="outline"
                    size="lg"
                    className="w-full md:w-auto border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    {pausing ? 'Pausing...' : paused ? 'Paused' : 'Pause Timer'}
                  </Button>
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
                  <p className="text-xs text-center text-muted-foreground">Pause to switch tasks</p>
                </>
              )}
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
