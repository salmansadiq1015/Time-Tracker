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
import {
  MoreVertical,
  Users,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  UserPlus,
  Eye,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { ProjectDetailModal } from './project-detail-modal';
import { EditProjectModal } from './edit-project-modal';
import { ManageEmployeesModal } from './manage-employees-modal';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useAuthContent } from '@/app/context/authContext';
import { useRouter } from 'next/navigation';

interface Project {
  _id: string;
  name: string;
  client: string | { _id: string; name: string; email: string };
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
  const [creatingChat, setCreatingChat] = useState(false);
  const { auth } = useAuthContent();
  const router = useRouter();

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

  const handleCreateGroupChat = async () => {
    setCreatingChat(true);
    try {
      // First, check if a group chat with this project name already exists
      const { data: chatsData } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/all/${auth.user._id}`
      );

      const existingChat = chatsData?.results?.find(
        (chat: any) => chat.isGroupChat && chat.chatName === project.name
      );

      if (existingChat) {
        // Chat already exists, redirect to it
        toast.success('Opening existing group chat');
        router.push(`/dashboard/chat?chat=${existingChat._id}`);
        return;
      }

      // Extract employee IDs (handle both populated and non-populated cases)
      // Note: Server automatically adds the current user, so we don't include auth.user._id
      let employeeIds: string[] = [];

      if (project.employees && project.employees.length > 0) {
        // Filter out current user if present (server will add it automatically)
        employeeIds = project.employees
          .map((emp: any) => (typeof emp === 'object' && emp !== null ? emp._id : emp))
          .filter((id: string) => id !== auth.user._id);
      }

      // If no employees, add project client (current user will be added by server)
      if (employeeIds.length === 0) {
        if (project.client) {
          const clientId =
            typeof project.client === 'object' && project.client !== null
              ? project.client._id
              : project.client;
          // Only add client if it's different from current user
          if (clientId && clientId !== auth.user._id) {
            employeeIds.push(clientId);
          }
        }

        // Server requires at least 2 users total (current user + at least 1 other)
        // If we only have current user, we can't create a group chat
        if (employeeIds.length === 0) {
          toast.error('Cannot create group chat. Need at least 2 users (add employees or client).');
          return;
        }
      }

      // Generate avatar URL
      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        project.name
      )}&background=ea580c&color=fff&size=128`;

      // Create group chat
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/group/create`,
        {
          users: JSON.stringify(employeeIds),
          chatName: project.name,
          avatar: avatar,
        }
      );

      if (data.success && data.groupChat) {
        toast.success('Group chat created successfully!');
        // Redirect to chat page with the new chat
        router.push(`/dashboard/chat?chat=${data.groupChat._id}`);
      }
    } catch (error: any) {
      console.error('Failed to create group chat:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create group chat';
      toast.error(errorMessage);
    } finally {
      setCreatingChat(false);
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
                <DropdownMenuItem onClick={handleCreateGroupChat} disabled={creatingChat}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {creatingChat ? 'Creating...' : 'Create Group Chat'}
                </DropdownMenuItem>
                {(auth.user.role === 'admin' || auth.user.role === 'dispatcher') && (
                  <>
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
                  </>
                )}
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
          project={{
            ...project,
            client:
              typeof project.client === 'object' && project.client !== null
                ? project.client._id
                : project.client,
          }}
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
