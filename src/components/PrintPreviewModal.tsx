import React from 'react';
import { X, Printer, AlertTriangle, CheckCircle2, ShieldCheck, Ruler } from 'lucide-react';
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
}) => {
  if (!isOpen) return null;

  const { paperWidthMm, paperHeightMm, cardWidthMm, cardHeightMm } = alignment;
  const activeData = side === 'front' ? frontData : backData;
  const imageSrc = activeData.croppedImageUrl || activeData.sourceImageUrl;

  const slots = calculateSlotCoordinates(side, alignment, calibration);

  // Scaled view for preview dialog: fit within ~400px height
  const scaleRatio = 380 / paperHeightMm;
  const previewW = paperWidthMm * scaleRatio;
  const previewH = paperHeightMm * scaleRatio;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {side === 'front' ? 'Front Side Print Preview' : 'Back Side Print Preview'}
              </h3>
              <p className="text-xs text-slate-400">
                100% Physical scale output simulation for Canon printer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Simulated Paper Sheet */}
          <div className="md:col-span-6 flex items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div
              className="relative bg-white shadow-xl border border-slate-300 rounded-sm overflow-hidden"
              style={{
                width: `${previewW}px`,
                height: `${previewH}px`,
              }}
            >
              {/* Paper Grid */}
              <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

              {/* Placed Cards */}
              {slots.map((slot) => (
                <div
                  key={slot.slotIndex}
                  className="absolute border border-amber-500 bg-slate-50 overflow-hidden shadow"
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
                      alt="Card Print"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] font-mono">
                      Card #{slot.slotIndex + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Details & Canon Verification Warning */}
          <div className="md:col-span-6 space-y-4 text-xs">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sm">Physical Print Parameters:</h4>
              <div className="space-y-1.5 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Side to Print:</span>
                  <span className="font-bold uppercase text-amber-700">{side} Side Only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Card Dimensions:</span>
                  <span className="font-bold">{cardWidthMm} × {cardHeightMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paper Sheet:</span>
                  <span className="font-bold">{paperWidthMm} × {paperHeightMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Master Origin (X, Y):</span>
                  <span className="font-bold">{slots[0]?.xMm.toFixed(1)} mm, {slots[0]?.yMm.toFixed(1)} mm</span>
                </div>
                {calibration.offsetX !== 0 || calibration.offsetY !== 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>Calibration Offset:</span>
                    <span>X:{calibration.offsetX}mm Y:{calibration.offsetY}mm</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Canon driver alert */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Verify in Canon Print Dialog:</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-amber-900 space-y-0.5">
                <li>Choose <strong>Actual Size (100%)</strong></li>
                <li>Disable <strong>Fit to page</strong></li>
                <li>Set Margins to <strong>None</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirmPrint();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>SEND TO CANON PRINTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
