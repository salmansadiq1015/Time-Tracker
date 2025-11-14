'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'dispatcher' | 'admin' | 'client';
  status?: 'active' | 'inactive';
}

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isLoading = false }: UserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'dispatcher' | 'admin' | 'client'>('user');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'user');
      setStatus(user.status || 'active');
    } else {
      // Reset form when no user
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('user');
      setStatus('active');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, password, phone, role, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-white">Name</label>
        <Input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-white">Email</label>
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-white">Phone</label>
        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isLoading}
          className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {!user && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="bg-[#0f1419] border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-white">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-[#0f1419] border-2 border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="user">User</option>
          {/* <option value="client">Client</option> */}
          <option value="dispatcher">Dispatcher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {user && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-[#0f1419] border-2 border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-[#0f1419] border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {user ? 'Updating...' : 'Creating...'}
            </>
          ) : user ? (
            'Update User'
          ) : (
            'Create User'
          )}
        </Button>
      </div>
    </form>
  );
}
