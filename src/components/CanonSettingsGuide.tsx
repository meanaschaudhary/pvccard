import React from 'react';
import { X, CheckCircle2, AlertTriangle, Printer, Info, SlidersHorizontal, Sparkles } from 'lucide-react';

interface CanonSettingsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CanonSettingsGuide: React.FC<CanonSettingsGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Canon Printer Driver Setup Instructions</h3>
              <p className="text-xs text-slate-400">Essential settings for 100% accurate physical card printing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Limitation Notice */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm mb-1">Important Browser Limitation Notice</p>
              <p className="leading-relaxed">
                Your web browser cannot directly control all Canon printer hardware driver settings.
                After clicking <strong>PRINT FRONT</strong> or <strong>PRINT BACK</strong>, the system
                print dialog will appear. You MUST verify the following Canon settings to guarantee
                exact physical card dimensions.
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Required Canon Print Dialog Checklist</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Item 1 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Scale: Actual Size / 100%</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-normal">
                  Always choose <strong>Actual Size</strong> or manual <strong>100%</strong>. Never select
                  &quot;Fit to printable area&quot; or &quot;Shrink oversized pages&quot;.
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Margins: None (0 mm)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-normal">
                  In print settings, set Margins to <strong>None</strong> or <strong>Minimum</strong>.
                  Custom margins shift the card position.
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Media Type / Paper Type</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-normal">
                  Select <strong>Photo Paper Plus Glossy II</strong>, <strong>Other Glossy Paper</strong>,
                  or <strong>PVC Card Tray</strong> depending on your Canon model (G3000, TS707, etc.).
                </p>
              </div>

              {/* Item 4 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Print Quality: High</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-normal">
                  Set Print Quality to <strong>High</strong> or <strong>Fine</strong>. This ensures microtext,
                  Aadhaar QR codes, and barcodes scan instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Model specific notes */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
            <p className="font-bold text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Recommended Setup by Canon Model</span>
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-blue-900">
              <li>
                <strong>Canon TS707 / TS8370 / iP7270 with Multi-Purpose Tray:</strong> Use paper size &quot;Canon 2-Card Tray&quot; (130 × 220 mm) or Custom. Insert tray into disc guide until arrows meet.
              </li>
              <li>
                <strong>Canon G2000 / G2010 / G3000 / G3010 / G570 / G670:</strong> If using PVC Card Tray adapter kit, select rear tray feed. If using PVC Dragon / Sheet laminates on A4, select Glossy A4 paper.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
          >
            I Understand, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
