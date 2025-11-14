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
  address: string;
  location?: string;
  city?: string;
  description: string;
  startDate: string;
  endDate: string;
  employees: any[];
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

      if (employeeIds.length === 0) {
        toast.error('Cannot create group chat. Add at least one more team member.');
        return;
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
      <Card className="group overflow-hidden border-gray-700/50 bg-[#1e2339] transition-all hover:shadow-lg hover:border-blue-500/50">
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="line-clamp-2 text-lg text-white">{project.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-[0] transition-opacity group-hover:opacity-[1] cursor-pointer text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1e2339] border-gray-700 text-white">
                <DropdownMenuItem onClick={() => setShowDetail(true)} className="text-gray-300 hover:text-white hover:bg-gray-700 focus:bg-gray-700">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateGroupChat} disabled={creatingChat} className="text-gray-300 hover:text-white hover:bg-gray-700 focus:bg-gray-700">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {creatingChat ? 'Creating...' : 'Create Group Chat'}
                </DropdownMenuItem>
                {(auth.user.role === 'admin' || auth.user.role === 'dispatcher') && (
                  <>
                    <DropdownMenuItem onClick={() => setShowEdit(true)} className="text-gray-300 hover:text-white hover:bg-gray-700 focus:bg-gray-700">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowManageEmployees(true)} className="text-gray-300 hover:text-white hover:bg-gray-700 focus:bg-gray-700">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Manage Team
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-red-400 hover:text-red-300 hover:bg-red-600/20 focus:bg-red-600/20"
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
          <p className="line-clamp-2 text-sm text-gray-400">{project.description}</p>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <MapPin className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
            <div className="flex flex-col">
              <span className="line-clamp-1 font-medium text-white">
                {project.city || project.location || 'City not set'}
              </span>
              {project.address && (
                <span className="text-xs text-gray-400 line-clamp-1">
                  {project.address}
                </span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4 shrink-0 text-blue-400" />
            <span>
              {startDate} → {endDate}
            </span>
          </div>

          {/* Team */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-sm font-medium text-white">
              {project.employees?.length || 0} Team Members
            </span>
          </div>

          {/* Status */}
          <div className="flex gap-2 pt-2">
            {!project.isActive && <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/50">Archived</Badge>}
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
