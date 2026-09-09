import React from 'react';
import {
  X,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { AlignmentSettings, CalibrationSettings, CardSideData } from '../types';
import { calculateSlotCoordinates } from '../utils/printHelper';

interface PrintPreviewModalProps {
  isOpen: boolean;
  side: 'front' | 'back';
  frontData: CardSideData;
  backData: CardSideData;
  alignment: AlignmentSettings;
  calibration: CalibrationSettings;
  onClose: () => void;
  onConfirmPrint: () => void;
  onUpdateAlignment?: (updated: Partial<AlignmentSettings>) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  side,
  frontData,
  backData,
  alignment,
  calibration,
  onClose,
  onConfirmPrint,
  onUpdateAlignment,
}) => {
  if (!isOpen) return null;

  const { paperWidthMm, paperHeightMm, cardWidthMm, cardHeightMm } = alignment;
  const activeData = side === 'front' ? frontData : backData;
  const imageSrc = activeData.croppedImageUrl || activeData.sourceImageUrl;

  const slots = calculateSlotCoordinates(side, alignment, calibration);

  // Scaled view for preview dialog: fit sheet comfortably inside ~380px container height
  const scaleRatio = 380 / paperHeightMm;
  const previewW = paperWidthMm * scaleRatio;
  const previewH = paperHeightMm * scaleRatio;

  // Maximum allowed vertical Y position before card exceeds sheet boundary
  const maxYMm = Math.max(0, paperHeightMm - cardHeightMm);
  const currentY = alignment.originYMm;

  const handleUpdateY = (newY: number) => {
    const clamped = Math.max(0, Math.min(maxYMm, Math.round(newY * 10) / 10));
    if (onUpdateAlignment) {
      onUpdateAlignment({
        originYMm: clamped,
        topMarginMm: clamped,
        placementMode: 'top_center',
      });
    }
  };

  const handleNudgeY = (deltaMm: number) => {
    handleUpdateY(currentY + deltaMm);
  };

  const centerOfPageY = Math.round(((paperHeightMm - cardHeightMm) / 2) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Printer className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">
                  {side === 'front' ? 'Front Side Print Review' : 'Back Side Print Review'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {side} side
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Scale Ready</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Review &amp; adjust page position before printing on your Canon printer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close review"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto">
          {/* LEFT COLUMN: Simulated Paper Sheet with Card & Direct Up/Down Controls */}
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="w-full flex items-center justify-between text-slate-400 text-[11px] mb-2 px-1">
              <span className="font-semibold text-slate-300">
                A4 Sheet ({paperWidthMm} × {paperHeightMm}mm)
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                X: {slots[0]?.xMm.toFixed(1)}mm | Y: {slots[0]?.yMm.toFixed(1)}mm
              </span>
            </div>

            {/* Paper Container */}
            <div
              className="relative bg-white shadow-2xl border border-slate-300 rounded-xs overflow-hidden mx-auto transition-all"
              style={{
                width: `${previewW}px`,
                height: `${previewH}px`,
              }}
            >
              {/* Paper Grid Pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

              {/* Vertical Center Guide Line (Paper horizontal center) */}
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-emerald-400/50 pointer-events-none z-10"
                style={{ left: `${(paperWidthMm / 2) * scaleRatio}px` }}
              />

              {/* Dynamic Top Margin Indicator Line */}
              {slots[0] && (
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500 pointer-events-none z-10 transition-all duration-150"
                  style={{ top: `${slots[0].yMm * scaleRatio}px` }}
                >
                  <span className="absolute left-1 -top-4.5 bg-emerald-600 text-white font-mono font-bold text-[8px] px-1 py-0.2 rounded shadow-xs">
                    Y: {slots[0].yMm.toFixed(1)}mm
                  </span>
                </div>
              )}

              {/* Placed Cards */}
              {slots.map((slot) => (
                <div
                  key={slot.slotIndex}
                  className="absolute border-2 border-amber-500 bg-slate-50 overflow-hidden shadow-lg transition-all duration-150 rounded-xs"
                  style={{
                    left: `${slot.xMm * scaleRatio}px`,
                    top: `${slot.yMm * scaleRatio}px`,
                    width: `${slot.widthMm * scaleRatio}px`,
                    height: `${slot.heightMm * scaleRatio}px`,
                  }}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="Card Print Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[9px] font-mono text-slate-500 bg-slate-100">
                      <span className="font-bold uppercase text-slate-700">{side} Side</span>
                      <span>{cardWidthMm} × {cardHeightMm} mm</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Up / Down Nudge Bar Directly Below Simulated Paper */}
            <div className="mt-4 w-full bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Page Nudge</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  Top: {currentY.toFixed(1)} mm
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => handleNudgeY(-10)}
                  disabled={currentY <= 0}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition"
                  title="Move Up 10 mm"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeY(-2)}
                  disabled={currentY <= 0}
                  className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 text-emerald-300 border border-emerald-500/50 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                  title="Move Up 2 mm"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Up 2mm</span>
                </button>

                <div className="font-mono text-xs font-bold text-amber-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-700 min-w-[65px] text-center">
                  {currentY.toFixed(1)}mm
                </div>

                <button
                  type="button"
                  onClick={() => handleNudgeY(2)}
                  disabled={currentY >= maxYMm}
                  className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 text-emerald-300 border border-emerald-500/50 text-xs font-bold rounded-lg flex items-center gap-1 transition"
                  title="Move Down 2 mm"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Down 2mm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeY(10)}
                  disabled={currentY >= maxYMm}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition"
                  title="Move Down 10 mm"
                >
                  +10
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Full Up/Down Tuning Panel, Parameters & Canon Print Instructions */}
          <div className="md:col-span-7 space-y-4">
            {/* 1. UP & DOWN ON PAGE CONTROL BOX */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-50 to-emerald-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Card Up &amp; Down on Page (Vertical Position)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Move card higher or lower on the sheet before printing
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm font-black text-amber-600 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 inline-block">
                    Y = {currentY.toFixed(1)} mm
                  </span>
                </div>
              </div>

              {/* Dual Primary Up / Down Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNudgeY(-5)}
                  disabled={currentY <= 0}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <ArrowUp className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>MOVE UP (-5 mm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeY(5)}
                  disabled={currentY >= maxYMm}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <ArrowDown className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>MOVE DOWN (+5 mm)</span>
                </button>
              </div>

              {/* Slider for Smooth Up / Down adjustment */}
              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Top of Page (0 mm)</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Distance from top: {currentY.toFixed(1)} mm
                  </span>
                  <span>Bottom ({maxYMm.toFixed(0)} mm)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxYMm}
                  step={0.5}
                  value={currentY}
                  onChange={(e) => handleUpdateY(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Higher on sheet ↑</span>
                  <span>Drag slider to slide up or down</span>
                  <span>Lower on sheet ↓</span>
                </div>
              </div>

              {/* Quick Vertical Position Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                  <span>Quick Presets for Canon Printing:</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateY(10.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      currentY === 10
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    10mm (High)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateY(20.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      currentY === 20
                        ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    20mm (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateY(35.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      currentY === 35
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    35mm (Medium)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateY(centerOfPageY)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      Math.abs(currentY - centerOfPageY) < 1
                        ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Page Middle
                  </button>
                </div>
              </div>

              {/* Exact millimeter fine tuning */}
              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Fine 1mm Nudge:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudgeY(-1)}
                    disabled={currentY <= 0}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                  >
                    -1 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeY(1)}
                    disabled={currentY >= maxYMm}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                  >
                    +1 mm
                  </button>
                </div>
              </div>
            </div>

            {/* 2. PHYSICAL PRINT PARAMETERS */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Printing Side:</span>
                <span className="font-bold uppercase text-amber-700">{side} Side Only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card Dimensions:</span>
                <span className="font-bold text-slate-800">{cardWidthMm} × {cardHeightMm} mm (8:5 ratio)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Master Origin Coordinates:</span>
                <span className="font-bold text-slate-900">
                  X = {slots[0]?.xMm.toFixed(1)} mm (Centered) | Y = {slots[0]?.yMm.toFixed(1)} mm
                </span>
              </div>
              {calibration.offsetX !== 0 || calibration.offsetY !== 0 ? (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Hardware Calibration Applied:</span>
                  <span>ΔX: {calibration.offsetX}mm, ΔY: {calibration.offsetY}mm</span>
                </div>
              ) : null}
            </div>

            {/* 3. CANON PRINTER DRIVER INSTRUCTIONS */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mandatory Canon Print Dialog Settings:</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-amber-900 space-y-0.5">
                <li>Scale: <strong>Actual Size (100%)</strong> — Never select "Fit to Page"</li>
                <li>Margins: <strong>None / Zero</strong></li>
                <li>Both FRONT and BACK will print at this exact adjusted Y height</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-medium">Selected Top Position:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
              Y = {currentY.toFixed(1)} mm
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onConfirmPrint();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black rounded-xl text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>CONFIRM &amp; PRINT {side.toUpperCase()} (100% SCALE)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
