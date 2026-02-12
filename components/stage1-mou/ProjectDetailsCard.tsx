"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, X, MapPin, Calendar, Clock, Banknote, Building2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectDetails } from "@/lib/types";

interface ProjectDetailsCardProps {
  details: ProjectDetails;
  isLocked: boolean;
  onUpdate: (details: ProjectDetails) => void;
}

const fields: {
  key: keyof ProjectDetails;
  label: string;
  icon: React.ElementType;
  type: "text" | "date" | "number";
  placeholder: string;
  format?: (v: string | number | null) => string;
}[] = [
  { key: "projectName", label: "Project Name", icon: FolderOpen, type: "text", placeholder: "e.g., Rural Education Program" },
  { key: "ngoName", label: "NGO / Partner", icon: Building2, type: "text", placeholder: "e.g., Education Foundation" },
  { key: "location", label: "Location", icon: MapPin, type: "text", placeholder: "e.g., Maharashtra, India" },
  { key: "duration", label: "Duration", icon: Clock, type: "text", placeholder: "e.g., 12 months" },
  { key: "startDate", label: "Start Date", icon: Calendar, type: "date", placeholder: "YYYY-MM-DD" },
  {
    key: "totalBudget",
    label: "Total Budget",
    icon: Banknote,
    type: "number",
    placeholder: "e.g., 5000000",
    format: (v) => (v !== null && v !== "" ? `₹${Number(v).toLocaleString("en-IN")}` : "—"),
  },
];

export function ProjectDetailsCard({ details, isLocked, onUpdate }: ProjectDetailsCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProjectDetails>(details);

  const startEdit = () => {
    setDraft(details);
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(details);
    setEditing(false);
  };

  const saveEdit = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const updateField = (key: keyof ProjectDetails, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: key === "totalBudget" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  return (
    <div className="rounded-xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h3 className="font-heading text-sm font-semibold text-dark">
          Project Details
        </h3>
        {!isLocked && !editing && (
          <Button variant="ghost" size="icon-xs" onClick={startEdit}>
            <Pencil className="h-3.5 w-3.5 text-muted" />
          </Button>
        )}
        {editing && (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-xs" onClick={cancelEdit}>
              <X className="h-3.5 w-3.5 text-muted" />
            </Button>
            <Button variant="ghost" size="icon-xs" onClick={saveEdit}>
              <Check className="h-3.5 w-3.5 text-success" />
            </Button>
          </div>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => {
          const Icon = field.icon;
          const rawValue = details[field.key];
          const displayValue = field.format
            ? field.format(rawValue)
            : rawValue || "—";

          return (
            <motion.div
              key={field.key}
              layout
              className="flex items-start gap-3 bg-white px-5 py-3.5"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" strokeWidth={1.5} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted">{field.label}</p>
                {editing ? (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={
                      field.key === "totalBudget"
                        ? draft.totalBudget ?? ""
                        : (draft[field.key] as string)
                    }
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 h-7 border-border px-2 text-sm"
                  />
                ) : (
                  <p className="mt-0.5 truncate text-sm font-medium text-dark">
                    {displayValue}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
