'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface Equipment {
  _id: string;
  name: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
}

interface AssignEquipmentDialogProps {
  equipment: Equipment;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignEquipmentDialog({
  equipment,
  onClose,
  onSuccess,
}: AssignEquipmentDialogProps) {
  const [status, setStatus] = useState('assigned');
  const [assignedTo, setAssignedTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    setFetchingEmployees(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all?role=user`
      );
      setEmployees(data.results?.users || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setError('Failed to load employees');
    } finally {
      setFetchingEmployees(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const {data} = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/equipment/update/${equipment._id}`,
        { status, assignedTo: assignedTo }
      );

     
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to assign equipment');
      }
    } catch (err) {
      setError('Error assigning equipment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Equipment</DialogTitle>
          <DialogDescription>Update status and assignment for {equipment.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {status === 'assigned' && (
            <div>
              <Label htmlFor="assignedTo">Assign To Employee</Label>
              <select
                id="assignedTo"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={fetchingEmployees}
              >
                <option value="">
                  {fetchingEmployees ? 'Loading employees...' : 'Select an employee'}
                </option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || (status === 'assigned' && !assignedTo)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
