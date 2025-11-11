'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  name: string;
  address: string;
  location?: string;
  city?: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: project.name,
    address: project.address,
    city: project.city || '',
    description: project.description,
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate.split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        employees: [],
      };
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/update/${project._id}`,
        payload
      );

      if (data) {
        toast.success('Project updated successfully');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to update project:', error);
      alert(error.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-amber-200 max-h-[98vh] overflow-y-auto shidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">Edit Project</DialogTitle>
          <DialogDescription>Update project details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 ">
          {/* Project Name */}
          <div>
            <Label htmlFor="name" className="text-foreground pb-1">
              Project Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'border-destructive' : 'border-amber-200'}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Address & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="address" className="text-foreground pb-1">
                Address *
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'border-destructive' : 'border-amber-200'}
              />
              {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
            </div>
            <div>
              <Label htmlFor="city" className="text-foreground pb-1">
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="border-amber-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-foreground pb-1">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="border-amber-200"
            />
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate" className="text-foreground pb-1">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="border-amber-200"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-foreground pb-1">
                End Date
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                className={errors.endDate ? 'border-destructive' : 'border-amber-200'}
              />
              {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-200 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white"
            >
              {loading ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
