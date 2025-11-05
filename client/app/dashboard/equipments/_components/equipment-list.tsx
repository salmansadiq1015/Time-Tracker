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
  purchaseDate?: string;
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
  }, [page, limit, searchTerm, statusFilter]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter]);

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
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'assigned':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
      case 'maintenance':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
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
        <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Equipment
                </p>
                <p className="text-4xl font-bold text-primary mt-2 tracking-tight">{stats.total}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Package className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-emerald-500/3 to-transparent hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-emerald-500/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Available
                </p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
                  {stats.available}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                      style={{ width: `${getPercentage(stats.available)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {getPercentage(stats.available)}%
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-blue-500/3 to-transparent hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Assigned
                </p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2 tracking-tight">
                  {stats.assigned}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                      style={{ width: `${getPercentage(stats.assigned)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {getPercentage(stats.assigned)}%
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-amber-500/3 to-transparent hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Maintenance
                </p>
                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-2 tracking-tight">
                  {stats.maintenance}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${getPercentage(stats.maintenance)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {getPercentage(stats.maintenance)}%
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Wrench className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card className="border-primary/10 py-0 shadow-xl backdrop-blur-md bg-gradient-to-br from-card/80 via-card/60 to-card/40 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Filter className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Search & Filter Equipment
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Find and manage your equipment inventory
                </p>
              </div>
            </div>
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-lg p-1 border-2 border-primary/20">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className={`h-9 px-3 transition-all duration-300 ${
                  viewMode === 'card'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-primary/10'
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
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'hover:bg-primary/10'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/search:text-primary transition-all duration-300 group-focus-within/search:scale-110" />
              <Input
                placeholder="Search equipment by name or serial number..."
                className="pl-12 h-12 border-primary/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 bg-background/50 backdrop-blur-sm"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                className="w-full h-12 px-4 border border-primary/20 rounded-lg bg-background/50 backdrop-blur-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer font-medium hover:border-primary/30"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <Button
              onClick={() => {
                setPage(1);
                fetchEquipment();
              }}
              className="h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
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
              <Card key={i} className="border-primary/10 shadow-lg overflow-hidden">
                <Skeleton className="h-1 w-full" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-primary/10 shadow-xl backdrop-blur-md bg-gradient-to-br from-card/80 via-card/60 to-card/40 overflow-hidden py-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5 hover:bg-primary/10">
                    <TableHead className="h-14 font-bold">Name</TableHead>
                    <TableHead className="h-14 font-bold">Serial</TableHead>
                    <TableHead className="h-14 font-bold">Status</TableHead>
                    <TableHead className="h-14 font-bold">Assigned To</TableHead>
                    <TableHead className="h-14 font-bold">Purchase Date</TableHead>
                    <TableHead className="h-14 text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
                          <Skeleton className="h-8 w-8 rounded" />
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
        <Card className="border-primary/10 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card/80 to-card/40 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-2xl shadow-primary/10 animate-pulse">
                <Package className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No equipment found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Try adjusting your search filters or create new equipment to get started
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ">
          {equipment.map((item, index) => (
            <Card
              key={item._id}
              className="group relative border-primary/10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden hover:-translate-y-2 bg-gradient-to-br py-0 pb-3 from-card via-card/95 to-card/90 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardHeader className="pb-4 relative z-10">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                  <Package className="w-32 h-32 text-primary" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1 min-w-0 pr-4">
                    <CardTitle className="text-xl font-bold mb-3 truncate group-hover:text-primary transition-colors duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg w-fit">
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
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 rounded-xl border-2 border-primary/20 hover:border-primary/30 transition-all duration-300 group/assign hover:shadow-lg hover:shadow-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10 group-hover/assign:scale-110 group-hover/assign:rotate-6 transition-all duration-300">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Assigned To
                        </p>
                        <p className="font-bold text-foreground truncate text-base mb-1">
                          {item.assignedTo.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2 bg-background/50 px-2 py-1 rounded-md">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate font-mono">
                            {item.assignedTo.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {item.purchaseDate && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 border-2 border-border/30 hover:border-border/50 transition-all duration-300 hover:shadow-md">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shrink-0 shadow-md">
                      <Calendar className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Purchase Date
                      </p>
                      <p className="font-bold text-foreground text-base">
                        {new Date(item.purchaseDate).toLocaleDateString('en-US', {
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
                    className="flex-col h-auto py-4 border-2 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 bg-emerald-500/5 group/btn transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1"
                    onClick={() => setAssigningEquipment(item)}
                  >
                    <CheckCircle2 className="w-5 h-5 mb-1.5 text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-300" />
                    <span className="text-xs font-semibold">Assign</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-4 border-2 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 bg-blue-500/5 group/btn transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1"
                    onClick={() => setEditingEquipment(item)}
                  >
                    <Edit2 className="w-5 h-5 mb-1.5 text-blue-600 dark:text-blue-400 group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-300" />
                    <span className="text-xs font-semibold">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-4 border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/5 group/btn transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1"
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
        <Card className="border-primary/10 shadow-xl py-0 backdrop-blur-md bg-gradient-to-br from-card/80 via-card/60 to-card/40 overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 hover:bg-primary/15 border-b-2 border-primary/20">
                  <TableHead className="h-16 px-6 font-bold text-base">Equipment Name</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base">Serial Number</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base">Status</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base">Assigned To</TableHead>
                  <TableHead className="h-16 px-6 font-bold text-base">Purchase Date</TableHead>
                  <TableHead className="h-16 px-6 text-right font-bold text-base">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item, index) => (
                  <TableRow
                    key={item._id}
                    className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 border-b border-border/30"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg w-fit">
                        <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-mono text-sm text-muted-foreground">
                          {item.serial}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
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
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {item.assignedTo.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.assignedTo.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {item.purchaseDate ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground">
                            {new Date(item.purchaseDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 bg-emerald-500/5 group/btn transition-all duration-300 hover:scale-110"
                          onClick={() => setAssigningEquipment(item)}
                          title="Assign"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-125 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 bg-blue-500/5 group/btn transition-all duration-300 hover:scale-110"
                          onClick={() => setEditingEquipment(item)}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover/btn:scale-125 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-9 p-0 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/5 group/btn transition-all duration-300 hover:scale-110"
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
        <Card className="border-primary/10 py-0 shadow-xl backdrop-blur-md bg-gradient-to-br from-card/80 via-card/60 to-card/40 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="sm:flex items-center gap-4 hidden">
                <span className="text-sm text-muted-foreground font-semibold">Items per page:</span>
                <select
                  className="h-10 px-4 border-2 border-primary/20 rounded-lg bg-background/50 backdrop-blur-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer text-sm font-medium hover:border-primary/30"
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
