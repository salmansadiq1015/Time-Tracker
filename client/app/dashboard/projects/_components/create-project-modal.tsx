'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Search, Building2, Calendar, MapPin, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
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

export function CreateProjectModal({ onClose, onSuccess }: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [searchClients, setSearchClients] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    clientId: '',
    address: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setClientsLoading(true);
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all?role=client`
        );
        setClients(data.results?.users || []);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    (client.name || client.email || '').toLowerCase().includes(searchClients.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    setFormData((prev) => ({
      ...prev,
      client: `${client.name} ` || client.email,
      clientId: client._id,
    }));
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
    // if (!formData.clientId) newErrors.client = 'Please select a client';
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
        client: formData.clientId,
        address: formData.address,
        city: formData.location,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tags,
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
      <DialogContent className="max-w-4xl border-amber-200 bg-gradient-to-br from-amber-50 to-white">
        <DialogHeader className="border-b border-amber-100 pb-4">
          <DialogTitle className="text-3xl font-bold text-amber-900">
            Create New Project
          </DialogTitle>
          <p className="mt-1 text-sm text-amber-700">Set up a new project and assign clients</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          {/* Project Name Section */}
          <div className="rounded-lg border border-amber-100 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-amber-600" />
              <Label htmlFor="name" className="text-sm font-semibold text-amber-900">
                Project Name *
              </Label>
            </div>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Website Redesign Project"
              className={`border-2 transition-colors ${
                errors.name
                  ? 'border-destructive bg-destructive/5'
                  : 'border-amber-200 focus:border-amber-500'
              }`}
            />
            {errors.name && (
              <p className="mt-2 text-xs text-destructive font-medium">{errors.name}</p>
            )}
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
          <div className="rounded-lg border border-amber-100 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-amber-600" />
              <Label className="text-sm font-semibold text-amber-900">Location Details *</Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  className={`border-2 transition-colors ${
                    errors.address
                      ? 'border-destructive bg-destructive/5'
                      : 'border-amber-200 focus:border-amber-500'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-destructive">{errors.address}</p>
                )}
              </div>
              <div>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City / Region"
                  className="border-2 border-amber-200 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="rounded-lg border border-amber-100 bg-white p-4">
            <Label htmlFor="description" className="text-sm font-semibold text-amber-900">
              Project Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the project details and objectives..."
              rows={5}
              className="mt-2 h-[7rem] border-2 border-amber-200 focus:border-amber-500 resize-none"
            />
          </div>

          {/* Dates Section */}
          <div className="rounded-lg border border-amber-100 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-amber-600" />
              <Label className="text-sm font-semibold text-amber-900">Project Timeline *</Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`border-2 transition-colors ${
                    errors.startDate
                      ? 'border-destructive bg-destructive/5'
                      : 'border-amber-200 focus:border-amber-500'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.startDate}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <Input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`border-2 transition-colors ${
                    errors.endDate
                      ? 'border-destructive bg-destructive/5'
                      : 'border-amber-200 focus:border-amber-500'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-destructive">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="rounded-lg border border-amber-100 bg-white p-4">
            <Label className="text-sm font-semibold text-amber-900">Project Tags</Label>
            <div className="mt-3 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag and press Enter..."
                className="border-2 border-amber-200 focus:border-amber-500"
              />
              <Button
                type="button"
                onClick={addTag}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-sm font-medium text-amber-700 border border-amber-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-amber-900 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-amber-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
