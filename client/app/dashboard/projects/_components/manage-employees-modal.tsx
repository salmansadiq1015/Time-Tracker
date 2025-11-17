'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Project {
  _id: string;
  name: string;
  employees: Employee[];
}

interface ManageEmployeesModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManageEmployeesModal({ project, onClose, onSuccess }: ManageEmployeesModalProps) {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>({});

  useEffect(() => {
    setProjectData(project);
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all?role=user`
      );
      setAllEmployees(data.results?.users || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableEmployees = allEmployees.filter(
    (emp) => !projectData.employees.some((pe: any) => pe._id === emp._id)
  );

  const handleAddEmployee = async () => {
    if (!selectedEmployee) return;

    setAdding(true);
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/add/employee/${project._id}`,
        { employeeId: selectedEmployee }
      );
      if (data) {
        setSelectedEmployee('');
        setProjectData(data.project);
        // onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to add employee:', error);
      alert(error.message || 'Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!confirm('Remove this employee from the project?')) return;

    setRemoving(employeeId);
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/remove/employee/${project._id}`,
        { employeeId }
      );
      if (data) {
        setProjectData(data.project);
      }
    } catch (error: any) {
      console.error('Failed to remove employee:', error);
      alert(error.message || 'Failed to remove employee');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-gray-200 bg-[#faf9f6]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-black">Manage Team</DialogTitle>
          <DialogDescription className="text-gray-600">
            Add or remove employees from {project.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Employee */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-[#faf9f6] p-4">
              <h3 className="mb-3 font-semibold text-black">Add Employee</h3>
              <div className="flex gap-2 w-full">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full border-gray-300 bg-white">
                    <SelectValue placeholder="Select an employee..." />
                  </SelectTrigger>
                  <SelectContent className="text-black bg-white">
                    {availableEmployees.length > 0 ? (
                      availableEmployees.map((emp) => (
                        <SelectItem key={emp._id} value={emp._id}>
                          {emp.name} ({emp.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="disabled" disabled>
                        No employees available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddEmployee}
                  disabled={!selectedEmployee || adding}
                  className="gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 border border-gray-400"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="mt-5 flex items-center justify-end">
                <Button
                  onClick={() => onSuccess()}
                  disabled={adding}
                  className="gap-2 bg-gray-700 hover:bg-gray-800 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Current Team */}
          <div>
            <h3 className="mb-3 font-semibold text-black">
              Current Team ({projectData.employees?.length || 0})
            </h3>
            <div className="space-y-2">
              {projectData.employees && projectData.employees.length > 0 ? (
                projectData.employees.map((emp: any) => (
                  <div
                    key={emp._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-[#faf9f6] p-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-8 w-8 bg-[#e8e6e1] flex-shrink-0">
                        <AvatarFallback className="text-[#8b8678]">
                          {emp.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate">{emp.name}</p>
                        <p className="text-xs text-gray-600 truncate">{emp.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmployee(emp._id)}
                      disabled={removing === emp._id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 border border-transparent hover:border-orange-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No team members yet</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
