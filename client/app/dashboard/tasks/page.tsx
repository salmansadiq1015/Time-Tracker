'use client';

import { useEffect, useMemo, useState, useCallback, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TaskFilters } from './_components/task-filters';
import { TaskTable } from './_components/task-table';
import { TaskCards } from './_components/task-cards';
import { TaskFormDialog } from './_components/task-form-dialog';
import { useAuthContent } from '@/app/context/authContext';
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

interface Task {
  _id: string;
  title: string;
  description: string;
  project?: {
    _id: string;
    name: string;
    client?: { _id: string; name: string };
  };
  assignedTo?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    role: string;
  };
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdBy?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  status: 'all' | 'pending' | 'in_progress' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  project: string;
  assignedTo: string;
}

const statusMeta: Record<
  Task['status'],
  { label: string; className: string; dotClass: string; description: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
    dotClass: 'bg-amber-500',
    description: 'Awaiting kickoff or more context.',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
    dotClass: 'bg-blue-500',
    description: 'Currently being worked on.',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dotClass: 'bg-emerald-500',
    description: 'Task has been delivered and approved.',
  },
};

const priorityMeta: Record<Task['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-300' },
  high: { label: 'High', color: 'bg-rose-500/10 text-rose-600 border-rose-300' },
};

export default function TaskDashboardPage() {
  const { auth } = useAuthContent();
  const isUserRole = auth?.user?.role === 'user';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFiltersState] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    project: 'all',
    assignedTo: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasNextPage: false,
  });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((task) => task.status === 'pending').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const completed = tasks.filter((task) => task.status === 'completed').length;

    return { total, pending, inProgress, completed };
  }, [tasks]);

  const fetchProjectsAndUsers = useCallback(async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/all`, {
          params: { page: 1, limit: 100 },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all`),
      ]);

      setProjects(projectsRes.data?.projects || []);
      const members = usersRes.data?.results?.users || [];
      setUsers(members);
    } catch (error) {
      console.error('Failed to fetch resources for tasks:', error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.status !== 'all') params.status = filters.status;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.project !== 'all') params.project = filters.project;
      if (!isUserRole && filters.assignedTo !== 'all') params.assignedTo = filters.assignedTo;
      if (filters.search.trim()) params.search = filters.search.trim();

      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks`, {
        params,
      });

      setTasks(data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        hasNextPage: data.pagination?.hasNextPage || false,
      }));
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      const message =
        error?.response?.data?.message || error?.message || 'Unable to load tasks right now.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters, isUserRole, pagination.limit, pagination.page]);

  useEffect(() => {
    fetchProjectsAndUsers();
  }, [fetchProjectsAndUsers]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  const handleFiltersChange: Dispatch<SetStateAction<FilterState>> = (updater) => {
    setFiltersState((prev) => {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: FilterState) => FilterState)(prev)
          : updater;
      return next;
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const updateFilterValue = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    handleFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateTask = async (payload: any) => {
    setUpdating(true);
    try {
      const endpoint = editingTask
        ? `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks/${editingTask._id}`
        : `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks`;
      const method = editingTask ? 'patch' : 'post';

      await axios[method](endpoint, payload);
      toast.success(`Task ${editingTask ? 'updated' : 'created'} successfully.`);
      setShowForm(false);
      setEditingTask(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error: any) {
      console.error('Failed to save task:', error);
      toast.error(error?.response?.data?.message || 'Failed to save task.');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status } : task)));
      toast.success('Status updated.');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error?.response?.data?.message || 'Could not update status.');
    }
  };

  const handlePriorityChange = async (taskId: string, priority: Task['priority']) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks/${taskId}`, {
        priority,
      });
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, priority } : task)));
      toast.success('Priority updated.');
    } catch (error: any) {
      console.error('Failed to update priority:', error);
      toast.error(error?.response?.data?.message || 'Could not update priority.');
    }
  };

  const handleDeleteTask = (task: Task) => {
    setPendingDeleteTask(task);
  };

  const confirmDeleteTask = async () => {
    if (!pendingDeleteTask) return;
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/tasks/${pendingDeleteTask._id}`
      );
      toast.success('Task deleted.');
      setTasks((prev) => prev.filter((task) => task._id !== pendingDeleteTask._id));
      setPendingDeleteTask(null);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error?.response?.data?.message || 'Could not delete task.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteDialog = () => {
    if (deleteLoading) return;
    setPendingDeleteTask(null);
  };

  const resetFilters = () => {
    setFiltersState({
      search: '',
      status: 'all',
      priority: 'all',
      project: 'all',
      assignedTo: 'all',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeFiltersCount = useMemo(() => {
    return [
      filters.search.trim() ? 'search' : '',
      filters.status !== 'all' ? 'status' : '',
      filters.priority !== 'all' ? 'priority' : '',
      filters.project !== 'all' ? 'project' : '',
      !isUserRole && filters.assignedTo !== 'all' ? 'assignedTo' : '',
    ].filter(Boolean).length;
  }, [filters, isUserRole]);

  const handlePageChange = (nextPage: number) => {
    setPagination((prev) => ({ ...prev, page: nextPage }));
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleLimitChange = (value: number) => {
    setPagination((prev) => ({ ...prev, limit: value, page: 1 }));
    setRefreshTrigger((prev) => prev + 1);
  };

  const selectedProject = useMemo(() => {
    if (!editingTask || !editingTask.project) return null;
    if (typeof editingTask.project === 'string') return editingTask.project;
    return editingTask.project._id || null;
  }, [editingTask]);

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-50/90 px-4 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-[#c16840]" />
            Task Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Coordinate deliverables, delegate ownership and keep work flowing smoothly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters((prev) => !prev)}
            className="gap-2 border-amber-200 hover:bg-amber-50 text-amber-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-amber-600 text-white hover:bg-amber-700">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          <div className="hidden sm:flex bg-white border border-amber-200 rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              className={`gap-2 rounded-none ${
                viewMode === 'table' ? 'bg-[#c16840] text-white' : ''
              }`}
              onClick={() => setViewMode('table')}
            >
              <Table2 className="h-4 w-4" /> Table
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              className={`gap-2 rounded-none ${
                viewMode === 'card' ? 'bg-[#c16840] text-white' : ''
              }`}
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" /> Cards
            </Button>
          </div>
          {!isUserRole && (
            <Button
              onClick={() => {
                setEditingTask(null);
                setShowForm(true);
              }}
              className="bg-[#c16840] hover:bg-[#aa5735] gap-2 text-white shadow-md"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-amber-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-[#c16840]/10 flex items-center justify-center text-[#c16840]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Tasks</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Loader2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 shadow-lg shadow-amber-100/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-gray-900 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={filters.search}
                  onChange={(e) => updateFilterValue('search', e.target.value)}
                  placeholder="Search by task title or description..."
                  className="pl-10 border-amber-200 focus-visible:ring-[#c16840]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent className="border-t border-amber-100/60 pt-4 bg-amber-50/40 rounded-b-lg">
            <TaskFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={resetFilters}
              projects={projects}
              users={users}
              isUserRole={isUserRole}
            />
          </CardContent>
        )}
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="bg-white border border-amber-200 rounded-xl shadow-lg shadow-amber-100/40 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-amber-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm font-medium">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
            <ClipboardList className="h-10 w-10 text-amber-500" />
            <p className="text-base font-semibold text-gray-700">No tasks found</p>
            <p className="text-sm text-gray-500">
              {isUserRole
                ? 'Once a task is assigned to you, it will appear here.'
                : 'Create a task to get started.'}
            </p>
            {!isUserRole && (
              <Button
                onClick={() => {
                  setEditingTask(null);
                  setShowForm(true);
                }}
                className="mt-2 bg-[#c16840] hover:bg-[#aa5735]"
              >
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <TaskTable
            tasks={tasks}
            onEdit={(task) => {
              setEditingTask(task);
              setShowForm(true);
            }}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            isUserRole={isUserRole}
            statusMeta={statusMeta}
            priorityMeta={priorityMeta}
          />
        ) : (
          <TaskCards
            tasks={tasks}
            onEdit={(task) => {
              setEditingTask(task);
              setShowForm(true);
            }}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            isUserRole={isUserRole}
            statusMeta={statusMeta}
            priorityMeta={priorityMeta}
          />
        )}
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            Show
            <select
              className="border border-amber-200 rounded-md px-2 py-1 bg-white text-gray-700 focus-visible:outline-none focus-visible:ring focus-visible:ring-amber-200"
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            tasks per page
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of{' '}
              {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
            </span>
            <Button
              variant="outline"
              className="border-amber-200 text-amber-600 hover:bg-amber-50"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TaskFormDialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={handleCreateTask}
        loading={updating}
        projects={projects}
        users={users}
        initialData={editingTask}
        isUserRole={isUserRole}
        selectedProjectId={selectedProject}
        statusMeta={statusMeta}
        priorityMeta={priorityMeta}
      />

      <AlertDialog
        open={!!pendingDeleteTask}
        onOpenChange={(open) => {
          if (!open) closeDeleteDialog();
        }}
      >
        <AlertDialogContent className="max-w-md border border-amber-200 bg-white/95 rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-gray-900">
              Delete task {pendingDeleteTask ? `"${pendingDeleteTask.title}"` : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
              This action cannot be undone. The task and its history will be permanently removed for
              all team members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              onClick={closeDeleteDialog}
              className="border border-amber-200/80 text-amber-700 hover:bg-amber-50 rounded-xl"
              disabled={deleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete task'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
