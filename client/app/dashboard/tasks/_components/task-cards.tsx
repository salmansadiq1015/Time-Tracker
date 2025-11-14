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
            className="rounded-xl border border-gray-700/50 bg-[#1e2339] shadow-md"
          >
            <div className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{task.title}</h3>
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
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    Due {formatDate(task.dueDate)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    {task.assignedTo?.name || 'Unassigned'}
                  </div>
                  {task.assignedTo?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-xs uppercase tracking-wide text-gray-400">Phone</span>
                      {task.assignedTo.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-400" />
                    {task.project?.name || 'No project'}
                  </div>
                </div>
                {isExpanded && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-blue-400">Description</h4>
                      <p className="text-sm text-gray-300 leading-relaxed mt-1 bg-[#0f1419] border border-gray-600 rounded-lg p-3 whitespace-pre-wrap wrap-break-word">
                        {task.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#0f1419] border border-gray-600 rounded-lg p-3">
                        <h5 className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          Assigned to
                        </h5>
                        <p className="text-sm font-medium text-white">
                          {task.assignedTo?.name || 'Unassigned'}
                        </p>
                        {task.assignedTo?.phone && (
                          <p className="text-xs text-gray-400">{task.assignedTo.phone}</p>
                        )}
                      </div>
                      <div className="bg-[#0f1419] border border-gray-600 rounded-lg p-3">
                        <h5 className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                          Created By
                        </h5>
                        <p className="text-sm font-medium text-white">
                          {task.createdBy?.name || 'Unknown'}
                        </p>
                        {task.createdBy?.email && (
                          <p className="text-xs text-gray-400">{task.createdBy.email}</p>
                        )}
                        {task.createdBy?.phone && (
                          <p className="text-xs text-gray-400">{task.createdBy.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-700/50 bg-[#0f1419] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select
                  value={task.status}
                  onValueChange={(value) =>
                    onStatusChange(task._id, value as TaskCardData['status'])
                  }
                >
                  <SelectTrigger className="w-36 border-gray-600 bg-[#1e2339] text-white focus:ring-blue-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2339] border-gray-700">
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
                  <SelectTrigger className="w-32 border-gray-600 bg-[#1e2339] text-white focus:ring-blue-500">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2339] border-gray-700">
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
                    className="border-gray-600 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 bg-[#1e2339]"
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
                    className="border-gray-600 text-red-400 hover:bg-red-600/20 hover:text-red-300 bg-[#1e2339]"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-300 hover:bg-gray-700">
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
