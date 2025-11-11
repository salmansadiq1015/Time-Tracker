'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Shield,
  UserCheck,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { UserForm } from '@/components/user-form';
import { UserList } from '@/components/user-list';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'dispatcher' | 'admin';
  createdAt: Date | string;
  phone?: string;
  status?: 'active' | 'inactive';
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading, requirePermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const totalPages = Math.ceil(totalCount / limit);

  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: '',
    sortOrder: 'asc' as 'asc' | 'desc',
  });

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      requirePermission('view_all_users');
    }
  }, [user, isLoading, requirePermission]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all?${params}`
      );

      if (response.data?.results) {
        setUsers(response.data.results.users || []);
        setTotalCount(response.data.results.total);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (data: any) => {
    setCreating(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/create`,
        data
      );

      if (response.data?.user) {
        toast.success('User created successfully');
        setShowForm(false);
        setPage(1);
        await fetchUsers();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!editingUser?._id) return;

    setCreating(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/update/${editingUser._id}`,
        data
      );

      if (response.data) {
        toast.success('User updated successfully');
        setEditingUser(null);
        setShowForm(false);
        await fetchUsers();
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/delete/${id}`);

      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
    setPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setFilters((prev) => ({ ...prev, role }));
    setPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const canManageUsers = user?.role === 'admin' || user?.role === 'dispatcher';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canManageUsers) {
    return (
      <div className="p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  // Calculate role counts
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const dispatcherCount = users.filter((u) => u.role === 'dispatcher').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="sticky top-0 z-50 border-b border-amber-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700">
              <span className="text-sm font-bold text-white">UM</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
              <p className="text-xs text-muted-foreground">
                Manage team members, roles, and permissions
              </p>
            </div>
          </div>
          {user?.role === 'admin' && (
            <Button
              onClick={() => {
                setEditingUser(null);
                setShowForm(!showForm);
              }}
              className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 md:px-8 pb-6 space-y-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border cursor-pointer  border-blue-100 bg-gradient-to-br from-blue-50 via-blue-50/50 to-indigo-50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <CardContent onClick={() => setFilters({ ...filters, role: 'all' })} className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-blue-600/70 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-blue-700">{totalCount}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border cursor-pointer  border-rose-100 bg-gradient-to-br from-rose-50 via-pink-50/50 to-red-50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <CardContent onClick={() => setFilters({ ...filters, role: 'admin' })} className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-rose-600/70 font-medium">Admins</p>
                  <p className="text-3xl font-bold text-rose-700">{adminCount}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl shadow-sm">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border cursor-pointer  border-purple-100 bg-gradient-to-br from-purple-50 via-violet-50/50 to-fuchsia-50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <CardContent
              onClick={() => setFilters({ ...filters, role: 'dispatcher' })}
              className="pt-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-purple-600/70 font-medium">Dispatchers</p>
                  <p className="text-3xl font-bold text-purple-700">{dispatcherCount}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl shadow-sm">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className=" cursor-pointer border border-emerald-100 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
            <CardContent onClick={() => setFilters({ ...filters, role: 'user' })} className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-emerald-600/70 font-medium">Regular Users</p>
                  <p className="text-3xl font-bold text-emerald-700">{userCount}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-gray-200 bg-white shadow-lg py-0 pb-3 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#c16840] to-[#d17a4f] text-white py-4">
            <div className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter Users
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`text-white hover:bg-white/20 transition-colors ${
                    showFilters ? 'bg-white/20' : ''
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="0 space-y-4">
            <div className="flex gap-3 items-center border-2 border-gray-200 rounded-lg p-3 bg-gray-50 focus-within:border-[#c16840] transition-colors">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent outline-none border-none flex-1 text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Role Filter</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900 focus:border-[#c16840] focus:outline-none transition-colors"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">User</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Status Filter</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900 focus:border-[#c16840] focus:outline-none transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Items Per Page</label>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number.parseInt(e.target.value));
                      setPage(1);
                    }}
                    className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-900 focus:border-[#c16840] focus:outline-none transition-colors"
                  >
                    <option value="5">5 items</option>
                    <option value="10">10 items</option>
                    <option value="20">20 items</option>
                    <option value="50">50 items</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Modal */}
        <Dialog
          open={showForm}
          onOpenChange={(open) => {
            if (!open) {
              setShowForm(false);
              setEditingUser(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white shidden">
            <DialogHeader className="bg-gradient-to-r from-[#c16840] to-[#d17a4f] text-white -m-6 mb-4 p-6 rounded-t-lg">
              <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                {editingUser ? 'Edit User' : 'Add New User'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <UserForm
                user={editingUser}
                onSubmit={editingUser ? handleUpdateUser : handleAddUser}
                onCancel={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                isLoading={creating}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* User List */}
        <UserList
          users={users}
          onEdit={(user) => {
            setEditingUser(user);
            setShowForm(true);
          }}
          onDelete={handleDeleteUser}
          canManage={canManageUsers}
          onSort={handleSort}
          sortField={filters.sortBy}
          sortOrder={filters.sortOrder}
          isLoading={loading}
        />

        {/* Advanced Pagination */}
        {totalCount > 0 && (
          <Card className="border-gray-200 bg-white shadow-lg py-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Info */}
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex}</span> to{' '}
                  <span className="font-semibold text-gray-900">{endIndex}</span> of{' '}
                  <span className="font-semibold text-gray-900">{totalCount}</span> users
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="transition-all text-gray-700 hover:bg-[#c16840] hover:text-white disabled:opacity-50 border-gray-300"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="transition-all text-gray-700 hover:bg-[#c16840] hover:text-white disabled:opacity-50 border-gray-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: number[] = [];
                      const maxPages = Math.min(7, totalPages);
                      let startPage = Math.max(1, page - Math.floor(maxPages / 2));
                      const endPage = Math.min(totalPages, startPage + maxPages - 1);

                      if (endPage - startPage + 1 < maxPages) {
                        startPage = Math.max(1, endPage - maxPages + 1);
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }

                      return pages.map((pageNum) => (
                        <Button
                          key={`page-${pageNum}`}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-10 transition-all ${
                            pageNum === page
                              ? 'bg-[#c16840] text-white border-[#c16840]'
                              : 'text-gray-700 hover:bg-[#c16840] hover:text-white border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      ));
                    })()}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="transition-all text-gray-700 hover:bg-[#c16840] hover:text-white disabled:opacity-50 border-gray-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="transition-all text-gray-700 hover:bg-[#c16840] hover:text-white disabled:opacity-50 border-gray-300"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
