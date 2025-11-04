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
    purchaseDate: new Date().toISOString().split('T')[0],
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
        setFormData({ name: '', serial: '', purchaseDate: new Date().toISOString().split('T')[0] });
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
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-100 text-green-800 rounded-lg dark:bg-green-900 dark:text-green-200">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div>
        <Label htmlFor="name" className="pb-1">
          Equipment Name *
        </Label>
        <Input
          id="name"
          placeholder="e.g., MacBook Pro 14"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="serial" className="pb-1">
          Serial Number *
        </Label>
        <Input
          id="serial"
          placeholder="e.g., ABC123XYZ"
          value={formData.serial}
          onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="purchaseDate" className="pb-1">
          Purchase Date
        </Label>
        <Input
          id="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
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
