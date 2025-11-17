'use client';

import {
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  Building2,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  MoreVertical,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectCard } from './project-card';
import { ProjectDetailModal } from './project-detail-modal';
import { EditProjectModal } from './edit-project-modal';
import { ManageEmployeesModal } from './manage-employees-modal';
import { useState } from 'react';
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

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  viewMode: 'card' | 'table';
  onRefresh: () => void;
}

export function ProjectList({ projects, loading, viewMode, onRefresh }: ProjectListProps) {
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState<Project | null>(null);
  const [showManageEmployees, setShowManageEmployees] = useState<Project | null>(null);
  const [creatingChat, setCreatingChat] = useState<string | null>(null);
  const { auth } = useAuthContent();
  const router = useRouter();

  const handleDelete = async (project: Project) => {
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
      toast.error('Failed to delete project');
    }
  };

  const handleCreateGroupChat = async (project: Project) => {
    setCreatingChat(project._id);
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
      setCreatingChat(null);
    }
  };

  if (loading) {
    return viewMode === 'card' ? (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-gray-200 shadow-lg overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <Card className="border-gray-700/50 shadow-xl bg-[#1e2339] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-linear-to-r from-gray-500 to-gray-600 text-white border-b-2 border-gray-500/50">
                <TableHead className="h-16 px-6 font-bold text-base text-white">Project Name</TableHead>
                {/* <TableHead className="h-16 px-6 font-bold text-base text-white">Client</TableHead> */}
                <TableHead className="h-16 px-6 font-bold text-base text-white">Location</TableHead>
                <TableHead className="h-16 px-6 font-bold text-base text-white">Dates</TableHead>
                <TableHead className="h-16 px-6 font-bold text-base text-white">Team Size</TableHead>
                <TableHead className="h-16 px-6 font-bold text-base text-white">Status</TableHead>
                <TableHead className="h-16 px-6 text-right font-bold text-base text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="hover:bg-gray-800/30 border-b border-gray-700/30">
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  {/* <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell> */}
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="border-gray-200 shadow-xl backdrop-blur-sm bg-linear-to-br from-card/80 to-card/40 overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-24">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-gray-600/20 to-gray-500/10 flex items-center justify-center shadow-2xl shadow-gray-600/10 animate-pulse">
              <Building2 className="w-12 h-12 text-gray-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create a new project to get started or adjust your search filters
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {viewMode === 'card' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onRefresh={onRefresh} />
          ))}
        </div>
      ) : (
        <Card className="border-gray-700/50 py-0 shadow-xl bg-[#1e2339] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-linear-to-r from-gray-500 to-gray-600 text-white border-b-2 border-gray-500/50">
                  <TableHead className="h-16 px-6 font-bold text-base text-white">Project Name</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">Location</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">Dates</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">Team Size</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">Status</TableHead>
                  <TableHead className="h-16 px-6 text-right font-bold text-base text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const startDate = new Date(project.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const endDate = new Date(project.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <TableRow
                      key={project._id}
                      className="group hover:bg-gray-800/30 transition-all duration-300 border-b border-gray-700/30"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white group-hover:text-gray-400 transition-colors truncate">
                              {project.name}
                            </p>
                            {project.description && (
                              <p className="text-xs text-gray-400 truncate max-w-xs mt-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                          <div className="flex flex-col text-sm text-white max-w-[220px]">
                            <span className="font-medium truncate">
                              {project.city || project.location || 'City not set'}
                            </span>
                            {project.address && (
                              <span className="text-xs text-gray-400 truncate">
                                {project.address}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-xs text-white font-medium">{startDate}</span>
                            <span className="text-xs text-gray-400">→ {endDate}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm font-medium text-white">
                            {project.employees?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {!project.isActive ? (
                          <Badge variant="destructive" className="font-semibold">
                            Archived
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50 font-semibold">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0 border-gray-600 hover:bg-gray-700 group/btn transition-all duration-300 hover:scale-110"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-300 group-hover/btn:text-gray-400 transition-colors" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => setShowDetail(project._id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCreateGroupChat(project)}
                                disabled={creatingChat === project._id}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {creatingChat === project._id ? 'Creating...' : 'Create Group Chat'}
                              </DropdownMenuItem>
                              {(auth.user.role === 'admin' || auth.user.role === 'dispatcher') && (
                                <>
                                  <DropdownMenuItem onClick={() => setShowEdit(project)}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setShowManageEmployees(project)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Manage Team
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(project)}
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showDetail && (
        <ProjectDetailModal projectId={showDetail} onClose={() => setShowDetail(null)} />
      )}
      {showEdit && (
        <EditProjectModal
          project={showEdit}
          onClose={() => setShowEdit(null)}
          onSuccess={() => {
            setShowEdit(null);
            onRefresh();
          }}
        />
      )}
      {showManageEmployees && (
        <ManageEmployeesModal
          project={showManageEmployees}
          onClose={() => setShowManageEmployees(null)}
          onSuccess={() => {
            setShowManageEmployees(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
