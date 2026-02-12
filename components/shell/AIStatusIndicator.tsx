"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

type AIStatus = "cloud" | "local" | "offline" | "checking";
type ProviderChoice = "auto" | "claude" | "ollama";

// Global state so MoUUpload (and future components) can read the selected provider
let _selectedProvider: ProviderChoice = "auto";
let _listeners: (() => void)[] = [];

export function getSelectedProvider(): ProviderChoice {
  return _selectedProvider;
}

export function onProviderChange(fn: () => void) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((l) => l !== fn);
  };
}

function setSelectedProvider(p: ProviderChoice) {
  _selectedProvider = p;
  _listeners.forEach((fn) => fn());
}

interface HealthData {
  claude: { available: boolean };
  ollama: { available: boolean; model: string };
  activeProvider: string;
}

export function AIStatusIndicator() {
  const [status, setStatus] = useState<AIStatus>("checking");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [selected, setSelected] = useState<ProviderChoice>("auto");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error();
        const data: HealthData = await res.json();
        if (!mounted) return;
        setHealth(data);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (choice: ProviderChoice) => {
    setSelected(choice);
    setSelectedProvider(choice);
    setOpen(false);
  };

  const statusConfig = {
    checking: { color: "bg-muted animate-pulse", label: "AI: ..." },
    cloud: { color: "bg-success", label: "AI: Cloud" },
    local: { color: "bg-info", label: "AI: Local" },
    offline: { color: "bg-danger", label: "AI: Offline" },
  }[status];

  const effectiveLabel =
    selected === "auto"
      ? statusConfig.label
      : selected === "claude"
        ? "AI: Claude"
        : "AI: Ollama";

  const effectiveDot =
    selected === "auto"
      ? statusConfig.color
      : selected === "claude"
        ? health?.claude.available
          ? "bg-success"
          : "bg-danger"
        : health?.ollama.available
          ? "bg-info"
          : "bg-danger";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      >
        <span className={`h-2 w-2 rounded-full ${effectiveDot}`} />
        {effectiveLabel}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-white py-1 shadow-lg">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
            AI Provider
          </div>
          {/* Auto */}
          <button
            onClick={() => handleSelect("auto")}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-light-gray ${selected === "auto" ? "bg-light-gray font-medium" : ""}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
            <span className="text-dark">Auto</span>
            <span className="ml-auto text-muted">
              {status === "cloud" ? "→ Claude" : status === "local" ? "→ Ollama" : "→ None"}
            </span>
          </button>
          {/* Claude */}
          <button
            onClick={() => handleSelect("claude")}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-light-gray ${selected === "claude" ? "bg-light-gray font-medium" : ""}`}
          >
            <span className={`h-2 w-2 rounded-full ${health?.claude.available ? "bg-success" : "bg-danger"}`} />
            <span className="text-dark">Claude</span>
            <span className="ml-auto text-muted">
              {health?.claude.available ? "Online" : "Offline"}
            </span>
          </button>
          {/* Ollama */}
          <button
            onClick={() => handleSelect("ollama")}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-light-gray ${selected === "ollama" ? "bg-light-gray font-medium" : ""}`}
          >
            <span className={`h-2 w-2 rounded-full ${health?.ollama.available ? "bg-info" : "bg-danger"}`} />
            <span className="text-dark">Ollama</span>
            <span className="ml-auto text-muted">
              {health?.ollama.available ? health.ollama.model : "Offline"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
