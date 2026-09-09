import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  FileText,
  KeyRound,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';

interface PdfPasswordModalProps {
  isOpen: boolean;
  fileName: string;
  fileSize?: number;
  side: 'front' | 'back';
  isIncorrect?: boolean;
  errorMessage?: string;
  isProcessing?: boolean;
  onUnlock: (password: string) => void;
  onCancel: () => void;
}

export const PdfPasswordModal: React.FC<PdfPasswordModalProps> = ({
  isOpen,
  fileName,
  fileSize,
  side,
  isIncorrect = false,
  errorMessage,
  isProcessing = false,
  onUnlock,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isIncorrect]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isProcessing) return;
    onUnlock(password);
  };

  const handleMakeUppercase = () => {
    setPassword((prev) => prev.toUpperCase());
    inputRef.current?.focus();
  };

  const formattedSize = fileSize
    ? fileSize < 1024 * 1024
      ? `${(fileSize / 1024).toFixed(0)} KB`
      : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
    : null;

  return (
    <div
      id="pdf-password-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onCancel();
      }}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950/10 flex items-center justify-center border border-slate-950/15">
              <Lock className="w-5 h-5 text-slate-950 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">Password-Protected PDF</h3>
              <p className="text-xs text-slate-900/80 font-medium">Enter document password to unlock</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-900/70 hover:text-slate-950 hover:bg-slate-950/10 transition disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* File Info Card */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate" title={fileName}>
                  {fileName}
                </p>
                {formattedSize && <p className="text-[11px] text-slate-500">{formattedSize}</p>}
              </div>
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                side === 'front'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {side === 'front' ? 'Front Side' : 'Back Side'}
            </span>
          </div>

          {/* Incorrect Password Error Notice */}
          {isIncorrect && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Incorrect Password</p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  {errorMessage ||
                    'The password you entered did not unlock this PDF. Please check Caps Lock, spelling, or birth year and try again.'}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="pdf-password-input"
                  className="block text-xs font-bold text-slate-700 flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Document Password:</span>
                </label>
                {password && /[a-z]/.test(password) && (
                  <button
                    type="button"
                    onClick={handleMakeUppercase}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Convert to UPPERCASE (A-Z)</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  id="pdf-password-input"
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Enter password (e.g. ANAS1995)"
                  className={`w-full py-2.5 pl-3.5 pr-20 bg-white rounded-xl border text-sm font-mono tracking-wide text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition ${
                    isIncorrect
                      ? 'border-red-400 ring-2 ring-red-400/20'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {password && (
                    <button
                      type="button"
                      onClick={() => {
                        setPassword('');
                        inputRef.current?.focus();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-500 hover:text-slate-700 rounded transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Indian Govt IDs Password Hint Box */}
            <div className="bg-amber-50/60 rounded-xl border border-amber-200/70 p-3 space-y-2">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowHelp(!showHelp)}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Common ID Password Formats:</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-800 hover:underline">
                  {showHelp ? 'Hide' : 'Show Help'}
                </span>
              </div>

              {showHelp && (
                <div className="space-y-2 text-[11px] text-slate-700 pt-1 border-t border-amber-200/60 font-sans">
                  <div className="bg-white/80 p-2 rounded-lg border border-amber-100 space-y-0.5">
                    <span className="font-bold text-amber-950 block">UIDAI e-Aadhaar Format:</span>
                    <p className="text-slate-600 leading-snug">
                      First <strong>4 letters of your Name</strong> in <strong>CAPITAL LETTERS</strong> +{' '}
                      <strong>4-digit Year of Birth</strong> (YYYY).
                    </p>
                    <p className="text-amber-900 font-mono text-[10px] font-semibold mt-0.5">
                      Example: ANAS KHAN born in 1995 → <span className="bg-amber-100 px-1 py-0.5 rounded">ANAS1995</span>
                    </p>
                    <p className="text-amber-900 font-mono text-[10px] font-semibold">
                      Example: RIA SHARMA born in 2002 → <span className="bg-amber-100 px-1 py-0.5 rounded">RIA2002</span>
                    </p>
                  </div>

                  <div className="bg-white/80 p-2 rounded-lg border border-amber-100 space-y-0.5">
                    <span className="font-bold text-amber-950 block">Income Tax e-PAN Card Format:</span>
                    <p className="text-slate-600 leading-snug">
                      Full Date of Birth in <strong>DDMMYYYY</strong> format without slashes or hyphens.
                    </p>
                    <p className="text-amber-900 font-mono text-[10px] font-semibold mt-0.5">
                      Example: 15-Aug-1995 → <span className="bg-amber-100 px-1 py-0.5 rounded">15081995</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!password.trim() || isProcessing}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-black rounded-xl text-xs shadow-sm flex items-center gap-2 transition"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Unlocking PDF...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-slate-950 stroke-[2.2]" />
                    <span>Unlock &amp; Upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
