import { useState } from "react";
import { Database, Clock3, Layers, Plug } from "lucide-react";

import ConnectionsPage from "./pages/ConnectionsPage";
import InventoryPage from "./pages/InventoryPage";
import ArchiveRulePage from "./pages/ArchiveRulePage";
import JobsPage from "./pages/JobsPage";

type PageKey = "connections" | "inventory" | "archive-rule" | "jobs";

const NAV_ITEMS: { key: PageKey; label: string; icon: any }[] = [
  { key: "connections", label: "Connections", icon: Plug },
  { key: "inventory", label: "Inventory", icon: Database },
  { key: "archive-rule", label: "Archive Rule", icon: Layers },
  { key: "jobs", label: "Jobs", icon: Clock3 },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("connections");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 border-r border-slate-200 bg-white p-4">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Control Plane</h1>
          <p className="mt-1 text-xs text-slate-500">Data Lifecycle Management</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 space-y-6 p-6">
        {currentPage === "connections" && <ConnectionsPage />}
        {currentPage === "inventory" && <InventoryPage />}
        {currentPage === "archive-rule" && <ArchiveRulePage />}
        {currentPage === "jobs" && <JobsPage />}
      </main>
    </div>
  );
}