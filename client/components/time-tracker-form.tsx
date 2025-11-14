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

interface Task {
  _id: string;
  title: string;
  project?: string | { _id: string; name: string };
}

export function TimeTrackerForm({ onSubmit, onCancel, isStarting }: TimeTrackerFormProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 0, lng: 0, address: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
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
        if (employeeId) params.append('employeeId', employeeId);

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

  // Fetch tasks for the user
  useEffect(() => {
    const fetchTasks = async () => {
      if (!auth?.user?._id) return;
      setLoadingTasks(true);
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '100',
        });

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks?${params}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.data?.success && response.data?.data) {
          setTasks(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [auth]);

  // Filter tasks based on selected project
  const filteredTasks = selectedProject
    ? tasks.filter((task) => {
        const taskProjectId =
          typeof task.project === 'string' ? task.project : task.project?._id;
        return taskProjectId === selectedProject;
      })
    : tasks;

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

  // Reset task when project changes (only if task doesn't belong to new project)
  useEffect(() => {
    if (selectedProject && selectedTask) {
      const taskProjectId =
        typeof tasks.find((t) => t._id === selectedTask)?.project === 'string'
          ? tasks.find((t) => t._id === selectedTask)?.project
          : tasks.find((t) => t._id === selectedTask)?.project?._id;
      if (taskProjectId !== selectedProject) {
        setSelectedTask('');
      }
    }
  }, [selectedProject, selectedTask, tasks]);

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
        task: selectedTask && selectedTask !== 'none' ? selectedTask : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-white shadow-lg text-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-amber-100">
        <CardTitle className="text-xl font-bold text-gray-800">
          {isStarting ? 'Start Timer' : 'Stop Timer'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} className="hover:bg-amber-50">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <Textarea
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={submitting}
              className="bg-white border-gray-300 hover:border-amber-400 focus:border-amber-500 resize-none h-20 transition-colors"
            />
          </div>

          {/* Project & Task Selection - Side by side on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <span>Project</span>
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <Select
                value={selectedProject || undefined}
                onValueChange={(value) => setSelectedProject(value === 'none' ? '' : value)}
                disabled={submitting || loadingProjects}
              >
                <SelectTrigger className="w-full bg-white border-gray-300 hover:border-amber-400 focus:border-amber-500 transition-colors h-10">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none" className="text-gray-500">
                    None
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <span>Task</span>
                <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <Select
                value={selectedTask || undefined}
                onValueChange={(value) => setSelectedTask(value === 'none' ? '' : value)}
                disabled={submitting || loadingTasks}
              >
                <SelectTrigger className="w-full bg-white border-gray-300 hover:border-amber-400 focus:border-amber-500 transition-colors h-10">
                  <SelectValue placeholder={selectedProject ? 'Select a task' : 'Select a task'} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="none" className="text-gray-500">
                    None
                  </SelectItem>
                  {filteredTasks.map((task) => (
                    <SelectItem key={task._id} value={task._id}>
                      {task.title}
                    </SelectItem>
                  ))}
                  {filteredTasks.length === 0 && (
                    <SelectItem value="no-tasks" disabled className="text-gray-400 italic">
                      No tasks found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              Current Location
            </label>
            {loading ? (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-sm text-gray-600">Getting location...</span>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm font-mono text-gray-800 font-medium">{location.address}</p>
                <p className="text-xs text-gray-500 mt-1.5">
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
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold h-11 shadow-md hover:shadow-lg transition-all"
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
              className="flex-1 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-semibold h-11 transition-all"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
