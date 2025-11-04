'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EquipmentList } from './_components/equipment-list';
import { CreateEquipmentForm } from './_components/create-equipment-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function EquipmentDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEquipmentCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 ">
      <div className="w-full">
        <header className="sticky top-0 z-50 border-b border-amber-200 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-700">
                <span className="text-sm font-bold text-white">EM</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Equipment Management</h1>
                <p className="text-xs text-muted-foreground">
                  Manage, track, and assign your equipment inventory
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2 bg-amber-700 hover:bg-amber-800 text-white"
            >
              <Plus className="h-4 w-4" />
              New Equipment
            </Button>
          </div>
        </header>


        <div className="space-y-6 px-4 py-4">


          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Equipment</DialogTitle>
                <DialogDescription>
                  Add a new piece of equipment to your inventory
                </DialogDescription>
              </DialogHeader>
              <CreateEquipmentForm onSuccess={handleEquipmentCreated} />
            </DialogContent>
          </Dialog>

          <EquipmentList key={refreshKey} onRefresh={() => setRefreshKey((prev) => prev + 1)} />
        </div>
      </div>
    </div>
  );
}
