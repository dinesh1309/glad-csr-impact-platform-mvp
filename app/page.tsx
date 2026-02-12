"use client";

import { useStore } from "@/lib/store";
import { ProjectDashboard } from "@/components/dashboard/ProjectDashboard";
import { AppShell } from "@/components/shell/AppShell";

export default function Home() {
  const view = useStore((s) => s.view);
  const activeProjectId = useStore((s) => s.activeProjectId);

  if (view === "project" && activeProjectId) {
    return <AppShell />;
  }

  return <ProjectDashboard />;
}
