import React from 'react';
import {
  X,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  AlignCenter,
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

  // Maximum allowed positions on A4 before card exceeds sheet boundary
  const maxYMm = Math.max(0, paperHeightMm - cardHeightMm);
  const maxXMm = Math.max(0, paperWidthMm - cardWidthMm);
  const centerOfA4X = Math.round(((paperWidthMm - cardWidthMm) / 2) * 10) / 10;
  const centerOfA4Y = Math.round(((paperHeightMm - cardHeightMm) / 2) * 10) / 10;

  const currentY = typeof alignment.originYMm === 'number' && !isNaN(alignment.originYMm) ? alignment.originYMm : 20.0;
  const currentX = typeof alignment.originXMm === 'number' && !isNaN(alignment.originXMm) ? alignment.originXMm : centerOfA4X;

  const isCenteredX = Math.abs(currentX - centerOfA4X) < 0.2;

  const handleUpdateY = (newY: number) => {
    const clamped = Math.max(0, Math.min(maxYMm, Math.round(newY * 10) / 10));
    if (onUpdateAlignment) {
      onUpdateAlignment({
        originYMm: clamped,
        topMarginMm: clamped,
        placementMode: 'custom',
      });
    }
  };

  const handleNudgeY = (deltaMm: number) => {
    handleUpdateY(currentY + deltaMm);
  };

  const handleUpdateX = (newX: number) => {
    const clamped = Math.max(0, Math.min(maxXMm, Math.round(newX * 10) / 10));
    if (onUpdateAlignment) {
      onUpdateAlignment({
        originXMm: clamped,
        placementMode: 'custom',
      });
    }
  };

  const handleNudgeX = (deltaMm: number) => {
    handleUpdateX(currentX + deltaMm);
  };

  const handleCenterA4X = () => {
    handleUpdateX(centerOfA4X);
  };

  const handleSetCardSize = (w: number, h: number) => {
    if (onUpdateAlignment) {
      const newOriginX = Math.round(((paperWidthMm - w) / 2) * 10) / 10;
      onUpdateAlignment({
        cardWidthMm: w,
        cardHeightMm: h,
        originXMm: newOriginX,
      });
    }
  };

  const isActualPvcStandard = Math.abs(cardWidthMm - 85.6) < 0.2 && Math.abs(cardHeightMm - 54.0) < 0.2;
  const isCompactDieCut = Math.abs(cardWidthMm - 80.0) < 0.2 && Math.abs(cardHeightMm - 50.0) < 0.2;

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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold">
                  {side === 'front' ? 'Front Side Print Review' : 'Back Side Print Review'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {side} side
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Fixed A4 Sheet (210 × 297 mm)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>100% Scale Ready</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Printed on fixed A4 sheet with actual PVC card dimensions. Adjust vertical page position below.
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
          {/* LEFT COLUMN: Simulated A4 Paper Sheet with Card & Direct Up/Down Controls */}
          <div className="md:col-span-5 flex flex-col items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="w-full flex items-center justify-between text-slate-400 text-[11px] mb-2 px-1">
              <span className="font-semibold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                A4 Page ({paperWidthMm} × {paperHeightMm}mm)
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className={`font-bold ${isCenteredX ? 'text-blue-400' : 'text-amber-400'}`}>
                  X: {currentX.toFixed(1)}mm {isCenteredX ? '(Center)' : ''}
                </span>
                <span className="text-emerald-400 font-bold">
                  Y: {currentY.toFixed(1)}mm
                </span>
              </div>
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

              {/* Center Guides */}
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-slate-400/40 pointer-events-none z-10"
                style={{ left: `${(paperWidthMm / 2) * scaleRatio}px` }}
                title="A4 Horizontal Centerline (105mm)"
              />
              <div
                className="absolute left-0 right-0 border-t border-dashed border-slate-400/40 pointer-events-none z-10"
                style={{ top: `${(paperHeightMm / 2) * scaleRatio}px` }}
                title="A4 Vertical Centerline (148.5mm)"
              />

              {/* Dynamic Left Margin Indicator Line on A4 (X) */}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-500 pointer-events-none z-20 transition-all duration-150"
                style={{ left: `${currentX * scaleRatio}px` }}
              >
                <span className="absolute -left-1 bottom-1 bg-blue-600 text-white font-mono font-bold text-[8px] px-1 py-0.5 rounded shadow-xs whitespace-nowrap">
                  X: {currentX.toFixed(1)}mm
                </span>
              </div>

              {/* Dynamic Top Margin Indicator Line on A4 (Y) */}
              <div
                className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500 pointer-events-none z-20 transition-all duration-150"
                style={{ top: `${currentY * scaleRatio}px` }}
              >
                <span className="absolute left-1 -top-4.5 bg-emerald-600 text-white font-mono font-bold text-[8px] px-1 py-0.2 rounded shadow-xs">
                  Y: {currentY.toFixed(1)}mm (A4 top)
                </span>
              </div>

              {/* Placed Cards */}
              {slots.map((slot) => (
                <div
                  key={slot.slotIndex}
                  className="absolute border-2 border-amber-500 bg-slate-50 overflow-hidden shadow-lg transition-all duration-150 rounded-xs z-15"
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

            {/* Quick 2-Way (X & Y) Nudge Bar Directly Below Simulated Paper */}
            <div className="mt-4 w-full bg-slate-900/95 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
              {/* Horizontal Nudge Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-blue-400">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Left / Right (X):</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCenterA4X}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition flex items-center gap-1 ${
                      isCenteredX
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-blue-400 hover:bg-slate-700 border border-slate-700'
                    }`}
                    title="Center card horizontally on A4"
                  >
                    <AlignCenter className="w-3 h-3" />
                    <span>Center</span>
                  </button>
                  <span className="font-mono text-xs font-bold text-blue-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {currentX.toFixed(1)}mm
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => handleNudgeX(-10)}
                  disabled={currentX <= 0}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition"
                  title="Move Left 10 mm"
                >
                  -10
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeX(-2)}
                  disabled={currentX <= 0}
                  className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 disabled:opacity-40 text-blue-300 border border-blue-500/50 text-xs font-bold rounded-lg flex items-center gap-0.5 transition"
                  title="Move Left 2 mm"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Left 2mm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeX(2)}
                  disabled={currentX >= maxXMm}
                  className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 disabled:opacity-40 text-blue-300 border border-blue-500/50 text-xs font-bold rounded-lg flex items-center gap-0.5 transition"
                  title="Move Right 2 mm"
                >
                  <span>Right 2mm</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeX(10)}
                  disabled={currentX >= maxXMm}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-mono font-bold rounded-lg border border-slate-700 transition"
                  title="Move Right 10 mm"
                >
                  +10
                </button>
              </div>

              {/* Vertical Nudge Row */}
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Up / Down (Y):</span>
                </span>
                <span className="font-mono text-xs font-bold text-emerald-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {currentY.toFixed(1)}mm
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
                  className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 text-emerald-300 border border-emerald-500/50 text-xs font-bold rounded-lg flex items-center gap-0.5 transition"
                  title="Move Up 2 mm"
                >
                  <ArrowUp className="w-3 h-3" />
                  <span>Up 2mm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeY(2)}
                  disabled={currentY >= maxYMm}
                  className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 disabled:opacity-40 text-emerald-300 border border-emerald-500/50 text-xs font-bold rounded-lg flex items-center gap-0.5 transition"
                  title="Move Down 2 mm"
                >
                  <span>Down 2mm</span>
                  <ArrowDown className="w-3 h-3" />
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
            {/* 1. ACTUAL PVC CARD SIZE SELECTOR BOX */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Physical PVC Card Dimensions</span>
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {cardWidthMm.toFixed(1)} × {cardHeightMm.toFixed(1)} mm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSetCardSize(85.6, 54.0)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isActualPvcStandard
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Actual PVC Card (CR-80)</span>
                    {isActualPvcStandard && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Active Standard
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    85.6 × 54.0 mm (Standard ATM, Smart Card, Aadhaar, PAN)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetCardSize(80.0, 50.0)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isCompactDieCut
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Compact Die-Cut</span>
                    {isCompactDieCut && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    80.0 × 50.0 mm (Small Die-Cutter Dies)
                  </p>
                </button>
              </div>
            </div>

            {/* 2. LEFT & RIGHT ON A4 PAGE CONTROL BOX */}
            <div className="bg-gradient-to-br from-blue-500/10 via-slate-50 to-indigo-500/10 border-2 border-blue-500/40 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Left &amp; Right on A4 Page (Horizontal Position)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      A4 Width: 210 mm • Centered: {centerOfA4X.toFixed(1)} mm • Range: 0 mm to {maxXMm.toFixed(1)} mm
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCenterA4X}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                      isCenteredX
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
                    }`}
                    title="Center card horizontally on A4 sheet"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>{isCenteredX ? 'Centered on A4' : 'Center on A4'}</span>
                  </button>
                  <span className="font-mono text-sm font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-300 inline-block">
                    X = {currentX.toFixed(1)} mm
                  </span>
                </div>
              </div>

              {/* Dual Primary Left / Right Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNudgeX(-5)}
                  disabled={currentX <= 0}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <ArrowLeft className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                  <span>MOVE LEFT (-5 mm)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeX(5)}
                  disabled={currentX >= maxXMm}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition"
                >
                  <span>MOVE RIGHT (+5 mm)</span>
                  <ArrowRight className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                </button>
              </div>

              {/* Slider for Smooth Left / Right adjustment across A4 */}
              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Left Edge (0 mm)</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Distance from left of A4: {currentX.toFixed(1)} mm {isCenteredX ? '• (Exact Center)' : ''}
                  </span>
                  <span>Right Edge ({maxXMm.toFixed(0)} mm)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={maxXMm}
                  step={0.5}
                  value={currentX}
                  onChange={(e) => handleUpdateX(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>← Move further left</span>
                  <span>Drag slider or nudge right to fix left-shift</span>
                  <span>Move further right →</span>
                </div>
              </div>

              {/* Quick Horizontal Presets & Printer Feed Compensation */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                  <span>Quick Presets &amp; Feed Offset Fix:</span>
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={handleCenterA4X}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      isCenteredX
                        ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Center ({centerOfA4X.toFixed(1)}mm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateX(centerOfA4X + 2.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      Math.abs(currentX - (centerOfA4X + 2.0)) < 0.2
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Nudge 2mm right to fix printer feed pulling left"
                  >
                    +2mm Right (Fix)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateX(centerOfA4X + 4.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      Math.abs(currentX - (centerOfA4X + 4.0)) < 0.2
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Nudge 4mm right to fix printer feed pulling left"
                  >
                    +4mm Right (Fix)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateX(centerOfA4X + 6.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      Math.abs(currentX - (centerOfA4X + 6.0)) < 0.2
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Nudge 6mm right"
                  >
                    +6mm Right
                  </button>
                </div>
              </div>

              {/* Exact millimeter fine tuning */}
              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Fine 1mm / 10mm Steps:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudgeX(-10)}
                    disabled={currentX <= 0}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Left 10mm"
                  >
                    -10 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeX(-1)}
                    disabled={currentX <= 0}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Left 1mm"
                  >
                    -1 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeX(1)}
                    disabled={currentX >= maxXMm}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Right 1mm"
                  >
                    +1 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeX(10)}
                    disabled={currentX >= maxXMm}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Right 10mm"
                  >
                    +10 mm
                  </button>
                </div>
              </div>
            </div>

            {/* 3. UP & DOWN ON A4 PAGE CONTROL BOX */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-50 to-emerald-500/10 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                    <ArrowUpDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Up &amp; Down on A4 Page (Vertical Position)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      A4 Page Height is 297 mm • Movement range: 0 mm to {maxYMm.toFixed(1)} mm
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

              {/* Slider for Smooth Up / Down adjustment across A4 */}
              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span>Top of A4 (0 mm)</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Distance from top of A4: {currentY.toFixed(1)} mm
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
                  <span>Higher on A4 sheet ↑</span>
                  <span>Drag slider to place card anywhere on A4</span>
                  <span>Lower on A4 sheet ↓</span>
                </div>
              </div>

              {/* Quick Vertical Position Presets for A4 */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-slate-500" />
                  <span>Quick Presets for A4 Canon Printing:</span>
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
                    onClick={() => handleUpdateY(50.0)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      currentY === 50
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    50mm (Upper)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateY(centerOfA4Y)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition text-center ${
                      Math.abs(currentY - centerOfA4Y) < 1
                        ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    A4 Middle ({centerOfA4Y.toFixed(0)}mm)
                  </button>
                </div>
              </div>

              {/* Exact millimeter fine tuning */}
              <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Fine 1mm / 10mm Steps:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleNudgeY(-10)}
                    disabled={currentY <= 0}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Up 10mm"
                  >
                    -10 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeY(-1)}
                    disabled={currentY <= 0}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Up 1mm"
                  >
                    -1 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeY(1)}
                    disabled={currentY >= maxYMm}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Down 1mm"
                  >
                    +1 mm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeY(10)}
                    disabled={currentY >= maxYMm}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-md border border-slate-300"
                    title="Move Down 10mm"
                  >
                    +10 mm
                  </button>
                </div>
              </div>
            </div>

            {/* 4. PHYSICAL PRINT PARAMETERS */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Fixed Paper Size:</span>
                <span className="font-bold text-blue-800">A4 Sheet (210 × 297 mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card Dimensions:</span>
                <span className="font-bold text-slate-800">
                  {cardWidthMm} × {cardHeightMm} mm ({isActualPvcStandard ? 'Standard PVC CR-80' : 'Custom'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Master Origin on A4:</span>
                <span className="font-bold text-slate-900">
                  X = {currentX.toFixed(1)} mm ({isCenteredX ? 'Centered' : 'Custom X'}) | Y = {currentY.toFixed(1)} mm
                </span>
              </div>
              {calibration.offsetX !== 0 || calibration.offsetY !== 0 ? (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Hardware Calibration Applied:</span>
                  <span>ΔX: {calibration.offsetX}mm, ΔY: {calibration.offsetY}mm</span>
                </div>
              ) : null}
            </div>

            {/* 5. CANON PRINTER DRIVER INSTRUCTIONS */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mandatory Canon Print Dialog Settings for A4:</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-amber-900 space-y-0.5">
                <li>Paper Size: <strong>A4 (210 × 297 mm)</strong></li>
                <li>Scale: <strong>Actual Size (100%)</strong> — Never select "Fit to Page"</li>
                <li>Margins: <strong>None / Zero</strong></li>
                <li>Both FRONT and BACK print at this exact adjusted X &amp; Y position</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 flex-wrap">
            <span className="font-medium">Active Origin on A4:</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              X = {currentX.toFixed(1)} mm {isCenteredX ? '(Center)' : ''}
            </span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              Y = {currentY.toFixed(1)} mm
            </span>
            {!isCenteredX && (
              <button
                type="button"
                onClick={handleCenterA4X}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-blue-200 transition"
              >
                <AlignCenter className="w-3 h-3" />
                <span>Re-center X</span>
              </button>
            )}
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
