"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { UserForm } from "@/components/user-form";
import { UserList } from "@/components/user-list";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: "user" | "dispatcher" | "admin";
  createdAt: Date;
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
    search: "",
    role: "all",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      requirePermission("view_all_users");
    }
  }, [user, isLoading, requirePermission]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role !== "all" && { role: filters.role }),
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all?${params}`
      );

      if (response.data?.results) {
        setUsers(response.data.results.users || []);
        setTotalCount(response.data.results.total);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
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
        toast.success("User created successfully");
        setShowForm(false);
        setPage(1);
        await fetchUsers();
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user");
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
        toast.success("User updated successfully");
        setEditingUser(null);
        setShowForm(false);
        await fetchUsers();
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/delete/${id}`
      );

      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
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

  const canManageUsers = user?.role === "admin" || user?.role === "dispatcher";

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
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Users Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage team members and their roles
            </p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-500 bg-green-100/20 py-3 backdrop-blur-sm hover:border-primary/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-foreground">{totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-pink-500 bg-pink-100/20 py-3 backdrop-blur-sm hover:border-primary/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Page</p>
              <p className="text-3xl font-bold text-foreground">
                {page} of {totalPages}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500 bg-yellow-100/20 py-3 backdrop-blur-sm hover:border-primary/30 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Items Per Page</p>
              <p className="text-3xl font-bold text-foreground">{limit}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "Add New User"}</CardTitle>
          </CardHeader>
          <CardContent>
            <UserForm
              user={editingUser}
              onSubmit={editingUser ? handleUpdateUser : handleAddUser}
              onCancel={() => {
                setShowForm(false);
                setEditingUser(null);
              }}
              isLoading={creating}
            />
          </CardContent>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="border-gray-700 pb-4 bg-card/50 py-2 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`transition-colors ${
                showFilters ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <Filter className="w-4 h-4" />
            </Button>
            {user?.role === "admin" && (
              <Button
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(!showForm);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center border border-gray-700  p-2 rounded-full h-[2.8rem] bg-gray-800">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none border-none focus:border-none ring-0 rounded-full"
              style={{
                outline: "none",
              }}
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Role Filter
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => handleRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border/50 rounded-lg text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Items Per Page
                </label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number.parseInt(e.target.value));
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-input border border-border/50 rounded-lg text-foreground focus:border-primary/50 focus:outline-none transition-colors"
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
        <Card className="border-gray-900/50 bg-gray-900/50 backdrop-blur-sm py-2">
          <CardContent className=" sm:self-end">
            <div className="space-y-6">
              {/* Pagination Controls */}
              <div className="flex flex-row md:items-center md:justify-between gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="transition-all hover:bg-primary/10 disabled:opacity-50"
                  >
                    First
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="transition-all hover:bg-primary/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {(() => {
                    const pages: number[] = [];
                    const maxPages = Math.min(7, totalPages);
                    let startPage = Math.max(
                      1,
                      page - Math.floor(maxPages / 2)
                    );
                    const endPage = Math.min(
                      totalPages,
                      startPage + maxPages - 1
                    );

                    if (endPage - startPage + 1 < maxPages) {
                      startPage = Math.max(1, endPage - maxPages + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    return pages.map((pageNum) => (
                      <Button
                        key={`page-${pageNum}`}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={`w-10 transition-all ${
                          pageNum === page
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ));
                  })()}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="transition-all hover:bg-primary/10 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="transition-all hover:bg-primary/10 disabled:opacity-50"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
