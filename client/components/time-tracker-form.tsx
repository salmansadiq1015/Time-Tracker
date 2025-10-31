"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthContent } from "@/app/context/authContext";
import { Textarea } from "./ui/textarea";

interface TimeTrackerFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isStarting: boolean;
}

export function TimeTrackerForm({
  onSubmit,
  onCancel,
  isStarting,
}: TimeTrackerFormProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { auth } = useAuthContent();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(
              4
            )}, ${position.coords.longitude.toFixed(4)}`,
          });
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location Error",
            description:
              "Could not get your location. Please enable location services.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      onSubmit({ description, location, userId: auth?.user?._id });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/50 bg-primary/5 text-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{isStarting ? "Start Timer" : "Stop Timer"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={submitting}
              className="bg-gray-800 border-gray-800 resize-none h-20 "
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Current Location
            </label>
            {loading ? (
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/30 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Getting location...
                </span>
              </div>
            ) : (
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                <p className="text-sm font-mono">{location.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || submitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isStarting ? "Starting..." : "Stopping..."}
                </>
              ) : isStarting ? (
                "Start"
              ) : (
                "Stop"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
