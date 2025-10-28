"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, MapPin } from "lucide-react";

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

export function ActiveTimerDisplay({
  activeTimer,
  onStop,
}: ActiveTimerDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startTimeStr =
        activeTimer.start?.startTime || activeTimer.startTime;
      const startTime = new Date(startTimeStr);
      const diff = now.getTime() - startTime.getTime();

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsedTime({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  if (!activeTimer) return null;

  const formatTime = (num: number) => String(num).padStart(2, "0");

  const getLocationInfo = () => {
    if (activeTimer.start) {
      return {
        address: activeTimer.start.location || "Unknown Location",
        lat: activeTimer.start.lat || 0,
        lng: activeTimer.start.lng || 0,
      };
    }
    if (activeTimer.startLocation) {
      return {
        address:
          activeTimer.startLocation.address ||
          activeTimer.startLocation.location ||
          "Unknown Location",
        lat: activeTimer.startLocation.lat || 0,
        lng: activeTimer.startLocation.lng || 0,
      };
    }
    return {
      address: "Unknown Location",
      lat: 0,
      lng: 0,
    };
  };

  const locationInfo = getLocationInfo();
  const timerId = activeTimer._id || activeTimer.id || "";

  return (
    <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg py-0 pb-3">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Timer Display */}
          <div className="flex-1">
            <div className="flex items-center flex-col sm:flex-row  gap-4">
              {/* Animated Pulse Indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className="animate-pulse w-4 h-4 bg-primary rounded-full"></div>
                <span className="text-xs font-semibold text-primary">
                  ACTIVE
                </span>
              </div>

              {/* Timer Content */}
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Current Task
                </p>
                <p className="font-semibold text-foreground text-lg mb-3">
                  {activeTimer.description || "No description"}
                </p>

                {/* Large Timer Display */}
                <div className="bg-secondary/50 rounded-lg p-4 border border-primary/20 mb-3">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-5xl font-bold text-primary font-mono">
                      {formatTime(elapsedTime.hours)}
                    </span>
                    <span className="text-3xl text-primary/70 font-mono">
                      :
                    </span>
                    <span className="text-5xl font-bold text-primary font-mono">
                      {formatTime(elapsedTime.minutes)}
                    </span>
                    <span className="text-3xl text-primary/70 font-mono">
                      :
                    </span>
                    <span className="text-5xl font-bold text-primary font-mono">
                      {formatTime(elapsedTime.seconds)}
                    </span>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    HH:MM:SS
                  </p>
                </div>

                {/* Location Info */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{locationInfo.address}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  Lat: {locationInfo.lat.toFixed(4)}, Lng:{" "}
                  {locationInfo.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>

          {/* Stop Button */}
          <div className="flex flex-col gap-2 md:w-auto w-full">
            <Button
              onClick={() =>
                onStop(timerId, {
                  location: {
                    address: locationInfo.address,
                    lat: locationInfo.lat,
                    lng: locationInfo.lng,
                  },
                  description: activeTimer.description,
                })
              }
              variant="destructive"
              size="lg"
              className="w-full md:w-auto"
            >
              <Pause className="w-5 h-5 mr-2" />
              Stop Timer
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Click to end tracking
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
