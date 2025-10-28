"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, RotateCcw } from "lucide-react";

interface FilterState {
  selectedUser: string;
  startDate: string;
  endDate: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  users: any[];
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  isAdmin: boolean;
}

export function AdvancedFilters({
  filters,
  users,
  onFilterChange,
  onReset,
  showFilters,
  onToggleFilters,
  isAdmin,
}: AdvancedFiltersProps) {
  const handleUserChange = (userId: string) => {
    onFilterChange({ ...filters, selectedUser: userId });
  };

  const handleStartDateChange = (date: string) => {
    onFilterChange({ ...filters, startDate: date });
  };

  const handleEndDateChange = (date: string) => {
    onFilterChange({ ...filters, endDate: date });
  };

  const hasActiveFilters =
    filters.selectedUser || filters.startDate || filters.endDate;

  return (
    <Card className="border-gray-700 bg-gray-800/70 backdrop-blur-sm py-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
              {
                [
                  filters.selectedUser,
                  filters.startDate,
                  filters.endDate,
                ].filter(Boolean).length
              }{" "}
              active
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2 bg-transparent"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFilters}
            className="gap-2"
          >
            {showFilters ? (
              <>
                <X className="w-4 h-4" />
                Hide
              </>
            ) : (
              <>
                <Filter className="w-4 h-4" />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Filter */}
            {isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by User</label>
                <select
                  value={filters.selectedUser}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent cursor-pointer"
                placeholder="Select start date"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="bg-gray-800 border border-gray-700  text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent cursor-pointer"
                placeholder="Select end date"
                min={
                  filters.startDate ? filters.startDate.slice(0, 16) : undefined
                }
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
