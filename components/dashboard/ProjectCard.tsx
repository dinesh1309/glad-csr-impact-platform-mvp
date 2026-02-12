"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { Project } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STAGE_DOT_COLORS: Record<number, string> = {
  1: "bg-stage-1",
  2: "bg-stage-2",
  3: "bg-stage-3",
  4: "bg-stage-4",
  5: "bg-stage-5",
};

const ACCENT_COLORS: Record<number, string> = {
  0: "bg-slate-300",
  1: "bg-stage-1",
  2: "bg-stage-2",
  3: "bg-stage-3",
  4: "bg-stage-4",
  5: "bg-stage-5",
};

function getAccentStage(project: Project): number {
  for (let i = 5; i >= 1; i--) {
    const key = `stage${i}Complete` as keyof typeof project.stageStatus;
    if (project.stageStatus[key]) return i;
  }
  return 0;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({
  project,
  index,
  onOpen,
  onDelete,
}: ProjectCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const accentStage = getAccentStage(project);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
        onClick={() => onOpen(project.id)}
        className="group relative flex cursor-pointer overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        {/* Left accent bar */}
        <div className={`w-1 shrink-0 ${ACCENT_COLORS[accentStage]}`} />

        <div className="flex flex-1 flex-col gap-3 p-5">
          {/* Top: name + delete */}
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-semibold text-dark">
                {project.name}
              </h3>
              {project.ngoName && (
                <p className="mt-0.5 truncate text-sm text-muted">
                  {project.ngoName}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(true);
              }}
              className="rounded-md p-1.5 text-muted opacity-0 transition-opacity hover:bg-red-50 hover:text-danger group-hover:opacity-100"
              aria-label="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Mini stage indicator */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => {
              const key = `stage${s}Complete` as keyof typeof project.stageStatus;
              const completed = project.stageStatus[key];
              const isCurrent = project.currentStage === s;
              return (
                <div
                  key={s}
                  className={`h-2 w-2 rounded-full ${
                    completed
                      ? STAGE_DOT_COLORS[s]
                      : isCurrent
                        ? `${STAGE_DOT_COLORS[s]} animate-pulse`
                        : "border border-slate-300 bg-white"
                  }`}
                />
              );
            })}
          </div>

          {/* Bottom: timestamp + SROI badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Updated {timeAgo(project.updatedAt)}
            </span>
            {project.sroi.calculatedRatio !== null && (
              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                SROI {project.sroi.calculatedRatio.toFixed(2)}x
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{project.name}&rdquo;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(project.id);
                setConfirmDelete(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
