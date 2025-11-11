import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: any) => void;
  loading: boolean;
  projects: any[];
  users: any[];
  initialData?: any;
  isUserRole: boolean;
  selectedProjectId: string | null;
  statusMeta: any;
  priorityMeta: any;
}
const UNASSIGNED_VALUE = 'unassigned';

const formatDateInput = (date: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TaskFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading,
  projects,
  users,
  initialData,
  isUserRole,
  selectedProjectId,
  statusMeta,
  priorityMeta,
}: TaskFormDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>(UNASSIGNED_VALUE);
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setProject(initialData.project?._id || initialData.project || '');
      setAssignedTo(initialData.assignedTo?._id || UNASSIGNED_VALUE);
      setStatus(initialData.status || 'pending');
      setPriority(initialData.priority || 'medium');
      setDueDate(formatDateInput(initialData.dueDate));
    } else {
      setTitle('');
      setDescription('');
      setProject(selectedProjectId || '');
      setAssignedTo(UNASSIGNED_VALUE);
      setStatus('pending');
      setPriority('medium');
      setDueDate('');
    }
  }, [initialData, selectedProjectId, open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !project || !dueDate) {
      toast.error('Please fill in title, description, project and due date.');
      return;
    }

    const normalizedAssignedTo = assignedTo === UNASSIGNED_VALUE ? undefined : assignedTo;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      project,
      assignedTo: normalizedAssignedTo,
      status,
      priority,
      dueDate,
    });
  };

  const dialogTitle = initialData ? 'Update Task' : 'Create Task';
  const dialogDescription = initialData
    ? 'Fine-tune the task details, adjust ownership, status and delivery expectations.'
    : 'Outline the task, link it to a project and assign ownership to keep momentum high.';

  const assigneeOptions = useMemo(() => {
    return users
      ?.filter(
        (user) => user.role === 'user' || user.role === 'dispatcher' || user.role === 'admin'
      )
      .map((user) => ({
        label: user.name,
        value: user._id,
      }));
  }, [users]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl border border-amber-200/80 bg-linear-to-br from-white via-amber-50 to-white shadow-xl shadow-amber-200/40 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-semibold text-gray-900">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 mt-2 rounded-2xl border border-amber-100 bg-white/70 p-6 shadow-inner shadow-amber-100/50"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-amber-700/80">
                Task title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Prepare project kickoff deck"
                className="border-amber-200/80 bg-white/90 focus-visible:ring-[#c16840] focus-visible:ring-2 focus-visible:ring-offset-1 rounded-xl px-4 py-3 shadow-sm"
                required
              />
            </div>
            <div className="space-y-2 w-full">
              <Label className="text-xs uppercase tracking-wide text-amber-700/80">
                Project <span className="text-red-500">*</span>
              </Label>
              <Select value={project || ''} onValueChange={setProject} required>
                <SelectTrigger className="w-full border-amber-200/80 bg-white/90 focus:ring-[#c16840] focus:ring-2 focus:ring-offset-1 rounded-xl px-4 py-3 text-left text-sm shadow-sm">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="max-h-60 w-(--radix-select-trigger-width)">
                  {projects?.map((proj) => (
                    <SelectItem key={proj._id} value={proj._id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-amber-700/80">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context, acceptance criteria or supporting details..."
              className="min-h-[140px] border-amber-200/80 bg-white/90 focus-visible:ring-[#c16840] focus-visible:ring-2 focus-visible:ring-offset-1 rounded-xl px-4 py-3 shadow-sm"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-amber-700/80">Assign to</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo} disabled={isUserRole}>
                <SelectTrigger className="w-full border-amber-200/80 bg-white/90 focus:ring-[#c16840] focus:ring-2 focus:ring-offset-1 rounded-xl px-4 py-3 text-left text-sm shadow-sm disabled:opacity-60">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent className="max-h-60 w-(--radix-select-trigger-width)">
                  <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                  {assigneeOptions?.map((user) => (
                    <SelectItem key={user.value} value={user.value}>
                      {user.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-amber-700/80">
                Due date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={formatDateInput(new Date())}
                  className="border-amber-200/80 bg-white/90 focus-visible:ring-[#c16840] focus-visible:ring-2 focus-visible:ring-offset-1 rounded-xl px-4 py-3 pr-12 shadow-sm"
                  required
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-amber-700/80">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger className="w-full border-amber-200/80 bg-white/90 focus:ring-[#c16840] focus:ring-2 focus:ring-offset-1 rounded-xl px-4 py-3 text-left text-sm shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-(--radix-select-trigger-width)">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${statusMeta[status].dotClass}`}
                />
                {statusMeta[status].description}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-amber-700/80">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                <SelectTrigger className="w-full border-amber-200/80 bg-white/90 focus:ring-[#c16840] focus:ring-2 focus:ring-offset-1 rounded-xl px-4 py-3 text-left text-sm shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-(--radix-select-trigger-width)">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Badge
                className={`mt-2 inline-flex items-center gap-2 border ${priorityMeta[priority].color}`}
              >
                Priority: {priorityMeta[priority].label}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-200/70">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-amber-200/80 text-amber-700 hover:bg-amber-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#c16840] hover:bg-[#aa5735] text-white min-w-[140px] rounded-xl shadow-lg shadow-amber-200/40"
            >
              {loading ? <span className="animate-pulse">Saving...</span> : 'Save task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
