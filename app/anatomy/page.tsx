"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnatomyViewer3D } from "@/components/AnatomyViewer3D";

interface Part {
  id: string;
  name: string;
  basic: string;
  advanced: string;
}

interface OrganEntry {
  id: string;
  name: string;
  basic: string;
  advanced: string;
  subOrgans: Part[];
  tissues: Part[];
  cells: Part[];
}

type Level = "basic" | "advanced";
type ViewMode = "zygote" | "organs";

export default function AnatomyPage() {
  const [items, setItems] = useState<OrganEntry[]>([]);
  const [selected, setSelected] = useState<OrganEntry | null>(null);
  const [level, setLevel] = useState<Level>("basic");
  const [openSection, setOpenSection] = useState<"subOrgans" | "tissues" | "cells" | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("organs");

  useEffect(() => {
    fetch("/api/anatomy")
      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const displayText = (part: Part) => (level === "basic" ? part.basic : part.advanced);
  const searchLower = search.trim().toLowerCase();
  const filteredItems = searchLower
    ? items.filter((i) => i.name.toLowerCase().includes(searchLower))
    : items;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-medical-dark mb-2">
        3D Anatomy – Body & Organs
      </h1>
      <p className="text-slate-600 mb-4 text-sm sm:text-base">
        Select an organ to view its 3D diagram and study material (basic to advanced). Or use the full-body viewer below (free, no subscription).
      </p>

      {/* View mode: Full body (Zygote) vs Organ by organ */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setViewMode("organs")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            viewMode === "organs"
              ? "bg-medical-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Organ by organ (study + our 3D)
        </button>
        <button
          type="button"
          onClick={() => setViewMode("zygote")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            viewMode === "zygote"
              ? "bg-medical-primary text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Full body (Zygote Body)
        </button>
      </div>

      {viewMode === "zygote" && (
        <div className="mb-6 space-y-2">
          <p className="text-slate-600 text-sm">
            Interactive 3D human anatomy atlas — rotate, zoom, explore. Free to use (embedded from Zygote Body).
          </p>
          <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900" style={{ minHeight: "60vh" }}>
            <iframe
              src="https://www.zygotebody.com/"
              title="Zygote Body 3D Anatomy"
              width="100%"
              height="600"
              className="min-h-[500px] sm:min-h-[600px]"
              style={{ border: "none" }}
              allow="fullscreen"
            />
          </div>
          <p className="text-xs text-slate-500">
            Use the toolbar in the viewer to toggle layers and explore. Switch to &quot;Organ by organ&quot; above to see study notes and our 3D shapes per organ.
          </p>
        </div>
      )}

      {viewMode === "organs" && (
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="font-semibold text-slate-800">Organs</h2>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organs..."
              className="flex-1 sm:max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-medical-primary"
            />
          </div>
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(item);
                    setLevel("basic");
                    setOpenSection(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    selected?.id === item.id
                      ? "border-medical-primary bg-teal-50 text-medical-dark shadow-sm"
                      : "border-slate-200 hover:border-medical-primary hover:bg-slate-50"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
          {items.length === 0 && <p className="text-slate-500">Loading…</p>}
          {items.length > 0 && filteredItems.length === 0 && (
            <p className="text-slate-500">No organ matches your search.</p>
          )}
        </div>

        <div className="space-y-4">
          {selected ? (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-medical-dark mb-3">
                  {selected.name}
                </h2>
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setLevel("basic")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      level === "basic"
                        ? "bg-medical-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Basic
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevel("advanced")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      level === "advanced"
                        ? "bg-medical-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Advanced
                  </button>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap text-sm sm:text-base">
                  {level === "basic" ? selected.basic : selected.advanced}
                </p>

                {/* Sub-organs */}
                {selected.subOrgans.length > 0 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setOpenSection(openSection === "subOrgans" ? null : "subOrgans")}
                      className="font-medium text-medical-dark text-sm"
                    >
                      {openSection === "subOrgans" ? "▼" : "▶"} Sub-organs
                    </button>
                    {openSection === "subOrgans" && (
                      <ul className="mt-2 space-y-2 pl-4 border-l-2 border-medical-primary/30">
                        {selected.subOrgans.map((p) => (
                          <li key={p.id}>
                            <span className="font-medium text-slate-800">{p.name}:</span>{" "}
                            <span className="text-slate-700 text-sm">{displayText(p)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Tissues */}
                {selected.tissues.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setOpenSection(openSection === "tissues" ? null : "tissues")}
                      className="font-medium text-medical-dark text-sm"
                    >
                      {openSection === "tissues" ? "▼" : "▶"} Tissues
                    </button>
                    {openSection === "tissues" && (
                      <ul className="mt-2 space-y-2 pl-4 border-l-2 border-medical-primary/30">
                        {selected.tissues.map((p) => (
                          <li key={p.id}>
                            <span className="font-medium text-slate-800">{p.name}:</span>{" "}
                            <span className="text-slate-700 text-sm">{displayText(p)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Cells */}
                {selected.cells.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setOpenSection(openSection === "cells" ? null : "cells")}
                      className="font-medium text-medical-dark text-sm"
                    >
                      {openSection === "cells" ? "▼" : "▶"} Cells
                    </button>
                    {openSection === "cells" && (
                      <ul className="mt-2 space-y-2 pl-4 border-l-2 border-medical-primary/30">
                        {selected.cells.map((p) => (
                          <li key={p.id}>
                            <span className="font-medium text-slate-800">{p.name}:</span>{" "}
                            <span className="text-slate-700 text-sm">{displayText(p)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-sm font-medium text-slate-700">3D diagram</p>
                <Link
                  href={`/quiz?topic=${encodeURIComponent(selected.name + " anatomy")}`}
                  className="text-sm text-medical-primary font-medium hover:underline"
                >
                  Quiz yourself on this organ →
                </Link>
              </div>
              <div>
                <AnatomyViewer3D organId={selected.id} />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[240px] flex items-center justify-center">
              <p className="text-slate-500 text-center text-lg">Select an organ</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
