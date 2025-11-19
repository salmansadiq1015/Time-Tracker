'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Calendar,
  User,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthContent } from '@/app/context/authContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Assignment {
  _id: string;
  description: string;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AssignmentsPage() {
  const { auth } = useAuthContent();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState({ description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/assignments/all?${params}`
      );

      if (response.data?.success) {
        setAssignments(response.data.assignments || []);
        setPagination(response.data.pagination || null);
      }
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreate = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/assignments/create`,
        { description: formData.description }
      );

      if (response.data?.success) {
        toast.success('Assignment created successfully');
        setShowForm(false);
        setFormData({ description: '' });
        fetchAssignments();
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingAssignment || !formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/assignments/update/${editingAssignment._id}`,
        { description: formData.description }
      );

      if (response.data?.success) {
        toast.success('Assignment updated successfully');
        setEditingAssignment(null);
        setFormData({ description: '' });
        fetchAssignments();
      }
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/assignments/delete/${id}`
      );

      if (response.data?.success) {
        toast.success('Assignment deleted successfully');
        setDeleteDialog(null);
        fetchAssignments();
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setFormData({ description: assignment.description });
  };

  const closeDialogs = () => {
    setShowForm(false);
    setEditingAssignment(null);
    setFormData({ description: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <div className="space-y-6">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-[#1e2339]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-gray-400 to-gray-600 shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tasks</h1>
                <p className="text-xs text-gray-400">Manage and track your tasks</p>
              </div>
            </div>
            {auth.user.role === 'admin' && (
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                New Assignment
              </Button>
            )}
          </div>
        </header>

        <div className="px-4 md:px-8 flex flex-col gap-4 pb-8">
          {/* Search Bar */}
          <Card className="border-gray-700/50 bg-[#1e2339] shadow-lg py-2">
            <CardContent className="p-4 flex flex-row items-center justify-between gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 border-gray-600 bg-[#0f1419] text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={
                    viewMode === 'table'
                      ? 'bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 border-gray-600'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                >
                  <Table2 className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={
                    viewMode === 'grid'
                      ? 'bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 border-gray-600'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : assignments.length === 0 ? (
            <Card className="border-gray-700/50 bg-[#1e2339] shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-gray-600 mb-4" />
                <p className="text-lg font-semibold text-gray-400 mb-2">No assignments found</p>
                <p className="text-sm text-gray-500">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create your first assignment to get started'}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'table' ? (
            <Card className="border-gray-700/50 bg-[#1e2339] shadow-lg overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                      <TableRow>
                        <TableHead className="text-white min-w-[300px]">Description</TableHead>
                        <TableHead className="text-white min-w-[150px]">Created By</TableHead>
                        <TableHead className="text-white min-w-[180px]">Created At</TableHead>
                        <TableHead className="text-white min-w-[180px]">Updated At</TableHead>
                        {auth.user.role === 'admin' && (
                          <TableHead className="text-right text-white min-w-[120px]">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow
                          key={assignment._id}
                          className="border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                        >
                          <TableCell className="text-white">
                            <p className="text-sm leading-relaxed">{assignment.description}</p>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {assignment.createdBy ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium">{assignment.createdBy.name}</p>
                                  {assignment.createdBy.email && (
                                    <p className="text-xs text-gray-500">
                                      {assignment.createdBy.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Unknown</span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">{formatDate(assignment.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">{formatDate(assignment.updatedAt)}</span>
                            </div>
                          </TableCell>
                          {auth.user.role === 'admin' && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(assignment)}
                                  className="text-gray-300 hover:text-white hover:bg-gray-700/50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialog(assignment._id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments?.map((assignment) => (
                <Card
                  key={assignment._id}
                  className="border-gray-700/50 bg-[#1e2339] shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-500/50 py-2"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Description</p>
                        <p className="text-white text-base leading-relaxed line-clamp-4">
                          {assignment.description}
                        </p>
                      </div>

                      {/* Created By */}
                      {assignment.createdBy && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">Created by</p>
                            <p className="text-sm font-medium text-gray-300 truncate">
                              {assignment.createdBy.name}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(assignment.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      {auth.user.role === 'admin' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(assignment)}
                            className="flex-1 text-gray-300 hover:text-white hover:bg-gray-700/50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog(assignment._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card className="border-gray-700/50 bg-[#1e2339] shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)}{' '}
                    of {pagination.total} assignments
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400 px-2">
                      Page {page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm || !!editingAssignment} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-2xl border-gray-700 bg-[#1e2339]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {editingAssignment ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingAssignment
                ? 'Update the task description'
                : 'Enter the task description below'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ description: e.target.value })}
                placeholder="Enter task description..."
                className="min-h-[120px] bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialogs}
              disabled={submitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={editingAssignment ? handleUpdate : handleCreate}
              disabled={submitting || !formData.description.trim()}
              className="bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingAssignment ? 'Updating...' : 'Creating...'}
                </>
              ) : editingAssignment ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent className="border-gray-700 bg-[#1e2339]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this assignment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
