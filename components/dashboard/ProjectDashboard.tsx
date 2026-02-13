"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, FolderOpen } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { AIStatusIndicator } from "@/components/shell/AIStatusIndicator";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { PortfolioAnalytics } from "./PortfolioAnalytics";

export function ProjectDashboard() {
  const projects = useStore((s) => s.projects);
  const openProject = useStore((s) => s.openProject);
  const deleteProject = useStore((s) => s.deleteProject);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 4-6" />
              </svg>
            </div>
            <span className="font-heading text-base font-semibold text-white">
              CSR Impact Assessment
            </span>
          </div>
          <AIStatusIndicator />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        {/* Title bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-[28px] font-bold leading-tight text-dark tracking-tight">
              Your Projects
            </h1>
            <p className="mt-1 text-sm text-muted">
              {projects.length === 0
                ? "Get started by creating your first project"
                : `${projects.length} project${projects.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {projects.length > 0 && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          )}
        </div>

        {/* Portfolio analytics */}
        <PortfolioAnalytics projects={projects} />

        {/* Projects grid or empty state */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <FolderOpen className="h-16 w-16 text-slate-300" strokeWidth={1} />
            <h2 className="mt-4 font-heading text-xl font-semibold text-dark">
              No projects yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Create your first CSR impact assessment
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-6">
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpen={openProject}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
