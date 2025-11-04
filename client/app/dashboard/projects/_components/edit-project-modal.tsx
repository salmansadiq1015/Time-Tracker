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
import { X, Plus, Building2, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Project {
  _id: string;
  name: string;
  client: string;
  address: string;
  location?: string;
  city?: string;
  description: string;
  startDate: string;
  endDate: string;
  tags?: string[];
}

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

interface Client {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
}
export function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [searchClients, setSearchClients] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [formData, setFormData] = useState({
    name: project.name,
    client: project.client,
    address: project.address,
    location: project.city || '',
    description: project.description,
    startDate: project.startDate.split('T')[0],
    endDate: project.endDate.split('T')[0],
  });

  // Fetch Client
  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true);
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all?role=client`
        );
        setClients(data.results?.users || []);
        const client = data.results?.users.find((user: any) => user._id === project.client);
        console.log('client:', client);

      if (client) {
        setSelectedClient(client.name);
      }
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, [project]);

  const filteredClients = clients.filter((client) =>
    (client.name || client.email || '').toLowerCase().includes(searchClients.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setFormData((prev) => ({
      ...prev,
      client: client._id,
    }));
    setSelectedClient(client.name || client.email);
    setShowClientDropdown(false);
    setSearchClients('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
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
        client: formData.client,
        address: formData.address,
        city: formData.location,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tags,
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

          {/* Client Name */}
          {/* Client Selection Section */}
          <div className="rounded-lg border border-amber-100 bg-white p-4">
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

              {/* Client Dropdown */}
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
              <p className="mt-2 text-xs text-amber-700 font-medium">
                Selected: {selectedClient || formData.client}
              </p>
            )}
            {errors.client && (
              <p className="mt-2 text-xs text-destructive font-medium">{errors.client}</p>
            )}
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
              <Label htmlFor="location" className="text-foreground pb-1">
                Location/City
              </Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
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

          {/* Tags */}
          <div>
            <Label htmlFor="tags" className="text-foreground pb-1">
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags..."
                className="border-amber-200"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="border-amber-200 bg-transparent"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-amber-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
