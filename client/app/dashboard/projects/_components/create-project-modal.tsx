'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    startDate: '',
    endDate: '',
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
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

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
        state: formData.state,
        zip: formData.zip,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        employees: [],
      };
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/create`,
        payload
      );

      if (data) {
        toast.success('Project created successfully');
        onClose();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to create project:', error);
      alert(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-gray-700 bg-[#1e2339]">
        <DialogHeader className="bg-gradient-to-r from-gray-500 to-gray-600 text-white -m-6 mb-4 p-6 rounded-t-lg">
          <DialogTitle className="text-3xl font-bold text-white">Create New Project</DialogTitle>
          <p className="mt-1 text-sm text-gray-200">Set up a new project and define its timeline</p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 bg-[#1e2339]"
        >
          {/* Project Name Section */}
          <div className="rounded-lg border border-gray-700 bg-[#0f1419] p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <Label htmlFor="name" className="text-sm font-semibold text-white">
                Project Name *
              </Label>
            </div>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Website Redesign Project"
              className={`bg-[#1e2339] border-2 transition-colors text-white placeholder:text-gray-500 ${
                errors.name ? 'border-red-500' : 'border-gray-600 focus:border-gray-500'
              }`}
            />
            {errors.name && <p className="mt-2 text-xs text-red-400 font-medium">{errors.name}</p>}
          </div>

          {/* Client Selection Section */}
          {/* <div className="rounded-lg border border-amber-100 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-amber-600" />
              <Label className="text-sm font-semibold text-amber-900">Select Client *</Label>
            </div>
            <div className="relative">
              <div
                className={`flex items-center gap-2 rounded-md border-2 px-3 py-2 transition-all cursor-pointer ${
                  errors.client
                    ? 'border-destructive bg-destructive/5'
                    : 'border-amber-200 bg-amber-50 focus-within:border-amber-500 focus-within:bg-white'
                }`}
                onClick={() => setShowClientDropdown(!showClientDropdown)}
              >
                <Search className="h-4 w-4 text-amber-600" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchClients}
                  onChange={(e) => setSearchClients(e.target.value)}
                  onFocus={() => setShowClientDropdown(true)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                {formData.client && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectClient({
                        _id: '',
                        email: '',
                        name: '',
                      })
                    }
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showClientDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border-2 border-amber-200 bg-white shadow-lg">
                  {clientsLoading ? (
                    <div className="p-4 text-center text-amber-600">Loading clients...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className="p-4 text-center text-amber-600">No clients found</div>
                  ) : (
                    filteredClients.map((client) => (
                      <button
                        key={client._id}
                        type="button"
                        onClick={() => handleSelectClient(client)}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 border-b border-amber-50 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-foreground">{`${client.name} `}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {formData.client && (
              <p className="mt-2 text-xs text-amber-700 font-medium">Selected: {formData.client}</p>
            )}
            {errors.client && (
              <p className="mt-2 text-xs text-destructive font-medium">{errors.client}</p>
            )}
          </div> */}

          {/* Address & Location Section */}
          <div className="rounded-lg border border-gray-700 bg-[#0f1419] p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <Label className="text-sm font-semibold text-white">Location Details *</Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className={`bg-[#1e2339] border-2 transition-colors text-white placeholder:text-gray-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-600 focus:border-gray-500'
                  }`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
              </div>
              <div>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="bg-[#1e2339] border-2 border-gray-600 focus:border-gray-500 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="bg-[#1e2339] border-2 border-gray-600 focus:border-gray-500 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Input
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  placeholder="Zip Code"
                  className="bg-[#1e2339] border-2 border-gray-600 focus:border-gray-500 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-lg border border-gray-700 bg-[#0f1419] p-4">
            <Label htmlFor="description" className="text-sm font-semibold text-white">
              Project Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the project's goals, outcomes and any other useful context"
              className="mt-2 h-28 bg-[#1e2339] border-2 border-gray-600 focus:border-gray-500 resize-none text-white placeholder:text-gray-500"
            />
          </div>

          {/* Dates Section */}
          <div className="rounded-lg border border-gray-700 bg-[#0f1419] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <Label className="text-sm font-semibold text-white">Project Timeline *</Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400 mb-1">Start Date</p>
                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`bg-[#1e2339] border-2 transition-colors text-white ${
                    errors.startDate ? 'border-red-500' : 'border-gray-600 focus:border-gray-500'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-400">{errors.startDate}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">End Date</p>
                <Input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`bg-[#1e2339] border-2 transition-colors text-white ${
                    errors.endDate ? 'border-red-500' : 'border-gray-600 focus:border-gray-500'
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
