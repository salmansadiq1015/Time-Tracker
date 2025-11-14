'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Edit2,
  Clock,
  User,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserCircle,
  Calendar,
  AlertCircle,
  Circle,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { useAuthContent } from '@/app/context/authContext';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';
import { useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'dispatcher' | 'admin';
  status?: 'active' | 'inactive';
  createdAt: Date | string;
}

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
  isLoading?: boolean;
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export function UserList({
  users,
  onEdit,
  onDelete,
  canManage,
  isLoading,
  onSort,
  sortField,
  sortOrder,
}: UserListProps) {
  const { auth } = useAuthContent();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'dispatcher':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'dispatcher':
        return <UserCheck className="w-3 h-3" />;
      default:
        return <UserCircle className="w-3 h-3" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'active') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-green-500/20 text-green-300 border-green-500/50 flex items-center gap-1.5 w-fit">
          <Circle className="w-2 h-2 fill-green-300" />
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-gray-500/20 text-gray-300 border-gray-500/50 flex items-center gap-1.5 w-fit">
        <Circle className="w-2 h-2 fill-gray-300" />
        Inactive
      </span>
    );
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid';
    }
  };

  // Create Chat
  const createChat = async (userId: any) => {
    setLoading(true);
    setLoadingUser(userId);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/chat/create`,
        {
          userId,
        }
      );
      if (data?.success) {
        toast.success('Chat created successfully');
        router.push(`/dashboard/chat?chat=${data?.chat?._id}`);
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error?.response?.data?.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gray-700/50 bg-[#1e2339] shadow-lg overflow-hidden py-0">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-linear-to-r from-blue-600 to-blue-700 text-white border-b-2 border-blue-500/50">
              <tr>
                <th className="text-left py-4 px-4 min-w-[10rem] font-semibold text-white uppercase text-xs tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-4 min-w-[12rem] font-semibold text-white uppercase text-xs tracking-wider">
                  Email
                </th>
                <th className="text-left py-4 px-4 min-w-[10rem] font-semibold text-white uppercase text-xs tracking-wider">
                  Phone
                </th>
                <th className="text-left py-4 px-4 font-semibold text-white uppercase text-xs tracking-wider">
                  Role
                </th>
                <th className="text-left py-4 px-4 font-semibold text-white uppercase text-xs tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-4 min-w-[9rem] font-semibold text-white uppercase text-xs tracking-wider">
                  Joined
                </th>
                {auth.user?.role === 'admin' && (
                  <th className="text-center py-4 px-4 font-semibold text-white uppercase text-xs tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-700/30">
                      <td colSpan={auth.user?.role === 'admin' ? 7 : 6} className="py-4 px-4">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))}
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={auth.user?.role === 'admin' ? 7 : 6}
                    className="py-12 px-4 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-400 font-medium">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span
                          className="font-medium text-white cursor-pointer hover:text-blue-400 transition-colors"
                          onClick={() => router.push(`/dashboard/users/${user._id}`)}
                        >
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-300 text-sm">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-300 text-sm">{user.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border flex items-center gap-1.5 w-fit ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-300 text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    {auth.user?.role === 'admin' && (
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/users/${user._id}`)}
                            className="text-blue-400 hover:bg-blue-600/20 h-8 w-8 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => createChat(user._id)}
                            className="text-green-400 hover:bg-green-600/20 h-8 w-8 rounded-lg transition-colors"
                            title="Create Chat"
                            disabled={loading}
                          >
                            {loading && loadingUser === user._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MessageCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(user)}
                            className="text-blue-400 hover:bg-blue-600/20 h-8 w-8 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(user._id)}
                            className="text-red-400 hover:bg-red-600/20 h-8 w-8 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
