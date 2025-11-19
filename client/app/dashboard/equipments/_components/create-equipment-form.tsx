'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import axios from 'axios';

interface CreateEquipmentFormProps {
  onSuccess: () => void;
}

export function CreateEquipmentForm({ onSuccess }: CreateEquipmentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    serial: '',
    assignDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/equipment/create`,
        formData
      );

      if (data.success) {
        setSuccess('Equipment created successfully!');
        setFormData({ name: '', serial: '', assignDate: new Date().toISOString().split('T')[0] });
        setTimeout(onSuccess, 1500);
      } else {
        setError(data.message || 'Failed to create equipment');
      }
    } catch (err) {
      setError('Error creating equipment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div>
        <Label htmlFor="name" className="pb-1 text-white">
          Equipment Name *
        </Label>
        <Input
          id="name"
          placeholder="e.g., MacBook Pro 14"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
          required
        />
      </div>

      <div>
        <Label htmlFor="serial" className="pb-1 text-white">
          Serial Number *
        </Label>
        <Input
          id="serial"
          placeholder="e.g., ABC123XYZ"
          value={formData.serial}
          onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
          className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-gray-500"
          required
        />
      </div>

      <div>
        <Label htmlFor="assignDate" className="pb-1 text-white">
          Assign Date
        </Label>
        <Input
          id="assignDate"
          type="date"
          value={formData.assignDate}
          onChange={(e) => setFormData({ ...formData, assignDate: e.target.value })}
          className="bg-[#0f1419] border-gray-600 text-white focus:border-gray-500"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-b from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-gray-900"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Equipment'
        )}
      </Button>
    </form>
  );
}
