import { Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface FilterState {
  search: string;
  status: 'all' | 'pending' | 'in_progress' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  project: string;
  assignedTo: string;
}

interface TaskFiltersProps {
  filters: FilterState;
  onFiltersChange: Dispatch<SetStateAction<FilterState>>;
  onReset: () => void;
  projects: any[];
  users: any[];
  isUserRole: boolean;
}

export const TaskFilters = ({
  filters,
  onFiltersChange,
  onReset,
  projects,
  users,
  isUserRole,
}: TaskFiltersProps) => {
  const setFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-amber-700/80">Status</Label>
          <Select value={filters.status} onValueChange={(value) => setFilter('status', value)}>
            <SelectTrigger className="border-amber-200 focus:ring-[#c16840]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-amber-700/80">Priority</Label>
          <Select value={filters.priority} onValueChange={(value) => setFilter('priority', value)}>
            <SelectTrigger className="border-amber-200 focus:ring-[#c16840]">
              <SelectValue placeholder="All priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wide text-amber-700/80">Project</Label>
          <Select value={filters.project} onValueChange={(value) => setFilter('project', value)}>
            <SelectTrigger className="border-amber-200 focus:ring-[#c16840]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="all">All projects</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isUserRole && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-amber-700/80">Assigned To</Label>
            <Select
              value={filters.assignedTo}
              onValueChange={(value) => setFilter('assignedTo', value)}
            >
              <SelectTrigger className="border-amber-200 focus:ring-[#c16840]">
                <SelectValue placeholder="All team members" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All team members</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-amber-700/80">
          Refine results by combining multiple filters for precise task tracking.
        </div>
        <Button
          variant="outline"
          onClick={onReset}
          className="border-amber-200 hover:bg-amber-50 text-amber-700 bg-white"
        >
          Reset filters
        </Button>
      </div>
    </div>
  );
};
