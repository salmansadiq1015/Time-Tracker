"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, RotateCcw } from "lucide-react";
import { ExportButtons } from "./export-button";

interface FilterState {
  selectedUser: string;
  startDate: string;
  endDate: string;
  dateRange: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  users: any[];
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  isAdmin: boolean;
  summary: any;
  entries: any[];
}

export function AdvancedFilters({
  filters,
  users,
  onFilterChange,
  onReset,
  showFilters,
  onToggleFilters,
  isAdmin,
  entries,
  summary,
}: AdvancedFiltersProps) {
  const getDateRange = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date();
    let endDate = new Date();

    switch (range) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case "last3days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 3);
        endDate = new Date(today);
        break;
      case "last7days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(today);
        break;
      case "last15days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 15);
        endDate = new Date(today);
        break;
      case "last30days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 30);
        endDate = new Date(today);
        break;
      default:
        return { startDate: "", endDate: "" };
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const handleDateRangeChange = (range: string) => {
    if (range === "custom") {
      onFilterChange({ ...filters, dateRange: range });
    } else if (range === "") {
      onFilterChange({ ...filters, dateRange: "", startDate: "", endDate: "" });
    } else {
      const { startDate, endDate } = getDateRange(range);
      onFilterChange({ ...filters, dateRange: range, startDate, endDate });
    }
  };

  const handleUserChange = (userId: string) => {
    onFilterChange({ ...filters, selectedUser: userId });
  };

  const handleStartDateChange = (date: string) => {
    onFilterChange({ ...filters, startDate: date, dateRange: "custom" });
  };

  const handleEndDateChange = (date: string) => {
    onFilterChange({ ...filters, endDate: date, dateRange: "custom" });
  };

  const hasActiveFilters =
    filters.selectedUser || filters.startDate || filters.endDate;

  return (
    <Card className="border-gray-400 bg-gray-200/70 backdrop-blur-sm py-3 text-black">
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
          <ExportButtons entries={entries} summary={summary} />
        </div>
      </CardHeader>

      {showFilters && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Filter */}
            {users.length > 0 && isAdmin && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by User</label>
                <select
                  value={filters.selectedUser}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={filters.dateRange || ""}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last3days">Last 3 Days</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last15days">Last 15 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Start Date - Only show when Custom is selected */}
            {filters.dateRange === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="bg-gray-800 border border-gray-400 rounded-md text-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent cursor-pointer"
                  placeholder="Select start date"
                />
              </div>
            )}

            {/* End Date - Only show when Custom is selected */}
            {filters.dateRange === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="bg-gray-800 border border-gray-400 rounded-md text-gray-600rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent cursor-pointer"
                  placeholder="Select end date"
                  min={
                    filters.startDate
                      ? filters.startDate.slice(0, 16)
                      : undefined
                  }
                />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
