'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  Loader,
  Package,
  Calendar,
  User,
  Mail,
  Filter,
  Sparkles,
  MoreVertical,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';
import { EditEquipmentDialog } from './edit-equipment-dialog';
import { AssignEquipmentDialog } from './assign-equipment-dialog';
import { AdvancedPagination } from '@/components/pegination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Equipment {
  _id: string;
  name: string;
  serial: string;
  status: 'available' | 'assigned' | 'maintenance';
  assignedTo?: { name: string; email: string };
  assignDate?: string;
  createdBy?: { name: string };
}

export function EquipmentList({ onRefresh }: { onRefresh: () => void }) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [assigningEquipment, setAssigningEquipment] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('name', searchTerm);
      query.append('page', page.toString());
      query.append('limit', limit.toString());
      if (statusFilter !== 'all') query.append('status', statusFilter);
      if (userFilter !== 'all') query.append('assignedTo', userFilter);

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/equipment/all?${query}`
      );

      if (data.success) {
        setEquipment(data.equipments);
        setTotalCount(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter, userFilter]);

  // Fetch users for filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all`);
        if (data.results && data.results.users) {
          setUsers(data.results.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, userFilter]);

  const handleDelete = async (id: string) => {
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
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/equipment/delete/${id}`
      );

      if (data.success) {
        toast.success('Equipment deleted successfully');
        setEquipment(equipment.filter((e) => e._id !== id));
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'assigned':
        return <AlertCircle className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'assigned':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'maintenance':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'available':
        return 'from-emerald-500/5 to-emerald-500/0';
      case 'assigned':
        return 'from-blue-500/5 to-blue-500/0';
      case 'maintenance':
        return 'from-amber-500/5 to-amber-500/0';
      default:
        return 'from-gray-500/5 to-gray-500/0';
    }
  };

  const stats = {
    total: totalCount,
    available: equipment.filter((e) => e.status === 'available').length,
    assigned: equipment.filter((e) => e.status === 'assigned').length,
    maintenance: equipment.filter((e) => e.status === 'maintenance').length,
  };

  const getPercentage = (value: number) => {
    return totalCount > 0 ? Math.round((value / totalCount) * 100) : 0;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group relative overflow-hidden border-blue-500/30 bg-[#1e2339] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/50">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Total Equipment
                </p>
                <p className="text-4xl font-bold text-white mt-2 tracking-tight">{stats.total}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-500/30 bg-[#1e2339] hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/50">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Available
                </p>
                <p className="text-4xl font-bold text-emerald-400 mt-2 tracking-tight">
                  {stats.available}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${getPercentage(stats.available)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">
                    {getPercentage(stats.available)}%
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-blue-500/30 bg-[#1e2339] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/50">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Assigned
                </p>
                <p className="text-4xl font-bold text-blue-400 mt-2 tracking-tight">
                  {stats.assigned}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                      style={{ width: `${getPercentage(stats.assigned)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-blue-400">
                    {getPercentage(stats.assigned)}%
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-amber-500/30 bg-[#1e2339] hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/50">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Maintenance
                </p>
                <p className="text-4xl font-bold text-amber-400 mt-2 tracking-tight">
                  {stats.maintenance}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${getPercentage(stats.maintenance)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-amber-400">
                    {getPercentage(stats.maintenance)}%
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-600/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Wrench className="w-8 h-8 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="border-gray-700/50 py-0 shadow-xl bg-[#1e2339] overflow-hidden relative group">
        <div className="bg-gradient-to-r from-gray-600/10 via-gray-500/5 to-transparent p-6 border-b border-gray-700/50 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-600/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Filter className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-white">
                  Search & Filter Equipment
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Find and manage your equipment inventory
                </p>
              </div>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-[#0f1419] rounded-lg p-1 border-2 border-gray-600">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className={`h-9 px-3 transition-all duration-300 ${
                  viewMode === 'card'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`h-9 px-3 transition-all duration-300 ${
                  viewMode === 'table'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/search:text-gray-400 transition-all duration-300 group-focus-within/search:scale-110" />
              <Input
                placeholder="Search equipment by name or serial number..."
                className="pl-12 h-12 border-gray-600 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all duration-300 bg-[#0f1419] text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    fetchEquipment();
                  }
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-all text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                className="w-full h-12 px-4 border border-gray-600 rounded-lg bg-[#0f1419] text-white focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all appearance-none cursor-pointer font-medium hover:border-gray-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="relative">
              <select
                className="w-full h-12 px-4 border border-gray-600 rounded-lg bg-[#0f1419] text-white focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all appearance-none cursor-pointer font-medium hover:border-gray-500"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => {
                setPage(1);
                fetchEquipment();
              }}
              className="h-12 bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-black shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Display - Card or Table View */}
      {loading ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 py-1">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-gray-700/50 shadow-lg overflow-hidden bg-[#1e2339]">
                <Skeleton className="h-1 w-full bg-gray-700" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4 bg-gray-700" />
                      <Skeleton className="h-4 w-1/2 bg-gray-700" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full bg-gray-700" />
                  </div>
                  <Skeleton className="h-20 w-full rounded-lg bg-gray-700" />
                  <Skeleton className="h-16 w-full rounded-lg bg-gray-700" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 w-full rounded-lg bg-gray-700" />
                    <Skeleton className="h-14 w-full rounded-lg bg-gray-700" />
                    <Skeleton className="h-14 w-full rounded-lg bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-gray-700/50 shadow-xl bg-[#1e2339] overflow-hidden py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-linear-to-r from-gray-600 to-gray-700 text-white border-b-2 border-gray-500/50">
                    <TableHead className="h-14 font-bold text-white">Name</TableHead>
                    <TableHead className="h-14 font-bold text-white">Serial</TableHead>
                    <TableHead className="h-14 font-bold text-white">Status</TableHead>
                    <TableHead className="h-14 font-bold text-white">Assigned To</TableHead>
                    <TableHead className="h-14 font-bold text-white">Purchase Date</TableHead>
                    <TableHead className="h-14 text-right font-bold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="hover:bg-gray-800/30 border-b border-gray-700/30">
                      <TableCell>
                        <Skeleton className="h-5 w-32 bg-gray-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-gray-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full bg-gray-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28 bg-gray-700" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24 bg-gray-700" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                          <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                          <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      ) : equipment.length === 0 ? (
        <Card className="border-gray-700/50 shadow-xl bg-[#1e2339] overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-600/20 flex items-center justify-center shadow-2xl animate-pulse">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600/20 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No equipment found</h3>
            <p className="text-gray-400 text-center max-w-md">
              Try adjusting your search filters or create new equipment to get started
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ">
          {equipment.map((item, index) => (
            <Card
              key={item._id}
              className="group relative border-gray-700/50 hover:border-gray-500/50 hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2 bg-[#1e2339] py-0 pb-3 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Animated status bar */}
              <div
                className={`h-1.5 bg-gradient-to-r ${getStatusGradient(
                  item.status
                )} relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-500/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="pb-4 relative z-10">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                  <Package className="w-32 h-32 text-gray-400" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1 min-w-0 pr-4">
                    <CardTitle className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-gray-400 transition-colors duration-300 text-white">
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-[#0f1419] px-3 py-1.5 rounded-lg w-fit border border-gray-600">
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate font-mono text-xs">{item.serial}</span>
                    </div>
                  </div>
                  <Badge
                    className={`flex items-center gap-1.5 px-3.5 py-2 border-2 ${getStatusColor(
                      item.status
                    )} font-semibold transition-all duration-300 hover:scale-110 hover:shadow-lg shrink-0 ml-2`}
                  >
                    {getStatusIcon(item.status)}
                    <span className="text-xs">
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 relative z-10">
                {item.assignedTo && (
                  <div className="bg-[#0f1419] p-4 rounded-xl border-2 border-gray-600 hover:border-gray-500/50 transition-all duration-300 group/assign hover:shadow-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-600/20 flex items-center justify-center shrink-0 shadow-lg group-hover/assign:scale-110 group-hover/assign:rotate-6 transition-all duration-300">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Assigned To
                        </p>
                        <p className="font-bold text-white truncate text-base mb-1">
                          {item.assignedTo.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2 bg-[#1e2339] px-2 py-1 rounded-md border border-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <p className="text-xs text-gray-400 truncate font-mono">
                            {item.assignedTo.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {item.assignDate && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0f1419] border-2 border-gray-600 hover:border-gray-500 transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-gray-600/20 flex items-center justify-center shrink-0 shadow-md">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Assign Date
                      </p>
                      <p className="font-bold text-white text-base">
                        {new Date(item.assignDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-4 border-2 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 bg-emerald-500/10 group/btn transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-emerald-400"
                    onClick={() => setAssigningEquipment(item)}
                  >
                    <CheckCircle2 className="w-5 h-5 mb-1.5 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-300" />
                    <span className="text-xs font-semibold">Assign</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-4 border-2 border-gray-500/50 hover:bg-gray-500/20 hover:border-gray-500 bg-gray-500/10 group/btn transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-gray-400"
                    onClick={() => setEditingEquipment(item)}
                  >
                    <Edit2 className="w-5 h-5 mb-1.5 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-300" />
                    <span className="text-xs font-semibold">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-4 border-2 border-red-500/50 hover:bg-red-500/20 hover:border-red-500 bg-red-500/10 group/btn transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-red-400"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="w-5 h-5 mb-1.5 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-300" />
                    <span className="text-xs font-semibold">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-700/50 shadow-xl py-0 bg-[#1e2339] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-linear-to-r from-gray-600 to-gray-700 text-white border-b-2 border-gray-500/50">
                  <TableHead className="h-16 px-6 font-bold text-base text-white">
                    Equipment Name
                  </TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">
                    Serial Number
                  </TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">Status</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">
                    Assigned To
                  </TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base text-white">
                    Assign Date
                  </TableHead>
                  <TableHead className="h-16 px-6 text-right font-bold text-base text-white">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item, index) => (
                  <TableRow
                    key={item._id}
                    className="group hover:bg-gray-800/30 transition-all duration-300 border-b border-gray-700/30"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-gray-400 transition-colors">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-[#0f1419] px-3 py-1.5 rounded-lg w-fit border border-gray-600">
                        <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-mono text-sm text-gray-300">{item.serial}</span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => setAssigningEquipment(item)}
                    >
                      <Badge
                        className={`flex items-center gap-1.5 px-3 py-1.5 border-2 ${getStatusColor(
                          item.status
                        )} font-semibold w-fit`}
                      >
                        {getStatusIcon(item.status)}
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {item.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-600/20 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">
                              {item.assignedTo.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {item.assignedTo.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {item.assignDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-white">
                            {new Date(item.assignDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 bg-emerald-500/10 group/btn transition-all duration-300 hover:scale-110 text-emerald-400"
                          onClick={() => setAssigningEquipment(item)}
                          title="Assign"
                        >
                          <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-gray-500/50 hover:bg-gray-500/20 hover:border-gray-500 bg-gray-500/10 group/btn transition-all duration-300 hover:scale-110 text-gray-400"
                          onClick={() => setEditingEquipment(item)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-red-500/50 hover:bg-red-500/20 hover:border-red-500 bg-red-500/10 text-red-400 group/btn transition-all duration-300 hover:scale-110"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Pagination */}
      {!loading && equipment.length > 0 && totalCount > 0 && (
        <Card className="border-gray-700/50 py-0 shadow-xl bg-[#1e2339] overflow-hidden relative group">
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="sm:flex items-center gap-4 hidden">
                <span className="text-sm text-gray-400 font-semibold">Items per page:</span>
                <select
                  className="h-10 px-4 border-2 border-gray-600 rounded-lg bg-[#0f1419] text-white focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 transition-all appearance-none cursor-pointer text-sm font-medium hover:border-gray-500"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex-1">
                <AdvancedPagination
                  currentPage={page}
                  totalPages={Math.ceil(totalCount / limit)}
                  totalItems={totalCount}
                  itemsPerPage={limit}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {editingEquipment && (
        <EditEquipmentDialog
          equipment={editingEquipment}
          onClose={() => setEditingEquipment(null)}
          onSuccess={() => {
            setEditingEquipment(null);
            onRefresh();
          }}
        />
      )}

      {assigningEquipment && (
        <AssignEquipmentDialog
          equipment={assigningEquipment}
          onClose={() => setAssigningEquipment(null)}
          onSuccess={() => {
            setAssigningEquipment(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
