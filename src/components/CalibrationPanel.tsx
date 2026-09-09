import React from 'react';
import { ShieldCheck, Printer, RotateCcw, Ruler, Target, CheckCircle, HelpCircle } from 'lucide-react';
import { CalibrationSettings, AlignmentSettings } from '../types';

interface CalibrationPanelProps {
  calibration: CalibrationSettings;
  alignment: AlignmentSettings;
  onUpdateCalibration: (newCalibration: Partial<CalibrationSettings>) => void;
  onPrintCalibrationSheet: () => void;
}

export const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
  calibration,
  alignment,
  onUpdateCalibration,
  onPrintCalibrationSheet,
}) => {
  const { offsetX, offsetY, scaleCorrectionPct } = calibration;

  const handleReset = () => {
    onUpdateCalibration({
      offsetX: 0.0,
      offsetY: 0.0,
      scaleCorrectionPct: 100.0,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title & Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Canon Hardware Calibration &amp; Offset Correction
            </h2>
            <p className="text-xs text-slate-500">
              Print a precision millimeter test sheet, measure with a physical ruler, and correct printer hardware feed drift.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Offsets</span>
          </button>

          <button
            type="button"
            onClick={onPrintCalibrationSheet}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT CALIBRATION SHEET</span>
          </button>
        </div>
      </div>

      {/* 3 Step Instruction Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">1</span>
            <span>Print Test Pattern</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Click &quot;PRINT CALIBRATION SHEET&quot; and use ordinary paper in your Canon printer.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">2</span>
            <span>Physically Measure with Ruler</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Verify the 10×10 mm reference square, 50 mm line, and 80 mm card width line.
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">3</span>
            <span>Apply Millimeter Offsets</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Adjust the sliders below. Offsets apply identically to BOTH Front and Back prints automatically!
          </p>
        </div>
      </div>

      {/* Calibration Controls & Live Target Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Horizontal Offset (X) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-600" />
                <span>Horizontal Offset (X-Axis)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="-20"
                  max="20"
                  value={offsetX}
                  onChange={(e) => onUpdateCalibration({ offsetX: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 text-right font-mono text-xs font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-xs font-semibold text-slate-500">mm</span>
              </div>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.1"
              value={offsetX}
              onChange={(e) => onUpdateCalibration({ offsetX: parseFloat(e.target.value) })}
              className="w-full accent-amber-600 h-2 bg-slate-200 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-20 mm (Shift Left)</span>
              <span className="font-bold text-slate-700">0 mm (Center)</span>
              <span>+20 mm (Shift Right)</span>
            </div>
          </div>

          {/* Vertical Offset (Y) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-600" />
                <span>Vertical Offset (Y-Axis)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="-20"
                  max="20"
                  value={offsetY}
                  onChange={(e) => onUpdateCalibration({ offsetY: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 text-right font-mono text-xs font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-500">mm</span>
              </div>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.1"
              value={offsetY}
              onChange={(e) => onUpdateCalibration({ offsetY: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-20 mm (Shift Up)</span>
              <span className="font-bold text-slate-700">0 mm (Center)</span>
              <span>+20 mm (Shift Down)</span>
            </div>
          </div>

          {/* Scale Correction Pct */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Hardware Scale Correction (±5%)</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="95"
                  max="105"
                  value={scaleCorrectionPct}
                  onChange={(e) => onUpdateCalibration({ scaleCorrectionPct: parseFloat(e.target.value) || 100 })}
                  className="w-20 px-2 py-1 text-right font-mono text-xs font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-500">%</span>
              </div>
            </div>
            <input
              type="range"
              min="95"
              max="105"
              step="0.1"
              value={scaleCorrectionPct}
              onChange={(e) => onUpdateCalibration({ scaleCorrectionPct: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>95.0% (Shrink)</span>
              <span className="font-bold text-slate-700">100.0% (Exact Standard)</span>
              <span>105.0% (Expand)</span>
            </div>
          </div>
        </div>

        {/* Live Calibration Simulated Target Visualizer */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900 rounded-xl border border-slate-800 text-white relative">
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300">Simulated Print Bed Crosshair</span>
            <span className="font-mono text-[11px] text-amber-400">
              ΔX: {offsetX > 0 ? `+${offsetX}` : offsetX} mm | ΔY: {offsetY > 0 ? `+${offsetY}` : offsetY} mm
            </span>
          </div>

          <div className="w-56 h-56 relative bg-slate-950 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
            {/* Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

            {/* Zero Base Crosshairs (Gray) */}
            <div className="absolute w-full h-[1px] bg-slate-600 top-1/2" />
            <div className="absolute h-full w-[1px] bg-slate-600 left-1/2" />
            <div className="absolute w-12 h-12 rounded-full border border-slate-700 pointer-events-none" />

            {/* Calibrated Target (Color shifted) */}
            <div
              className="absolute w-16 h-10 border-2 border-amber-400 rounded bg-amber-500/20 flex flex-col items-center justify-center shadow-lg transition-transform duration-100"
              style={{
                transform: `translate(${offsetX * 2.5}px, ${offsetY * 2.5}px) scale(${scaleCorrectionPct / 100})`,
              }}
            >
              <div className="w-full h-0.5 bg-red-500 absolute" />
              <div className="h-full w-0.5 bg-red-500 absolute" />
              <span className="text-[8px] font-mono font-bold text-white bg-slate-950/80 px-1 rounded z-10">
                80×50mm
              </span>
            </div>
          </div>

          <div className="mt-4 text-center text-slate-400 text-[11px] space-y-1">
            <p className="flex items-center justify-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Applied to master coordinate engine</span>
            </p>
            <p className="text-slate-500">
              Settings persist automatically in local storage for subsequent prints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
