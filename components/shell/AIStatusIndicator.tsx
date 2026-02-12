"use client";

import { useEffect, useState } from "react";

type AIStatus = "cloud" | "local" | "offline" | "checking";

export function AIStatusIndicator() {
  const [status, setStatus] = useState<AIStatus>("checking");

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!mounted) return;
        if (data.activeProvider === "claude") setStatus("cloud");
        else if (data.activeProvider === "ollama") setStatus("local");
        else setStatus("offline");
      } catch {
        if (mounted) setStatus("offline");
      }
    }

    check();
    const interval = setInterval(check, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const config = {
    checking: { color: "bg-muted animate-pulse", label: "AI: ..." },
    cloud: { color: "bg-success", label: "AI: Cloud" },
    local: { color: "bg-info", label: "AI: Local" },
    offline: { color: "bg-danger", label: "AI: Offline" },
  }[status];

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </div>
  );
}
