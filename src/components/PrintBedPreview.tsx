import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Move, Layers, Eye, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { AlignmentSettings, CalibrationSettings, CardSideData } from '../types';
import { calculateSlotCoordinates } from '../utils/printHelper';

interface PrintBedPreviewProps {
  currentSide: 'front' | 'back';
  frontData: CardSideData;
  backData: CardSideData;
  alignment: AlignmentSettings;
  calibration: CalibrationSettings;
  onUpdateOrigin?: (xMm: number, yMm: number) => void;
  onSideChange?: (side: 'front' | 'back') => void;
}

export const PrintBedPreview: React.FC<PrintBedPreviewProps> = ({
  currentSide,
  frontData,
  backData,
  alignment,
  calibration,
  onUpdateOrigin,
  onSideChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showOverlayGhost, setShowOverlayGhost] = useState<boolean>(false);

  const { paperWidthMm, paperHeightMm, cardWidthMm, cardHeightMm, originXMm, originYMm } = alignment;

  // Calculate actual physical coordinates for the active side
  const slots = calculateSlotCoordinates(currentSide, alignment, calibration);
  const oppositeSlots = calculateSlotCoordinates(currentSide === 'front' ? 'back' : 'front', alignment, calibration);

  // Screen scale factor: convert mm to screen pixels for display
  // Base display scale: 2.2 px per mm at 100% zoom
  const baseScale = 2.4 * zoomLevel;
  const paperWidthPx = paperWidthMm * baseScale;
  const paperHeightPx = paperHeightMm * baseScale;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Virtual Print Bed Simulation</span>
          </div>

          {/* Side Toggle */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => onSideChange && onSideChange('front')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                currentSide === 'front'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              FRONT SIDE
            </button>
            <button
              onClick={() => onSideChange && onSideChange('back')}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                currentSide === 'back'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              BACK SIDE
            </button>
          </div>

          {/* Ghost Overlay of the other side to inspect alignment */}
          <button
            onClick={() => setShowOverlayGhost(!showOverlayGhost)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition ${
              showOverlayGhost
                ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Inspect front-to-back overlap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showOverlayGhost ? 'Ghost Overlay: ON' : 'Overlay Ghost'}</span>
          </button>
        </div>

        {/* Zoom & Rulers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`px-2 py-1 rounded text-[11px] font-medium border ${
              showRulers
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Rulers: {showRulers ? 'ON' : 'OFF'}
          </button>
          <div className="flex items-center bg-slate-800 rounded border border-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(0.4, zoomLevel - 0.15))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-l"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-slate-300 text-[11px]">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(2.0, zoomLevel + 0.15))}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-r"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={() => setZoomLevel(1.0)}
            className="p-1 text-slate-400 hover:text-white"
            title="Reset Zoom to 100%"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Print Stage Scrollable Viewport */}
      <div className="p-8 overflow-auto bg-slate-950 flex items-center justify-center min-h-[480px] select-none">
        <div
          className="relative bg-white shadow-2xl rounded-sm border border-slate-400 transition-all duration-150"
          style={{
            width: `${paperWidthPx}px`,
            height: `${paperHeightPx}px`,
            minWidth: `${paperWidthPx}px`,
            minHeight: `${paperHeightPx}px`,
          }}
        >
          {/* Subtle millimeter paper background grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

          {/* Paper Edge Corner Guides */}
          <div className="absolute top-1 left-2 text-[10px] font-mono text-slate-400 select-none">
            (0,0) Origin
          </div>
          <div className="absolute top-1 right-2 text-[10px] font-mono text-slate-400 select-none">
            {paperWidthMm} mm
          </div>
          <div className="absolute bottom-1 left-2 text-[10px] font-mono text-slate-400 select-none">
            {paperHeightMm} mm
          </div>

          {/* Rulers overlay along top and left if enabled */}
          {showRulers && (
            <>
              {/* Top Horizontal Millimeter Ruler */}
              <div className="absolute -top-6 left-0 right-0 h-6 bg-slate-900 border-b border-slate-700 flex overflow-hidden pointer-events-none">
                {Array.from({ length: Math.ceil(paperWidthMm / 10) + 1 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute border-l border-slate-500 h-3 top-3 text-[9px] font-mono text-slate-400 pl-0.5"
                    style={{ left: `${idx * 10 * baseScale}px` }}
                  >
                    {idx % 2 === 0 ? `${idx * 10}` : ''}
                  </div>
                ))}
              </div>

              {/* Left Vertical Millimeter Ruler */}
              <div className="absolute -left-6 top-0 bottom-0 w-6 bg-slate-900 border-r border-slate-700 flex overflow-hidden pointer-events-none">
                {Array.from({ length: Math.ceil(paperHeightMm / 10) + 1 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute border-t border-slate-500 w-3 left-3 text-[9px] font-mono text-slate-400 pt-0.5"
                    style={{ top: `${idx * 10 * baseScale}px` }}
                  >
                    {idx % 2 === 0 ? `${idx * 10}` : ''}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Opposite Side Ghost Overlay (if enabled) for registration check */}
          {showOverlayGhost &&
            oppositeSlots.map((oppSlot, idx) => (
              <div
                key={`ghost-${idx}`}
                className="absolute border-2 border-dashed border-indigo-500/50 bg-indigo-500/10 pointer-events-none z-10"
                style={{
                  left: `${oppSlot.xMm * baseScale}px`,
                  top: `${oppSlot.yMm * baseScale}px`,
                  width: `${oppSlot.widthMm * baseScale}px`,
                  height: `${oppSlot.heightMm * baseScale}px`,
                }}
              >
                <div className="absolute top-1 right-1 text-[9px] font-mono text-indigo-700 font-bold bg-white/80 px-1 rounded">
                  {currentSide === 'front' ? 'BACK GHOST' : 'FRONT GHOST'}
                </div>
              </div>
            ))}

          {/* Active Card Slots */}
          {slots.map((slot) => {
            const activeCardData = currentSide === 'front' ? frontData : backData;
            const hasImage = Boolean(activeCardData.croppedImageUrl || activeCardData.sourceImageUrl);
            const displayUrl = activeCardData.croppedImageUrl || activeCardData.sourceImageUrl;

            return (
              <div
                key={slot.slotIndex}
                className="absolute group border-2 border-amber-500 rounded-md shadow-lg overflow-hidden bg-slate-50 transition-all z-20 cursor-move"
                style={{
                  left: `${slot.xMm * baseScale}px`,
                  top: `${slot.yMm * baseScale}px`,
                  width: `${slot.widthMm * baseScale}px`,
                  height: `${slot.heightMm * baseScale}px`,
                }}
              >
                {/* Physical Card Representation */}
                {hasImage && displayUrl ? (
                  <img
                    src={displayUrl}
                    alt="Card Print"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 bg-slate-100">
                    <span className="text-xs font-bold text-slate-600">
                      Card Slot #{slot.slotIndex + 1}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {currentSide.toUpperCase()} SIDE
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">
                      {slot.widthMm.toFixed(1)} × {slot.heightMm.toFixed(1)} mm
                    </span>
                  </div>
                )}

                {/* Coordinate HUD Tag */}
                <div className="absolute top-1 left-1 bg-slate-950/80 backdrop-blur text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-amber-500/40 pointer-events-none">
                  X:{slot.xMm.toFixed(1)} Y:{slot.yMm.toFixed(1)} mm
                </div>

                {/* Slot Tag */}
                <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none">
                  {currentSide === 'front' ? 'FRONT' : 'BACK'}
                </div>

                {/* Center Target Mark */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-40">
                  <div className="w-full h-0.5 bg-red-600" />
                  <div className="h-full w-0.5 bg-red-600 absolute left-1/2 -translate-x-1/2 top-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status & Canon Safe Print Notice */}
      <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-semibold text-amber-400">Master Coordinates:</span>
          <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            X = {originXMm.toFixed(1)} mm | Y = {originYMm.toFixed(1)} mm
          </span>
          <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Size = {cardWidthMm} × {cardHeightMm} mm
          </span>
          {calibration.offsetX !== 0 || calibration.offsetY !== 0 ? (
            <span className="font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
              Calibration Applied: (ΔX: {calibration.offsetX > 0 ? `+${calibration.offsetX}` : calibration.offsetX}mm, ΔY: {calibration.offsetY > 0 ? `+${calibration.offsetY}` : calibration.offsetY}mm)
            </span>
          ) : null}
        </div>

        <div className="text-[11px] text-amber-300/80 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Notice: In Canon print dialog, choose <strong>Actual Size (100%)</strong> with <strong>Margins: None</strong>.</span>
        </div>
      </div>
    </div>
  );
};
