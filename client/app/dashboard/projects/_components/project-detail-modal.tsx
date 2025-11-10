'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, FileText, Loader2, User } from 'lucide-react';
import axios from 'axios';

interface ProjectDetailModalProps {
  projectId: string;
  onClose: () => void;
}

export function ProjectDetailModal({ projectId, onClose }: ProjectDetailModalProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/details/${projectId}`
      );

      setProject(data.project);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="border-amber-200">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!project) {
    return null;
  }

  const startDate = new Date(project.startDate).toLocaleDateString();
  const endDate = new Date(project.endDate).toLocaleDateString();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-amber-200 max-h-[97vh] overflow-y-auto shidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">{project?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/*
          <div className="mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-foreground">Client</h3>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-white p-3">
            <Avatar className="h-8 w-8 bg-sky-600">
              <AvatarFallback className="text-white">
                {project?.client?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {project?.client?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{project?.client?.email}</p>
            </div>
          </div>
          */}
          {/* Description */}
          {project.description && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                <h3 className="font-semibold text-foreground">Description</h3>
              </div>
              <p className="text-sm text-muted-foreground">{project?.description}</p>
            </div>
          )}

          {/* Location */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-foreground">Location</h3>
            </div>
            <p className="text-sm text-muted-foreground">{project?.city || project?.address}</p>
            <p className="text-xs text-muted-foreground">{project?.address}</p>
          </div>

          {/* Timeline */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-foreground">Timeline</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {startDate} → {endDate}
            </p>
          </div>

          {/* Team Members */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-foreground">
                Team Members ({project?.employees?.length || 0})
              </h3>
            </div>
            {project.employees && project.employees.length > 0 ? (
              <div className="space-y-2">
                {project.employees.map((emp: any) => (
                  <div
                    key={emp?._id}
                    className="flex items-center gap-3 rounded-lg border border-amber-200 bg-white p-3"
                  >
                    <Avatar className="h-8 w-8 bg-amber-600">
                      <AvatarFallback className="text-white">
                        {emp?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{emp?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp?.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No team members assigned</p>
            )}
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project?.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-amber-100 text-amber-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
