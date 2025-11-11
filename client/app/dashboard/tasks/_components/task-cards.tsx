import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Edit3,
  MoreHorizontal,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskCardData {
  _id: string;
  title: string;
  description: string;
  project?: { _id: string; name: string; client?: { _id: string; name: string } };
  assignedTo?: { _id: string; name: string; email?: string; role: string; phone?: string };
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { _id: string; name: string; email?: string; phone?: string };
}

interface TaskCardsProps {
  tasks: TaskCardData[];
  onEdit: (task: TaskCardData) => void;
  onDelete: (task: TaskCardData) => void;
  onStatusChange: (taskId: string, status: TaskCardData['status']) => void;
  onPriorityChange: (taskId: string, priority: TaskCardData['priority']) => void;
  isUserRole: boolean;
  statusMeta: any;
  priorityMeta: any;
}

const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return date;
  }
};

export const TaskCards = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  isUserRole,
  statusMeta,
  priorityMeta,
}: TaskCardsProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      {tasks.map((task) => {
        const isExpanded = expandedId === task._id;
        return (
          <div
            key={task._id}
            className="rounded-xl border border-amber-200 bg-linear-to-br from-white via-amber-50/50 to-white shadow-md shadow-amber-100/60"
          >
            <div className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge
                        className={`px-2.5 py-1 text-xs font-semibold border ${
                          statusMeta[task.status].className
                        }`}
                      >
                        {statusMeta[task.status].label}
                      </Badge>
                      <Badge
                        className={`px-2.5 py-1 text-xs font-semibold border ${
                          priorityMeta[task.priority].color
                        }`}
                      >
                        Priority: {priorityMeta[task.priority].label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedId(isExpanded ? null : task._id)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-500" />
                    Due {formatDate(task.dueDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-amber-500" />
                    {task.assignedTo?.name || 'Unassigned'}
                  </div>
                  {task.assignedTo?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-xs uppercase tracking-wide text-gray-400">Phone</span>
                      {task.assignedTo.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-amber-500" />
                    {task.project?.name || 'No project'}
                  </div>
                </div>
                {isExpanded && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-700">Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed mt-1 bg-white/70 border border-amber-100 rounded-lg p-3 whitespace-pre-wrap wrap-break-word">
                        {task.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white/70 border border-amber-100 rounded-lg p-3">
                        <h5 className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          Assigned to
                        </h5>
                        <p className="text-sm font-medium text-gray-700">
                          {task.assignedTo?.name || 'Unassigned'}
                        </p>
                        {task.assignedTo?.phone && (
                          <p className="text-xs text-gray-500">{task.assignedTo.phone}</p>
                        )}
                      </div>
                      <div className="bg-white/70 border border-amber-100 rounded-lg p-3">
                        <h5 className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          Created By
                        </h5>
                        <p className="text-sm font-medium text-gray-700">
                          {task.createdBy?.name || 'Unknown'}
                        </p>
                        {task.createdBy?.email && (
                          <p className="text-xs text-gray-500">{task.createdBy.email}</p>
                        )}
                        {task.createdBy?.phone && (
                          <p className="text-xs text-gray-500">{task.createdBy.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-amber-100/60 bg-white/80 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select
                  value={task.status}
                  onValueChange={(value) =>
                    onStatusChange(task._id, value as TaskCardData['status'])
                  }
                >
                  <SelectTrigger className="w-36 border-amber-200 focus:ring-[#c16840]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={task.priority}
                  onValueChange={(value) =>
                    onPriorityChange(task._id, value as TaskCardData['priority'])
                  }
                  disabled={isUserRole}
                >
                  <SelectTrigger className="w-32 border-amber-200 focus:ring-[#c16840]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                {!isUserRole && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(task)}
                    className="border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    <Edit3 className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                )}
                {!isUserRole && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(task)}
                    className="border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
