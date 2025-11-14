import { Fragment, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight, Edit3, Trash2, Calendar, User, ListChecks } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskRow {
  _id: string;
  title: string;
  description: string;
  project?: { _id: string; name: string; client?: { _id: string; name: string } };
  assignedTo?: { _id: string; name: string; email?: string; phone?: string; role: string };
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { _id: string; name: string; email?: string; phone?: string };
}

interface TaskTableProps {
  tasks: TaskRow[];
  onEdit: (task: TaskRow) => void;
  onDelete: (task: TaskRow) => void;
  onStatusChange: (taskId: string, value: TaskRow['status']) => void;
  onPriorityChange: (taskId: string, value: TaskRow['priority']) => void;
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

export const TaskTable = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onPriorityChange,
  isUserRole,
  statusMeta,
  priorityMeta,
}: TaskTableProps) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-linear-to-r from-blue-600 to-blue-700 text-white">
          <TableRow>
            <TableHead className="w-12 text-white"></TableHead>
            <TableHead className="min-w-[220px] text-white">Task</TableHead>
            <TableHead className="min-w-[160px] text-white">Project</TableHead>
            <TableHead className="min-w-[150px] text-white">Assigned To</TableHead>
            <TableHead className="w-32 text-white">Due Date</TableHead>
            <TableHead className="w-32 text-white">Priority</TableHead>
            <TableHead className="w-40 text-white">Status</TableHead>
            <TableHead className="w-32 text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isExpanded = expandedTaskId === task._id;
            return (
              <Fragment key={task._id}>
                <TableRow key={task._id} className="hover:bg-gray-800/30 transition border-b border-gray-700/30">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleExpand(task._id)}
                      className="h-8 w-8 text-blue-400 hover:text-blue-300"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-white line-clamp-1">{task.title}</div>
                    <div className="text-xs text-gray-400">
                      Created {formatDate(task.createdAt)}{' '}
                      {task.createdBy?.name ? `• ${task.createdBy?.name}` : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-gray-300">
                      <span className="font-medium">{task.project?.name || '—'}</span>
                      {task.project?.client?.name && (
                        <span className="text-xs text-gray-400">
                          Client: {task.project.client.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-white">
                      <User className="h-4 w-4 text-blue-400" />
                      <div className="flex flex-col">
                        <span className="font-medium">{task.assignedTo?.name || 'Unassigned'}</span>
                        {task.assignedTo?.phone && (
                          <span className="text-xs text-gray-400">{task.assignedTo.phone}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-white">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      {formatDate(task.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.priority}
                      onValueChange={(value) =>
                        onPriorityChange(task._id, value as TaskRow['priority'])
                      }
                      disabled={isUserRole}
                    >
                      <SelectTrigger className="border-gray-600 bg-[#0f1419] text-white focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e2339] border-gray-700">
                        {(['low', 'medium', 'high'] as const).map((value) => (
                          <SelectItem key={value} value={value}>
                            {priorityMeta[value].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        onStatusChange(task._id, value as TaskRow['status'])
                      }
                    >
                      <SelectTrigger className="border-gray-600 bg-[#0f1419] text-white focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e2339] border-gray-700">
                        {(['pending', 'in_progress', 'completed'] as const).map((value) => (
                          <SelectItem key={value} value={value}>
                            {statusMeta[value].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="flex justify-end items-center gap-2">
                    {!isUserRole && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(task)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-600/20"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
                    {!isUserRole && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(task)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-gray-800/30">
                    <TableCell colSpan={8}>
                      <div className="grid gap-4 md:grid-cols-5">
                        <div className="md:col-span-3 space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                              <ListChecks className="h-4 w-4 text-blue-400" />
                              Description
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed bg-[#0f1419] border border-gray-600 rounded-lg p-3 whitespace-pre-wrap wrap-break-word">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Badge
                              className={`px-3 py-1 text-xs font-semibold border ${
                                statusMeta[task.status].className
                              }`}
                            >
                              <span
                                className={`inline-block h-2 w-2 rounded-full mr-2 ${
                                  statusMeta[task.status].dotClass
                                }`}
                              />
                              {statusMeta[task.status].label}
                            </Badge>
                            <Badge
                              className={`px-3 py-1 text-xs font-semibold border ${
                                priorityMeta[task.priority].color
                              }`}
                            >
                              Priority: {priorityMeta[task.priority].label}
                            </Badge>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              Due {formatDate(task.dueDate)}
                            </Badge>
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                          <div className="bg-[#0f1419] border border-gray-600 rounded-lg p-3 shadow-sm space-y-3">
                            <h4 className="text-sm font-semibold text-blue-400">Assignment</h4>
                            <div className="text-sm text-gray-300 space-y-1">
                              <div>
                                <span className="text-xs uppercase tracking-wide text-gray-500 block">
                                  Assigned to
                                </span>
                                {task.assignedTo?.name || 'Unassigned'}
                              </div>
                              {task.assignedTo?.phone && (
                                <div className="text-xs text-gray-400">{task.assignedTo.phone}</div>
                              )}
                              <div className="pt-2">
                                <span className="text-xs uppercase tracking-wide text-gray-500 block">
                                  Created by
                                </span>
                                {task.createdBy?.name || 'System'}
                              </div>
                              {task.createdBy?.email && (
                                <div className="text-xs text-gray-400">{task.createdBy.email}</div>
                              )}
                              {task.createdBy?.phone && (
                                <div className="text-xs text-gray-400">{task.createdBy.phone}</div>
                              )}
                            </div>
                          </div>
                          <div className="bg-[#0f1419] border border-gray-600 rounded-lg p-3 shadow-sm">
                            <h4 className="text-sm font-semibold text-blue-400">Status insight</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {statusMeta[task.status].description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
