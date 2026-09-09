import React, { useState } from 'react';
import { AlertTriangle, Check, ArrowRight, Printer, RotateCw, X, HelpCircle } from 'lucide-react';
import { BackSheetFlipType, BackFlipMode } from '../types';

interface ReinsertionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrintBack: () => void;
  flipType: BackSheetFlipType;
  flipMode: BackFlipMode;
}

export const ReinsertionGuideModal: React.FC<ReinsertionGuideModalProps> = ({
  isOpen,
  onClose,
  onConfirmPrintBack,
  flipType,
  flipMode,
}) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header Alert */}
        <div className="bg-amber-500 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-950/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight uppercase">
                FRONT SIDE HAS ALREADY BEEN PRINTED
              </h3>
              <p className="text-xs font-semibold text-slate-900">
                Prevent accidental reverse print: confirm physical card reinsertion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-900 hover:bg-slate-950/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Visual Diagram */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold text-sm text-amber-950">
              Action Required:
            </p>
            <p>
              Please manually take the same PVC card or sheet from the printer exit tray,
              flip it in the required orientation, and insert it back into your Canon printer.
            </p>
          </div>

          {/* Reinsertion Visual Diagram */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Canon Reinsertion Visual Guide</span>
              </span>
              <span className="font-mono text-[11px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                Mode: {flipType === 'tray_same_coords' ? 'Canon PVC Tray (Slot in place)' : 'Sheet Paper Re-Feed'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step A */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase mb-1">1. Take Out Card</span>
                <div className="w-24 h-16 bg-blue-50 border-2 border-blue-500 rounded-md flex flex-col items-center justify-center my-2 shadow-sm">
                  <span className="text-[10px] font-bold text-blue-800">FRONT</span>
                  <span className="text-[8px] text-blue-600">Printed ✓</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Remove the card/sheet printed with the front side.
                </p>
              </div>

              {/* Step B */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-indigo-600 uppercase mb-1">2. Turn Over</span>
                <div className="w-24 h-16 bg-indigo-50 border-2 border-dashed border-indigo-400 rounded-md flex flex-col items-center justify-center my-2 relative">
                  <RotateCw className="w-6 h-6 text-indigo-600 animate-spin-slow" />
                  <span className="text-[8px] font-bold text-indigo-700 mt-0.5">
                    {flipType === 'flip_long_edge' ? 'Flip Long Edge' : 'Flip Short Edge'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Turn the blank side upward for printing. Keep the top edge aligned.
                </p>
              </div>

              {/* Step C */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase mb-1">3. Reinsert to Canon</span>
                <div className="w-24 h-16 bg-emerald-50 border-2 border-emerald-500 rounded-md flex flex-col items-center justify-center my-2 shadow-sm relative">
                  <span className="text-[10px] font-bold text-emerald-800">BACK</span>
                  <span className="text-[8px] text-emerald-600">Ready to Print</span>
                  <div className="absolute top-0.5 right-1 text-[8px] text-emerald-700">⬆ Feed</div>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Reinsert into the Canon tray or feed feeder securely.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Confirmation Checkbox */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-300">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-900 leading-relaxed">
                I have reinserted the card/sheet correctly into the Canon printer in the required orientation.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition"
          >
            Cancel / Back to Editor
          </button>

          <button
            disabled={!hasConfirmed}
            onClick={() => {
              if (hasConfirmed) {
                onConfirmPrintBack();
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed shadow transition"
          >
            <Check className="w-4 h-4" />
            <span>CONFIRM &amp; PRINT BACK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
