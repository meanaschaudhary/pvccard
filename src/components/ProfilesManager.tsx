import React, { useState } from 'react';
import {
  FolderKanban,
  Save,
  Trash2,
  Download,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Printer,
  Copy,
} from 'lucide-react';
import { PrinterProfile, AlignmentSettings, CalibrationSettings } from '../types';
import { exportProfilesToJson } from '../utils/storage';
import { DEFAULT_PROFILES } from '../constants/presets';

interface ProfilesManagerProps {
  profiles: PrinterProfile[];
  activeProfileId: string;
  currentAlignment: AlignmentSettings;
  currentCalibration: CalibrationSettings;
  onSelectProfile: (id: string) => void;
  onSaveProfile: (profile: PrinterProfile) => void;
  onDeleteProfile: (id: string) => void;
  onRestoreDefaults: () => void;
  onImportProfiles: (profiles: PrinterProfile[]) => void;
}

export const ProfilesManager: React.FC<ProfilesManagerProps> = ({
  profiles,
  activeProfileId,
  currentAlignment,
  currentCalibration,
  onSelectProfile,
  onSaveProfile,
  onDeleteProfile,
  onRestoreDefaults,
  onImportProfiles,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    const newProfile: PrinterProfile = {
      id: `profile_${Date.now()}`,
      name: profileName.trim(),
      description: profileDesc.trim() || 'Custom Canon print profile',
      alignment: { ...currentAlignment },
      calibration: { ...currentCalibration },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveProfile(newProfile);
    setProfileName('');
    setProfileDesc('');
    setIsCreatingNew(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportProfiles(parsed);
        }
      } catch (err) {
        console.error('Failed to parse profile JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
            <FolderKanban className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Canon Printer Profiles &amp; Backup
            </h2>
            <p className="text-xs text-slate-500">
              Save custom paper coordinates, PVC tray configurations, and calibration offsets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportProfilesToJson(profiles)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            title="Export profiles to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Current as New Profile</span>
          </button>
        </div>
      </div>

      {/* New Profile Creation Form */}
      {isCreatingNew && (
        <form
          onSubmit={handleCreateProfile}
          className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-3 animate-fade-in text-xs"
        >
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Save className="w-4 h-4 text-amber-600" />
            <span>Save Current Settings as New Profile</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Profile Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Canon TS707 PVC Tray"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. For PVC card printing on rear tray"
                value={profileDesc}
                onChange={(e) => setProfileDesc(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1.5 font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          return (
            <div
              key={p.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-amber-500 bg-amber-50/20 shadow-md ring-1 ring-amber-500'
                  : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>{p.name}</span>
                  </h4>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow-sm">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{p.description}</p>

                <div className="space-y-1 text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Paper:</span>
                    <span className="font-semibold">{p.alignment.paperWidthMm} × {p.alignment.paperHeightMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Origin:</span>
                    <span className="font-semibold">X:{p.alignment.originXMm}mm Y:{p.alignment.originYMm}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Card Size:</span>
                    <span className="font-semibold">{p.alignment.cardWidthMm} × {p.alignment.cardHeightMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calibration:</span>
                    <span>ΔX:{p.calibration.offsetX} ΔY:{p.calibration.offsetY} mm</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                {!isActive ? (
                  <button
                    type="button"
                    onClick={() => onSelectProfile(p.id)}
                    className="px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-100 rounded-md transition"
                  >
                    Load Profile
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Currently Active</span>
                  </span>
                )}

                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteProfile(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                    title="Delete profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Restore defaults */}
      <div className="pt-2 border-t border-slate-200 flex justify-end">
        <button
          type="button"
          onClick={onRestoreDefaults}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Factory Canon Default Profiles</span>
        </button>
      </div>
    </div>
  );
};
