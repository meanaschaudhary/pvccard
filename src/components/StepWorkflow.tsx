import React, { useRef, useState } from 'react';
import {
  Upload,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  FileCheck,
  FileText,
  RotateCw,
  RefreshCw,
} from 'lucide-react';
import { CardSideData, AlignmentSettings, CalibrationSettings, WorkflowStep } from '../types';
import { loadPdfDocument, renderPdfPageToDataUrl } from '../utils/pdfHelper';
import { renderHighResCardImage } from '../utils/imageProcessing';

interface StepWorkflowProps {
  workflowStep: WorkflowStep;
  frontData: CardSideData;
  backData: CardSideData;
  alignment: AlignmentSettings;
  calibration: CalibrationSettings;
  onUpdateFrontData: (updated: Partial<CardSideData>) => void;
  onUpdateBackData: (updated: Partial<CardSideData>) => void;
  onPreviewSide: (side: 'front' | 'back') => void;
  onPrintFront: () => void;
  onOpenReinsertionModal: () => void;
  onDirectPrintBack: () => void;
  onGoToEditor: (side: 'front' | 'back') => void;
  onResetWorkflow: () => void;
  onLoadSpecimenCards: () => void;
}

export const StepWorkflow: React.FC<StepWorkflowProps> = ({
  workflowStep,
  frontData,
  backData,
  alignment,
  calibration,
  onUpdateFrontData,
  onUpdateBackData,
  onPreviewSide,
  onPrintFront,
  onOpenReinsertionModal,
  onDirectPrintBack,
  onGoToEditor,
  onResetWorkflow,
  onLoadSpecimenCards,
}) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<string | null>(null);

  // Safety confirmation check
  const [reinsertConfirmed, setReinsertConfirmed] = useState(false);

  const { cardWidthMm, cardHeightMm, originXMm, originYMm, paperWidthMm, paperHeightMm } = alignment;

  const handleFileUpload = async (file: File, side: 'front' | 'back') => {
    setIsProcessingFile(side);
    const updateFn = side === 'front' ? onUpdateFrontData : onUpdateBackData;

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const { numPages, pdfDoc } = await loadPdfDocument(file);
        // Render first page at high-res 3.5 scale (~350 DPI)
        const rendered = await renderPdfPageToDataUrl(pdfDoc, 1, 3.5);

        // Pre-render cropped version
        const highRes = await renderHighResCardImage(
          rendered.dataUrl,
          {
            x: 0,
            y: 0,
            zoom: 1,
            rotation: 0,
            flipH: false,
            flipV: false,
            aspectRatioLocked: true,
          },
          cardWidthMm,
          cardHeightMm
        );

        updateFn({
          originalFile: file,
          fileName: file.name,
          fileType: 'pdf',
          pdfNumPages: numPages,
          selectedPdfPage: 1,
          sourceImageUrl: rendered.dataUrl,
          croppedImageUrl: highRes,
        });
      } else {
        // Standard Image (JPG, PNG)
        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target?.result as string;
          const highRes = await renderHighResCardImage(
            dataUrl,
            {
              x: 0,
              y: 0,
              zoom: 1,
              rotation: 0,
              flipH: false,
              flipV: false,
              aspectRatioLocked: true,
            },
            cardWidthMm,
            cardHeightMm
          );

          updateFn({
            originalFile: file,
            fileName: file.name,
            fileType: 'image',
            sourceImageUrl: dataUrl,
            croppedImageUrl: highRes,
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(`Failed to load ${side} file`, err);
    } finally {
      setIsProcessingFile(null);
    }
  };

  const frontHasImage = Boolean(frontData.sourceImageUrl || frontData.croppedImageUrl);
  const backHasImage = Boolean(backData.sourceImageUrl || backData.croppedImageUrl);
  const isFrontDone = workflowStep === 'reinsert' || workflowStep === 'back' || workflowStep === 'completed';

  return (
    <div className="space-y-6">
      {/* Workflow Step Tracker Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Step 1 Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                isFrontDone
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[11px]">
                {isFrontDone ? '✓' : '1'}
              </span>
              <span>STEP 1: PRINT FRONT</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400" />

            {/* Step 2 Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                workflowStep === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isFrontDone
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900/10 flex items-center justify-center text-[11px]">
                {workflowStep === 'completed' ? '✓' : '2'}
              </span>
              <span>STEP 2: REINSERT &amp; PRINT BACK</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetWorkflow}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-slate-100"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Step Cards (Front on Left, Back on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= STEP 1: FRONT CARD ================= */}
        <div
          className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-between transition-all ${
            !isFrontDone
              ? 'border-amber-400 ring-2 ring-amber-400/30'
              : 'border-slate-200 opacity-95'
          }`}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">STEP 1 — FRONT SIDE</h3>
                  <p className="text-xs text-slate-500">
                    Exact {cardWidthMm} × {cardHeightMm} mm physical boundary
                  </p>
                </div>
              </div>

              {isFrontDone && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>FRONT PRINTED ✓</span>
                </span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={frontInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'front');
              }}
            />

            {/* Front Card Preview Container (Exact 8:5 ratio preview) */}
            <div className="relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[220px] select-none">
              {frontHasImage ? (
                <>
                  <img
                    src={frontData.croppedImageUrl || frontData.sourceImageUrl || ''}
                    alt="Front Card"
                    className="w-full h-full object-contain max-h-[260px] pointer-events-none"
                  />
                  {/* Floating Action Bar */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onGoToEditor('front')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur text-white text-xs font-semibold rounded-md border border-slate-700 hover:bg-slate-800"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Crop / Adjust</span>
                    </button>
                    <button
                      onClick={() => frontInputRef.current?.click()}
                      className="px-2.5 py-1 bg-slate-900/80 backdrop-blur text-slate-300 text-xs font-semibold rounded-md border border-slate-700 hover:text-white"
                    >
                      Replace
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className="w-full h-full p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-900 transition"
                >
                  <Upload className="w-10 h-10 text-amber-500 mb-2 stroke-[1.8]" />
                  <p className="text-sm font-bold text-white">Click or Drop Front ID Card</p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF (Aadhaar, PAN, Voter, etc.)</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadSpecimenCards();
                    }}
                    className="mt-3 flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Or load specimen test cards</span>
                  </button>
                </div>
              )}

              {/* Exact millimeter dimensions tag */}
              <div className="absolute bottom-2 left-2 bg-slate-950/90 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
                Master Boundary: {cardWidthMm} × {cardHeightMm} mm
              </div>
            </div>

            {/* File info badge */}
            {frontData.fileName && (
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="truncate max-w-[240px] font-medium">{frontData.fileName}</span>
                <span className="text-[10px] uppercase font-mono text-slate-500">
                  {frontData.fileType} (High-Res Ready)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons for Front */}
          <div className="space-y-3 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="w-full py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>UPLOAD FRONT</span>
              </button>

              <button
                type="button"
                disabled={!frontHasImage}
                onClick={() => onPreviewSide('front')}
                className="w-full py-3 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                <span>PREVIEW FRONT</span>
              </button>
            </div>

            <button
              type="button"
              disabled={!frontHasImage || Boolean(isProcessingFile)}
              onClick={onPrintFront}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-5 h-5 stroke-[2.5]" />
              <span>PRINT FRONT (ONLY FRONT)</span>
            </button>
          </div>
        </div>

        {/* ================= STEP 2: BACK CARD ================= */}
        <div
          className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col justify-between transition-all ${
            isFrontDone
              ? 'border-amber-400 ring-2 ring-amber-400/30'
              : 'border-slate-200 opacity-90'
          }`}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">STEP 2 — BACK SIDE</h3>
                  <p className="text-xs text-slate-500">
                    Exact same coordinates: X={originXMm}mm, Y={originYMm}mm
                  </p>
                </div>
              </div>

              {workflowStep === 'completed' && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BACK PRINTED ✓</span>
                </span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={backInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'back');
              }}
            />

            {/* Reinsertion Status Notice Banner */}
            {isFrontDone && workflowStep !== 'completed' && (
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Front printed successfully!</p>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Now insert the same card/sheet back into the Canon printer in the required
                    orientation, then continue to BACK PRINT.
                  </p>
                </div>
              </div>
            )}

            {/* Back Card Preview Container */}
            <div className="relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[220px] select-none">
              {backHasImage ? (
                <>
                  <img
                    src={backData.croppedImageUrl || backData.sourceImageUrl || ''}
                    alt="Back Card"
                    className="w-full h-full object-contain max-h-[260px] pointer-events-none"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onGoToEditor('back')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/80 backdrop-blur text-white text-xs font-semibold rounded-md border border-slate-700 hover:bg-slate-800"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Crop / Adjust</span>
                    </button>
                    <button
                      onClick={() => backInputRef.current?.click()}
                      className="px-2.5 py-1 bg-slate-900/80 backdrop-blur text-slate-300 text-xs font-semibold rounded-md border border-slate-700 hover:text-white"
                    >
                      Replace
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={() => backInputRef.current?.click()}
                  className="w-full h-full p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-900 transition"
                >
                  <Upload className="w-10 h-10 text-indigo-400 mb-2 stroke-[1.8]" />
                  <p className="text-sm font-bold text-white">Click or Drop Back ID Card</p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF</p>
                </div>
              )}

              <div className="absolute bottom-2 left-2 bg-slate-950/90 text-amber-400 font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
                Matched Master Box: {cardWidthMm} × {cardHeightMm} mm
              </div>
            </div>

            {/* Safety Confirmation Checkbox */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={reinsertConfirmed}
                  onChange={(e) => setReinsertConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">
                  I have reinserted the card/sheet into the Canon printer in the correct orientation.
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons for Back */}
          <div className="space-y-3 pt-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="w-full py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-slate-600" />
                <span>UPLOAD BACK</span>
              </button>

              <button
                type="button"
                disabled={!backHasImage}
                onClick={() => onPreviewSide('back')}
                className="w-full py-3 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4 text-slate-600" />
                <span>PREVIEW BACK</span>
              </button>
            </div>

            <button
              type="button"
              disabled={!backHasImage || !reinsertConfirmed}
              onClick={onDirectPrintBack}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <Printer className="w-5 h-5 stroke-[2.5]" />
              <span>PRINT BACK (ONLY BACK)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
