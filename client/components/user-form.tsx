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
        <label className="text-sm font-semibold text-gray-700">Name</label>
        <Input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840] focus:ring-1 focus:ring-[#c16840]/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Email</label>
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840] focus:ring-1 focus:ring-[#c16840]/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Phone</label>
        <Input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isLoading}
          className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840] focus:ring-1 focus:ring-[#c16840]/20 transition-all"
        />
      </div>

      {!user && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="bg-gray-50 border-gray-300 text-black focus:border-[#c16840] focus:ring-1 focus:ring-[#c16840]/20 transition-all"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-[#c16840] focus:outline-none transition-colors"
        >
          <option value="user">User</option>
          <option value="client">Client</option>
          <option value="dispatcher">Dispatcher</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {user && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-[#c16840] focus:outline-none transition-colors"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-transparent border-gray-300 text-black hover:bg-gray-100 transition-all"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-[#c16840] to-[#d17a4f] hover:from-[#d17a4f] hover:to-[#c16840] text-white shadow-lg shadow-[#c16840]/20 hover:shadow-[#c16840]/30 transition-all font-medium"
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
