import React from 'react';
import { Printer, Sliders, ShieldCheck, Compass, FolderKanban, HelpCircle, FileCheck2, Sparkles } from 'lucide-react';
import { ActiveTab, PrinterProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profiles: PrinterProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onLoadSampleCards: () => void;
  onOpenCanonGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profiles,
  activeProfileId,
  onSelectProfile,
  onLoadSampleCards,
  onOpenCanonGuide,
}) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'workflow', label: '1. Print Workflow', icon: <Printer className="w-4 h-4" /> },
    { id: 'editor', label: '2. Crop & Edit', icon: <Sliders className="w-4 h-4" /> },
    { id: 'alignment', label: '3. Alignment & Layout', icon: <Compass className="w-4 h-4" /> },
    { id: 'calibration', label: '4. Calibration Test', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'profiles', label: '5. Profiles', icon: <FolderKanban className="w-4 h-4" /> },
  ];

  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-inner border border-amber-400/30">
            <Printer className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Aazmi PVC Card Printer
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Canon Precision v2.6
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manual Double-Sided PVC &amp; Smart Card Alignment System
            </p>
          </div>
        </div>

        {/* Profile Selector & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Active Profile Pill */}
          <div className="flex items-center bg-slate-800/90 rounded-md border border-slate-700 px-2.5 py-1.5 gap-2">
            <span className="text-slate-400">Profile:</span>
            <select
              value={activeProfileId}
              onChange={(e) => onSelectProfile(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-800 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Load Sample Specimen */}
          <button
            onClick={onLoadSampleCards}
            title="Load sample front & back ID card for immediate alignment test"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo Cards</span>
          </button>

          {/* Canon Setup Guide Button */}
          <button
            onClick={onOpenCanonGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 font-medium transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Canon Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 pr-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Exact 80 × 50 mm Physical Scale Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};
