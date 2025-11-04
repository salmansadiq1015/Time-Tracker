'use client';

import { AlertCircle } from 'lucide-react';
import { ProjectCard } from './project-card';

interface Project {
  _id: string;
  name: string;
  client: string;
  address: string;
  location?: string;
  description: string;
  startDate: string;
  endDate: string;
  employees: any[];
  tags?: string[];
  isActive: boolean;
}

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  onRefresh: () => void;
}

export function ProjectList({ projects, loading, onRefresh }: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl border border-amber-200 bg-white" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-amber-200 bg-white p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">No projects found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Create a new project to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
