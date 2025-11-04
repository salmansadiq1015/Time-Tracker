'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import { EditEquipmentDialog } from './edit-equipment-dialog';
import { AssignEquipmentDialog } from './assign-equipment-dialog';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [assigningEquipment, setAssigningEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (searchTerm) query.append('name', searchTerm);
      if (statusFilter !== 'all') query.append('status', statusFilter);

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/equipment/all?${query}`
      );

      if (data.success) {
        setEquipment(data.data);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

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
    total: equipment.length,
    available: equipment.filter((e) => e.status === 'available').length,
    assigned: equipment.filter((e) => e.status === 'assigned').length,
    maintenance: equipment.filter((e) => e.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {stats.available}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {stats.assigned}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  {stats.maintenance}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-primary/10 shadow-lg backdrop-blur-sm bg-card/50 overflow-hidden py-0 pb-4">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Search & Filter Equipment</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Find and manage your equipment inventory
              </p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search equipment by name..."
                className="pl-11 h-11 border-primary/20 focus:border-primary/40 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="w-full h-11 px-4 border border-primary/20 rounded-lg bg-background text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
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
              onClick={fetchEquipment}
              className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      {loading ? (
        <Card className="border-primary/10 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <Package className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="mt-4 text-muted-foreground font-medium">Loading equipment...</span>
          </CardContent>
        </Card>
      ) : equipment.length === 0 ? (
        <Card className="border-primary/10 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-primary" />
            </div>
            <span className="text-lg font-medium text-muted-foreground">No equipment found</span>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {equipment.map((item) => (
            <Card
              key={item._id}
              className="group border-primary/10 hover:border-primary/30 hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 bg-gradient-to-br from-card to-card/50"
            >
              <div className={`h-1 bg-gradient-to-r ${getStatusGradient(item.status)}`}></div>

              <CardHeader className="pb-4 relative">
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Package className="w-24 h-24 text-primary" />
                </div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl mb-2 truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.serial}</span>
                    </div>
                  </div>
                  <Badge
                    className={`flex items-center gap-1.5 px-3 py-1 border ${getStatusColor(
                      item.status
                    )} font-medium transition-all duration-300 hover:scale-105 flex-shrink-0 ml-2`}
                  >
                    {getStatusIcon(item.status)}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {item.assignedTo && (
                  <div className="bg-gradient-to-br from-primary/5 to-transparent p-4 rounded-lg border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                          Assigned To
                        </p>
                        <p className="font-semibold text-foreground truncate">
                          {item.assignedTo.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground truncate">
                            {item.assignedTo.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {item.purchaseDate && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Purchase Date
                      </p>
                      <p className="font-semibold text-foreground">
                        {new Date(item.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-3 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 bg-transparent group/btn transition-all duration-300"
                    onClick={() => setAssigningEquipment(item)}
                  >
                    <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-600 dark:text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Assign</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-3 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 bg-transparent group/btn transition-all duration-300"
                    onClick={() => setEditingEquipment(item)}
                  >
                    <Edit2 className="w-5 h-5 mb-1 text-blue-600 dark:text-blue-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-col h-auto py-3 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-600 dark:text-red-400 bg-transparent group/btn transition-all duration-300"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="w-5 h-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
