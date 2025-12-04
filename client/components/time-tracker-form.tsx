'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContent } from '@/app/context/authContext';
import { Textarea } from './ui/textarea';
import { PhotoCapture } from './photo-capture';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';

interface TimeTrackerFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isStarting: boolean;
}

interface Project {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  description: string;
}

export function TimeTrackerForm({ onSubmit, onCancel, isStarting }: TimeTrackerFormProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const { auth } = useAuthContent();

  // Fetch projects for the user
  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth?.user?._id) return;
      setLoadingProjects(true);
      try {
        const employeeId = auth.user.role === 'user' ? auth.user._id : '';
        const params = new URLSearchParams({
          page: '1',
          limit: '100',
        });
        // if (employeeId) params.append('employeeId', employeeId);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/all?${params}`
        );
        if (response.data?.success && response.data?.projects) {
          setProjects(response.data.projects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [auth]);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!auth?.user?._id) return;
      setLoadingAssignments(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '100',
        });

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/assignments/all?${params}`
        );
        if (response.data?.success && response.data?.assignments) {
          setAssignments(response.data.assignments);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, [auth]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
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
          toast({
            title: 'Location Error',
            description: 'Could not get your location. Please enable location services.',
            variant: 'destructive',
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
        title: 'Error',
        description: 'Please enter a description',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      onSubmit({
        description,
        location,
        userId: auth?.user?._id,
        photos,
        project: selectedProject && selectedProject !== 'none' ? selectedProject : undefined,
        assignment:
          selectedAssignment && selectedAssignment !== 'none' ? selectedAssignment : undefined,
        company: company || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-gray-700/50 bg-[#1e2339] shadow-xl text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-700/50">
        <CardTitle className="text-xl font-bold text-white">
          {isStarting ? 'Start Timer' : 'Stop Timer'}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="hover:bg-gray-700/50 text-gray-300 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200">Description</label>
            <Textarea
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={submitting}
              className="bg-[#0f1419] border-gray-600 hover:border-gray-500 focus:border-gray-500 resize-none h-20 transition-colors text-white placeholder:text-gray-500"
            />
          </div>

          {/* Project & Assignment Selection - Side by side on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                <span>Project</span>
                <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <Select
                value={selectedProject || undefined}
                onValueChange={(value) => setSelectedProject(value === 'none' ? '' : value)}
                disabled={submitting || loadingProjects}
              >
                <SelectTrigger className="w-full bg-[#0f1419] border-gray-600 hover:border-gray-500 focus:border-gray-500 transition-colors h-10 text-white">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-[#1e2339] border-gray-700">
                  <SelectItem value="none" className="text-gray-400">
                    None
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem
                      key={project._id}
                      value={project._id}
                      className="text-white hover:bg-gray-700"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                <span>Task</span>
                <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <Select
                value={selectedAssignment || undefined}
                onValueChange={(value) => setSelectedAssignment(value === 'none' ? '' : value)}
                disabled={submitting || loadingAssignments}
              >
                <SelectTrigger className="w-full bg-[#0f1419] border-gray-600 hover:border-gray-500 focus:border-gray-500 transition-colors h-10 text-white">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-[#1e2339] border-gray-700">
                  <SelectItem value="none" className="text-gray-400">
                    None
                  </SelectItem>
                  {assignments.map((assignment) => (
                    <SelectItem
                      key={assignment._id}
                      value={assignment._id}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex flex-col">
                        <span className="truncate max-w-[200px]">{assignment.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {assignments.length === 0 && (
                    <SelectItem value="no-assignments" disabled className="text-gray-500 italic">
                      No tasks found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
                <span>Company</span>
                <span className="text-xs font-normal text-gray-400">(Optional)</span>
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter company name"
                disabled={submitting}
                className="bg-[#0f1419] border-gray-600 hover:border-gray-500 focus:border-gray-500 transition-colors h-10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Current Location
            </label>
            {loading ? (
              <div className="p-4 bg-[#0f1419] rounded-lg border border-gray-700 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-300">Getting location...</span>
              </div>
            ) : (
              <div className="p-4 bg-[#0f1419] rounded-lg border border-gray-700">
                <p className="text-sm font-mono text-white font-medium">{location.address}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          <PhotoCapture onPhotosChange={setPhotos} maxPhotos={5} />

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || submitting}
              className="flex-1 bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 font-semibold h-11 shadow-lg hover:shadow-xl transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isStarting ? 'Starting...' : 'Stopping...'}
                </>
              ) : isStarting ? (
                'Start Timer'
              ) : (
                'Stop Timer'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 bg-[#0f1419] border-gray-600 hover:bg-gray-800 hover:border-gray-500 text-gray-300 font-semibold h-11 transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
