import React from 'react';
import {
  Compass,
  Sliders,
  Maximize2,
  Grid3X3,
  Layers,
  ArrowRightLeft,
  RotateCw,
  Copy,
  Info,
  Sparkles,
  ArrowUpToLine,
  AlignCenter,
  CheckCircle2,
} from 'lucide-react';
import { AlignmentSettings, PaperSizeKey, BackFlipMode, BackSheetFlipType, PlacementMode } from '../types';
import { CARD_SIZE_PRESETS, PAPER_SIZE_PRESETS } from '../constants/presets';

interface AlignmentControlsProps {
  alignment: AlignmentSettings;
  onUpdateAlignment: (newSettings: Partial<AlignmentSettings>) => void;
  onApplyPresetCardSize: (widthMm: number, heightMm: number) => void;
}

export const AlignmentControls: React.FC<AlignmentControlsProps> = ({
  alignment,
  onUpdateAlignment,
  onApplyPresetCardSize,
}) => {
  const {
    paperSizeKey,
    paperWidthMm,
    paperHeightMm,
    cardWidthMm,
    cardHeightMm,
    placementMode,
    centerOnPage,
    topMarginMm = 20.0,
    originXMm,
    originYMm,
    multiCardLayout,
    backSheetFlipType,
    backFlipMode,
    backOffsetX,
    backOffsetY,
    copies,
  } = alignment;

  const currentPlacementMode: PlacementMode =
    placementMode || (originYMm <= 40 ? 'top_center' : centerOnPage ? 'page_center' : 'custom');

  const handlePaperPresetChange = (key: PaperSizeKey) => {
    const preset = PAPER_SIZE_PRESETS.find((p) => p.key === key);
    if (preset && key !== 'custom') {
      const newW = preset.widthMm;
      const newH = preset.heightMm;
      const updates: Partial<AlignmentSettings> = {
        paperSizeKey: key,
        paperWidthMm: newW,
        paperHeightMm: newH,
      };
      if (currentPlacementMode === 'top_center') {
        updates.originXMm = Math.round(((newW - cardWidthMm) / 2) * 10) / 10;
        updates.originYMm = topMarginMm;
      } else if (currentPlacementMode === 'page_center') {
        updates.originXMm = Math.round(((newW - cardWidthMm) / 2) * 10) / 10;
        updates.originYMm = Math.round(((newH - cardHeightMm) / 2) * 10) / 10;
      }
      onUpdateAlignment(updates);
    } else {
      onUpdateAlignment({ paperSizeKey: key });
    }
  };

  const handleMultiCardCountChange = (count: number) => {
    if (count === 1) {
      onUpdateAlignment({
        multiCardLayout: {
          ...multiCardLayout,
          enabled: false,
          rows: 1,
          columns: 1,
        },
      });
    } else if (count === 2) {
      onUpdateAlignment({
        multiCardLayout: {
          ...multiCardLayout,
          enabled: true,
          rows: 2,
          columns: 1,
          gapXMm: 10,
          gapYMm: 12,
        },
      });
    } else if (count === 4) {
      onUpdateAlignment({
        multiCardLayout: {
          ...multiCardLayout,
          enabled: true,
          rows: 2,
          columns: 2,
          gapXMm: 12,
          gapYMm: 12,
        },
      });
    } else if (count === 6) {
      onUpdateAlignment({
        multiCardLayout: {
          ...multiCardLayout,
          enabled: true,
          rows: 3,
          columns: 2,
          gapXMm: 10,
          gapYMm: 10,
        },
      });
    } else if (count === 8) {
      onUpdateAlignment({
        multiCardLayout: {
          ...multiCardLayout,
          enabled: true,
          rows: 4,
          columns: 2,
          gapXMm: 8,
          gapYMm: 8,
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
          <Compass className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Physical Print Alignment &amp; Canvas Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Master millimeter coordinates applied identically to both Front and Back sides.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
        {/* Section 1: Paper Dimensions */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Paper / Media Selection</span>
            </h3>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Paper Type / Tray</label>
            <select
              value={paperSizeKey}
              onChange={(e) => handlePaperPresetChange(e.target.value as PaperSizeKey)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
            >
              {PAPER_SIZE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Width (mm)</label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="500"
                value={paperWidthMm}
                onChange={(e) => onUpdateAlignment({ paperWidthMm: parseFloat(e.target.value) || 210 })}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Height (mm)</label>
              <input
                type="number"
                step="0.5"
                min="50"
                max="500"
                value={paperHeightMm}
                onChange={(e) => onUpdateAlignment({ paperHeightMm: parseFloat(e.target.value) || 297 })}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Physical units mapped to @page print CSS directly.
          </p>
        </div>

        {/* Section 2: Card Size & Presets */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-blue-600" />
              <span>Card Dimensions (8:5 Physical)</span>
            </h3>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Standard Card Preset</label>
            <select
              onChange={(e) => {
                const found = CARD_SIZE_PRESETS.find((c) => c.id === e.target.value);
                if (found) {
                  onApplyPresetCardSize(found.widthMm, found.heightMm);
                }
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
            >
              {CARD_SIZE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.widthMm} × {p.heightMm} mm)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Card Width (mm)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="150"
                value={cardWidthMm}
                onChange={(e) => onUpdateAlignment({ cardWidthMm: parseFloat(e.target.value) || 80 })}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded-md"
              />
              <span className="text-[10px] text-slate-500">{(cardWidthMm / 10).toFixed(1)} cm</span>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Card Height (mm)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="150"
                value={cardHeightMm}
                onChange={(e) => onUpdateAlignment({ cardHeightMm: parseFloat(e.target.value) || 50 })}
                className="w-full px-2.5 py-1.5 font-mono bg-white border border-slate-300 rounded-md"
              />
              <span className="text-[10px] text-slate-500">{(cardHeightMm / 10).toFixed(1)} cm</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
            <span className="font-semibold">Aspect Ratio:</span>
            <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">
              {(cardWidthMm / cardHeightMm).toFixed(2)}:1
            </span>
            <span className="text-slate-400">
              {cardWidthMm === 80 && cardHeightMm === 50 ? '(Standard 8:5)' : ''}
            </span>
          </div>
        </div>

        {/* Section 3: Master X/Y Coordinates & Placement Mode */}
        <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Placement &amp; Position Engine</span>
            </h3>
            {currentPlacementMode === 'top_center' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Top &amp; Center Active</span>
              </span>
            ) : currentPlacementMode === 'page_center' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                Page Center Active
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Custom Coordinates
              </span>
            )}
          </div>

          {/* Placement Mode Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Mode 1: Top & Center */}
            <button
              type="button"
              onClick={() => {
                const cx = Math.max(0, (paperWidthMm - cardWidthMm) / 2);
                const tm = topMarginMm || 20.0;
                onUpdateAlignment({
                  placementMode: 'top_center',
                  centerOnPage: true,
                  originXMm: Math.round(cx * 10) / 10,
                  originYMm: tm,
                  topMarginMm: tm,
                });
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                currentPlacementMode === 'top_center'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <ArrowUpToLine className={`w-3.5 h-3.5 ${currentPlacementMode === 'top_center' ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span>Top &amp; Center</span>
                  </span>
                  {currentPlacementMode === 'top_center' && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Centered horizontally, placed at the <strong>top</strong> of the sheet (X: {Math.round(((paperWidthMm - cardWidthMm) / 2) * 10) / 10}mm, Y: {originYMm}mm).
                </p>
              </div>
            </button>

            {/* Mode 2: Center of Page */}
            <button
              type="button"
              onClick={() => {
                const cx = Math.max(0, (paperWidthMm - cardWidthMm) / 2);
                const cy = Math.max(0, (paperHeightMm - cardHeightMm) / 2);
                onUpdateAlignment({
                  placementMode: 'page_center',
                  centerOnPage: true,
                  originXMm: Math.round(cx * 10) / 10,
                  originYMm: Math.round(cy * 10) / 10,
                });
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                currentPlacementMode === 'page_center'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <AlignCenter className={`w-3.5 h-3.5 ${currentPlacementMode === 'page_center' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>Middle of Page</span>
                  </span>
                  {currentPlacementMode === 'page_center' && (
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Dead center of entire sheet (X: {Math.round(((paperWidthMm - cardWidthMm) / 2) * 10) / 10}mm, Y: {Math.round(((paperHeightMm - cardHeightMm) / 2) * 10) / 10}mm).
                </p>
              </div>
            </button>

            {/* Mode 3: Custom Coordinates */}
            <button
              type="button"
              onClick={() => {
                onUpdateAlignment({
                  placementMode: 'custom',
                  centerOnPage: false,
                });
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                currentPlacementMode === 'custom'
                  ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                    <Sliders className={`w-3.5 h-3.5 ${currentPlacementMode === 'custom' ? 'text-amber-600' : 'text-slate-500'}`} />
                    <span>Custom Position</span>
                  </span>
                  {currentPlacementMode === 'custom' && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Manual coordinates for trays or custom offset margins.
                </p>
              </div>
            </button>
          </div>

          {/* Top Margin Quick Selectors (when Top & Center is active) */}
          {currentPlacementMode === 'top_center' && (
            <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <ArrowUpToLine className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Top Margin Distance</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {originYMm} mm from top edge
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[10, 15, 20, 25, 30].map((marginVal) => (
                  <button
                    key={marginVal}
                    type="button"
                    onClick={() => {
                      onUpdateAlignment({
                        originYMm: marginVal,
                        topMarginMm: marginVal,
                        placementMode: 'top_center',
                        centerOnPage: true,
                        originXMm: Math.round(((paperWidthMm - cardWidthMm) / 2) * 10) / 10,
                      });
                    }}
                    className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                      originYMm === marginVal
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {marginVal} mm {marginVal === 20 ? '(Standard)' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 font-semibold">Origin X (Left mm)</label>
                {currentPlacementMode === 'top_center' || currentPlacementMode === 'page_center' ? (
                  <span className="text-[9px] text-emerald-600 font-bold">Centered</span>
                ) : null}
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="300"
                value={originXMm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  onUpdateAlignment({
                    originXMm: val,
                    placementMode: 'custom',
                    centerOnPage: false,
                  });
                }}
                className={`w-full px-2.5 py-1.5 font-mono border rounded-md ${
                  currentPlacementMode === 'top_center' || currentPlacementMode === 'page_center'
                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 font-semibold">Origin Y (Top mm)</label>
                {currentPlacementMode === 'top_center' ? (
                  <span className="text-[9px] text-emerald-600 font-bold">Top Margin</span>
                ) : currentPlacementMode === 'page_center' ? (
                  <span className="text-[9px] text-blue-600 font-bold">Centered</span>
                ) : null}
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max="300"
                value={originYMm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (currentPlacementMode === 'top_center') {
                    onUpdateAlignment({
                      originYMm: val,
                      topMarginMm: val,
                    });
                  } else {
                    onUpdateAlignment({
                      originYMm: val,
                      placementMode: 'custom',
                      centerOnPage: false,
                    });
                  }
                }}
                className={`w-full px-2.5 py-1.5 font-mono border rounded-md ${
                  currentPlacementMode === 'top_center'
                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950 font-bold'
                    : currentPlacementMode === 'page_center'
                    ? 'bg-blue-50/50 border-blue-300 text-blue-950 font-bold'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Quick preset positions */}
          <div>
            <span className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Quick Alignment Shortcuts</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const cx = Math.max(0, (paperWidthMm - cardWidthMm) / 2);
                  onUpdateAlignment({
                    placementMode: 'top_center',
                    centerOnPage: true,
                    originXMm: Math.round(cx * 10) / 10,
                    originYMm: 20.0,
                    topMarginMm: 20.0,
                  });
                }}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition flex items-center gap-1 ${
                  currentPlacementMode === 'top_center' && originYMm === 20
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-emerald-400 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <ArrowUpToLine className="w-3 h-3" />
                <span>Top &amp; Center (X: {Math.round(((paperWidthMm - cardWidthMm) / 2) * 10) / 10}mm, Y: 20mm)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const cx = Math.max(0, (paperWidthMm - cardWidthMm) / 2);
                  const cy = Math.max(0, (paperHeightMm - cardHeightMm) / 2);
                  onUpdateAlignment({
                    placementMode: 'page_center',
                    centerOnPage: true,
                    originXMm: Math.round(cx * 10) / 10,
                    originYMm: Math.round(cy * 10) / 10,
                  });
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium text-[11px] text-slate-700"
              >
                Middle of Page ({Math.round(((paperHeightMm - cardHeightMm) / 2) * 10) / 10}mm)
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateAlignment({
                    originXMm: 25,
                    originYMm: 35,
                    placementMode: 'custom',
                    centerOnPage: false,
                  })
                }
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium text-[11px] text-slate-700"
              >
                Canon Tray Slot 1 (25, 35)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Dual-Sided Back Flip & Alignment Engine */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-amber-950 flex items-center gap-2 text-sm">
            <ArrowRightLeft className="w-4 h-4 text-amber-600" />
            <span>Critical Back-Side Alignment &amp; Mirror Orientation Engine</span>
          </h3>
          <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-300">
            Front/Back Coordinated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Back Paper Reinsertion Method */}
          <div className="space-y-2 bg-white p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 block">
              1. Physical Reinsertion / Flip Behavior
            </label>
            <p className="text-[11px] text-slate-500">
              Select how the sheet or PVC card is physically flipped when inserted back into the Canon printer:
            </p>
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="backSheetFlipType"
                  value="tray_same_coords"
                  checked={backSheetFlipType === 'tray_same_coords'}
                  onChange={() => onUpdateAlignment({ backSheetFlipType: 'tray_same_coords' })}
                  className="accent-amber-600"
                />
                <span className="font-medium text-slate-800">
                  Canon PVC Tray Mode (Card flipped in-place inside tray slot: Identical X &amp; Y)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="backSheetFlipType"
                  value="flip_short_edge"
                  checked={backSheetFlipType === 'flip_short_edge'}
                  onChange={() => onUpdateAlignment({ backSheetFlipType: 'flip_short_edge' })}
                  className="accent-amber-600"
                />
                <span className="font-medium text-slate-800">
                  Sheet Flip along Short Edge (Horizontally mirrored: Back X = Paper Width - Front X - Card Width)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="backSheetFlipType"
                  value="flip_long_edge"
                  checked={backSheetFlipType === 'flip_long_edge'}
                  onChange={() => onUpdateAlignment({ backSheetFlipType: 'flip_long_edge' })}
                  className="accent-amber-600"
                />
                <span className="font-medium text-slate-800">
                  Sheet Flip along Long Edge (Vertically mirrored: Back Y = Paper Height - Front Y - Card Height)
                </span>
              </label>
            </div>
          </div>

          {/* Back Card Rotation & Flip Controls */}
          <div className="space-y-2 bg-white p-3.5 rounded-lg border border-slate-200">
            <label className="font-bold text-slate-800 block">
              2. Back Side Card Rotation / Flip Controls
            </label>
            <p className="text-[11px] text-slate-500">
              Apply manual rotation or mirror if your card orientation requires it:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onUpdateAlignment({ backFlipMode: 'none' })}
                className={`py-2 px-3 rounded-lg border text-left transition font-semibold ${
                  backFlipMode === 'none'
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No Flip / Standard
              </button>

              <button
                type="button"
                onClick={() => onUpdateAlignment({ backFlipMode: 'flip_horizontal' })}
                className={`py-2 px-3 rounded-lg border text-left transition font-semibold ${
                  backFlipMode === 'flip_horizontal'
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Flip Horizontally
              </button>

              <button
                type="button"
                onClick={() => onUpdateAlignment({ backFlipMode: 'flip_vertical' })}
                className={`py-2 px-3 rounded-lg border text-left transition font-semibold ${
                  backFlipMode === 'flip_vertical'
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Flip Vertically
              </button>

              <button
                type="button"
                onClick={() => onUpdateAlignment({ backFlipMode: 'rotate_180' })}
                className={`py-2 px-3 rounded-lg border text-left transition font-semibold ${
                  backFlipMode === 'rotate_180'
                    ? 'bg-amber-100 border-amber-400 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Rotate 180° (Head to Foot)
              </button>
            </div>
          </div>
        </div>

        {/* Back Fine-Tuning Offsets (if tray has minor mechanical tolerance) */}
        <div className="pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
          <span className="font-semibold text-slate-700">
            Back Side Mechanical Tolerance Fine-Tuning:
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Back X Fine:</span>
              <input
                type="number"
                step="0.1"
                min="-10"
                max="10"
                value={backOffsetX}
                onChange={(e) => onUpdateAlignment({ backOffsetX: parseFloat(e.target.value) || 0 })}
                className="w-16 px-1.5 py-0.5 font-mono text-center bg-white border border-slate-300 rounded"
              />
              <span className="text-slate-500">mm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">Back Y Fine:</span>
              <input
                type="number"
                step="0.1"
                min="-10"
                max="10"
                value={backOffsetY}
                onChange={(e) => onUpdateAlignment({ backOffsetY: parseFloat(e.target.value) || 0 })}
                className="w-16 px-1.5 py-0.5 font-mono text-center bg-white border border-slate-300 rounded"
              />
              <span className="text-slate-500">mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Multiple Cards on One Sheet */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <Grid3X3 className="w-4 h-4 text-indigo-600" />
            <span>Multiple Cards on Single Sheet Layout</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Maintains identical slot coordinates for front and back
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700">Card Layout:</span>
          {[1, 2, 4, 6, 8].map((num) => {
            const isSelected =
              num === 1
                ? !multiCardLayout.enabled
                : multiCardLayout.enabled && multiCardLayout.rows * multiCardLayout.columns === num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleMultiCardCountChange(num)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {num === 1 ? '1 Single Card' : `${num} Cards Layout`}
              </button>
            );
          })}
        </div>

        {multiCardLayout.enabled && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Columns</label>
              <input
                type="number"
                min="1"
                max="4"
                value={multiCardLayout.columns}
                onChange={(e) =>
                  onUpdateAlignment({
                    multiCardLayout: {
                      ...multiCardLayout,
                      columns: Math.max(1, parseInt(e.target.value) || 1),
                    },
                  })
                }
                className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Rows</label>
              <input
                type="number"
                min="1"
                max="6"
                value={multiCardLayout.rows}
                onChange={(e) =>
                  onUpdateAlignment({
                    multiCardLayout: {
                      ...multiCardLayout,
                      rows: Math.max(1, parseInt(e.target.value) || 1),
                    },
                  })
                }
                className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Horizontal Gap (mm)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={multiCardLayout.gapXMm}
                onChange={(e) =>
                  onUpdateAlignment({
                    multiCardLayout: {
                      ...multiCardLayout,
                      gapXMm: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Vertical Gap (mm)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={multiCardLayout.gapYMm}
                onChange={(e) =>
                  onUpdateAlignment({
                    multiCardLayout: {
                      ...multiCardLayout,
                      gapYMm: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-2 py-1 font-mono bg-white border border-slate-300 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
