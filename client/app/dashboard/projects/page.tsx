'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Search,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  BarChart3,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProjectList } from './_components/project-list';
import { CreateProjectModal } from './_components/create-project-modal';
import axios from 'axios';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuthContent } from '@/app/context/authContext';

export default function ProjectDashboard() {
  const { auth } = useAuthContent();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(10);
  const [employeeId, setEmployeeId] = useState('');

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/auth/all`);
        const filterEmployees = data.results?.users.filter((user: any) => user.role === 'user');
        setEmployees(filterEmployees || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, limit, employeeId, startDate, endDate, refreshTrigger]);

  // Fetch projects when page or filters change
  useEffect(() => {
    fetchProjects();
  }, [
    currentPage,
    debouncedSearchTerm,
    limit,
    employeeId,
    startDate,
    endDate,
    refreshTrigger,
    auth?.user,
  ]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params: {
        page: number;
        limit: number;
        employeeId?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
      } = {
        page: currentPage,
        limit: limit,
      };
      const employee = auth?.user?.role === 'user' ? auth?.user?._id : employeeId;

      // Only add params if they have values
      if (employee) params.employeeId = employee;
      if (debouncedSearchTerm.trim()) params.search = debouncedSearchTerm.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/projects/all`,
        {
          params,
        }
      );
      setProjects(data.projects);
      setTotalProjects(data.pagination?.total || 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
      console.error('Error fetching projects:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setEmployeeId('');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const activeFilterCount = [employeeId, startDate, endDate].filter(Boolean).length;
  const totalPages = Math.ceil(totalProjects / limit);

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <Button
          key="1"
          variant="outline"
          onClick={() => setCurrentPage(1)}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'default' : 'outline'}
          onClick={() => setCurrentPage(i)}
          className={
            currentPage === i
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'
          }
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="px-2 text-gray-400">
            ...
          </span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant="outline"
          onClick={() => setCurrentPage(totalPages)}
          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-700/50 bg-[#1e2339]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Project Hub</h1>
              <p className="text-xs text-gray-400">Manage your projects efficiently</p>
            </div>
          </div>
          {auth.user.role === 'admin' && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Search Bar with Loading Indicator & View Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-600 bg-[#1e2339] p-3 shadow-sm">
            <Search
              className={`h-5 w-5 ${
                loading && searchTerm ? 'text-blue-400 animate-pulse' : 'text-gray-400'
              }`}
            />
            <Input
              type="text"
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus:ring-0 text-white placeholder:text-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-[#1e2339] rounded-lg p-1 border-2 border-gray-600 shadow-sm">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className={`h-9 px-3 transition-all duration-300 ${
                viewMode === 'card'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`h-9 px-3 transition-all duration-300 ${
                viewMode === 'table'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {(auth.user.role === 'admin' || auth.user.role === 'dispatcher') && (
          <div className="mb-6 space-y-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg
                className={`h-5 w-5 transition-transform ${
                  showAdvancedFilters ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
              Advanced Filters{' '}
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showAdvancedFilters && (
              <div className="rounded-xl border border-gray-600 bg-[#1e2339] p-6 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Employee Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Employee</label>
                    <select
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">All Employees</option>
                      {employees.map((e: any) => (
                        <option key={e._id} value={e._id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Start Date (From)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* End Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      End Date (To)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-600 bg-[#0f1419] px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Items Per Page & Sorting */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-white">Show:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                }}
                className="rounded-lg border border-gray-600 bg-[#1e2339] px-3 py-2 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs text-gray-400">per page</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Showing <span className="font-medium text-white">{projects.length}</span> of{' '}
            <span className="font-medium text-white">{totalProjects}</span>
          </div>
        </div>

        {/* Projects List */}
        <ProjectList
          projects={projects}
          loading={loading}
          viewMode={viewMode}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
        />

        {totalPages > 1 && (
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-[#1e2339] p-4 shadow-sm border border-gray-600">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex flex-wrap items-center gap-1">{getPaginationButtons()}</div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Page Info */}
            <div className="text-center text-sm text-gray-400">
              Page <span className="font-medium text-white">{currentPage}</span> of{' '}
              <span className="font-medium text-white">{totalPages}</span>
            </div>
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setRefreshTrigger((prev) => prev + 1);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
