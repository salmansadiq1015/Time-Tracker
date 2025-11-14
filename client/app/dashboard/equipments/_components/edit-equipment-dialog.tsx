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
      <DialogContent className="max-w-md bg-[#1e2339] border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Equipment</DialogTitle>
          <DialogDescription className="text-gray-400">Update equipment details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm border border-red-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="edit-name" className="pb-1 text-white">
              Equipment Name
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[#0f1419] border-gray-600 text-white focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="edit-serial" className="pb-1 text-white">
              Serial Number
            </Label>
            <Input
              id="edit-serial"
              value={formData.serial}
              onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
              className="bg-[#0f1419] border-gray-600 text-white focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="edit-purchaseDate" className="pb-1 text-white">
              Purchase Date
            </Label>
            <Input
              id="edit-purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="bg-[#0f1419] border-gray-600 text-white focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
              <Button type="button" variant="outline" className="flex-1 bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
