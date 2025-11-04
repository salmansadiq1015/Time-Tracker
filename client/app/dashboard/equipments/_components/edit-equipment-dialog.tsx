'use client';

import type React from 'react';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Equipment {
  _id: string;
  name: string;
  serial: string;
  purchaseDate?: string;
}

interface EditEquipmentDialogProps {
  equipment: Equipment;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEquipmentDialog({ equipment, onClose, onSuccess }: EditEquipmentDialogProps) {
  const [formData, setFormData] = useState({
    name: equipment.name,
    serial: equipment.serial,
    purchaseDate: equipment.purchaseDate?.split('T')[0] || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/equipment/update/${equipment._id}`,
        formData
      );

      if (data.success) {
        onSuccess();
        toast.success('Equipment updated successfully');
      } else {
        setError(data.message || 'Failed to update equipment');
      }
    } catch (err) {
      setError('Error updating equipment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>Update equipment details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="edit-name">Equipment Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="edit-serial">Serial Number</Label>
            <Input
              id="edit-serial"
              value={formData.serial}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
            <Input
              id="edit-purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
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
