'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Users, MapPin, Calendar, Edit2, Trash2, UserPlus, Eye } from 'lucide-react';
import { ProjectDetailModal } from './project-detail-modal';
import { EditProjectModal } from './edit-project-modal';
import { ManageEmployeesModal } from './manage-employees-modal';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Project {
  _id: string;
  name: string;
  client: string;
  address: string;
  location?: string;
  description: string;
  startDate: string;
  endDate: string;
  employees: any[];
  tags?: string[];
  isActive: boolean;
}

interface ProjectCardProps {
  project: Project;
  onRefresh: () => void;
}

export function ProjectCard({ project, onRefresh }: ProjectCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showManageEmployees, setShowManageEmployees] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the project.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeleting(true);
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/delete/${project._id}`
      );
      if (data) {
        onRefresh();
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const startDate = new Date(project.startDate).toLocaleDateString();
  const endDate = new Date(project.endDate).toLocaleDateString();

  return (
    <>
      <Card className="group overflow-hidden border-amber-200 bg-white transition-all hover:shadow-lg">
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2 text-lg text-foreground">{project.name}</CardTitle>
              {/* <p className="mt-1 text-sm text-muted-foreground">#{project.client}</p> */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-[0] transition-opacity group-hover:opacity-[1] cursor-pointer text-black"
                >
                  <MoreVertical className="h-4 w-4 text-black" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-black">
                <DropdownMenuItem onClick={() => setShowDetail(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowManageEmployees(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Team
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span className="line-clamp-1">{project.location || project.address}</span>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0 text-amber-600" />
            <span>
              {startDate} → {endDate}
            </span>
          </div>

          {/* Team */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-foreground">
              {project.employees?.length || 0} Team Members
            </span>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-amber-100 text-amber-700">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Status */}
          <div className="flex gap-2 pt-2">
            {!project.isActive && <Badge variant="destructive">Archived</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {showDetail && (
        <ProjectDetailModal projectId={project._id} onClose={() => setShowDetail(false)} />
      )}
      {showEdit && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            onRefresh();
          }}
        />
      )}
      {showManageEmployees && (
        <ManageEmployeesModal
          project={project}
          onClose={() => setShowManageEmployees(false)}
          onSuccess={() => {
            setShowManageEmployees(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
