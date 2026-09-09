import React from 'react';
import { PhotoEnhanceSettings, PhotoRegion } from '../types';
import {
  Sun,
  Contrast,
  Sparkles,
  Zap,
  RotateCcw,
  Eye,
  Sliders,
  Maximize2,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface PhotoEnhancerPanelProps {
  photoEnhance: PhotoEnhanceSettings;
  onChange: (updated: PhotoEnhanceSettings) => void;
  isComparing: boolean;
  setIsComparing: (val: boolean) => void;
}

export const PhotoEnhancerPanel: React.FC<PhotoEnhancerPanelProps> = ({
  photoEnhance,
  onChange,
  isComparing,
  setIsComparing,
}) => {
  const {
    enabled,
    region,
    brightness = 0,
    contrast = 0,
    highlights = 0,
    shadows = 0,
    sharpness = 0,
    warmth = 0,
    saturation = 0,
    feather = 8,
  } = photoEnhance;

  // Presets
  const applyPreset = (preset: 'auto' | 'shadows' | 'sharp' | 'warm' | 'reset') => {
    switch (preset) {
      case 'auto':
        onChange({
          ...photoEnhance,
          enabled: true,
          shadows: 35,
          brightness: 16,
          contrast: 15,
          highlights: 5,
          sharpness: 35,
          warmth: 10,
          saturation: 12,
          feather: 8,
        });
        break;
      case 'shadows':
        onChange({
          ...photoEnhance,
          enabled: true,
          shadows: 55,
          brightness: 22,
          contrast: 12,
          highlights: -5,
          sharpness: 25,
          warmth: 8,
          saturation: 8,
          feather: 8,
        });
        break;
      case 'sharp':
        onChange({
          ...photoEnhance,
          enabled: true,
          sharpness: 60,
          contrast: 22,
          highlights: 10,
          brightness: 8,
          shadows: 15,
          warmth: 5,
          saturation: 10,
          feather: 6,
        });
        break;
      case 'warm':
        onChange({
          ...photoEnhance,
          enabled: true,
          warmth: 28,
          saturation: 25,
          brightness: 12,
          shadows: 20,
          contrast: 10,
          sharpness: 20,
          highlights: 0,
          feather: 8,
        });
        break;
      case 'reset':
        onChange({
          ...photoEnhance,
          brightness: 0,
          contrast: 0,
          highlights: 0,
          shadows: 0,
          sharpness: 0,
          warmth: 0,
          saturation: 0,
        });
        break;
    }
  };

  // Position Presets
  const setPositionPreset = (type: 'aadhaar_left' | 'voter_right' | 'pan_center' | 'square') => {
    let newRegion: PhotoRegion;
    switch (type) {
      case 'aadhaar_left':
        newRegion = { x: 6, y: 18, width: 28, height: 52 };
        break;
      case 'voter_right':
        newRegion = { x: 66, y: 18, width: 28, height: 52 };
        break;
      case 'pan_center':
        newRegion = { x: 7, y: 22, width: 26, height: 46 };
        break;
      case 'square':
        newRegion = { x: 8, y: 20, width: 24, height: 38 };
        break;
    }
    onChange({
      ...photoEnhance,
      enabled: true,
      region: newRegion,
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <div>
            <span className="font-bold text-slate-800 block text-xs">Clarify Profile Photo Only</span>
            <span className="text-[10px] text-slate-500">Applies only to face; card text stays 100% crisp</span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange({ ...photoEnhance, enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
        </label>
      </div>

      {/* One-Click Magic Presets */}
      <div>
        <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-700">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> 1-Click Face Presets
          </span>
          <button
            type="button"
            onClick={() => applyPreset('reset')}
            className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('auto')}
            className="flex items-center gap-1.5 p-2 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg text-amber-950 font-bold text-left transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div>
              <span className="block text-[11px]">Auto Smart Clarify</span>
              <span className="block text-[9px] font-normal text-amber-800/80">Balanced Aadhaar face fix</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('shadows')}
            className="flex items-center gap-1.5 p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-left transition"
          >
            <Sun className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <div>
              <span className="block text-[11px]">Lift Dark Shadows</span>
              <span className="block text-[9px] font-normal text-slate-500">Dark webcam photo fix</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('sharp')}
            className="flex items-center gap-1.5 p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-left transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <div>
              <span className="block text-[11px]">Ultra Crisp Details</span>
              <span className="block text-[9px] font-normal text-slate-500">Sharp eyes, hair &amp; edges</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('warm')}
            className="flex items-center gap-1.5 p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-left transition"
          >
            <Smile className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <div>
              <span className="block text-[11px]">Warm Skin Glow</span>
              <span className="block text-[9px] font-normal text-slate-500">Natural tone for plastic</span>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Box Position Placement */}
      <div className="pt-2 border-t border-slate-200">
        <span className="block mb-1.5 font-semibold text-slate-700 flex items-center gap-1">
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" /> Photo Box Position Presets
        </span>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setPositionPreset('aadhaar_left')}
            className="py-1 px-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 text-[10px] font-medium text-slate-700 truncate"
            title="Aadhaar / Standard Left Photo"
          >
            Aadhaar (Left)
          </button>
          <button
            type="button"
            onClick={() => setPositionPreset('voter_right')}
            className="py-1 px-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 text-[10px] font-medium text-slate-700 truncate"
            title="Voter / Modern Right Photo"
          >
            Voter (Right)
          </button>
          <button
            type="button"
            onClick={() => setPositionPreset('pan_center')}
            className="py-1 px-1.5 bg-white border border-slate-200 rounded hover:bg-slate-50 text-[10px] font-medium text-slate-700 truncate"
            title="PAN Card Photo"
          >
            PAN Card
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          💡 You can also drag the photo box and pull the bottom-right corner directly on the card!
        </p>
      </div>

      {/* Fine-Tuning Sliders */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-600" /> Fine-Tune Photo Tones
          </span>
        </div>

        {/* 1. Shadows Lift (Crucial for dark webcam/ID face photos) */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <span>☀️ Shadows (Lift Dark Face)</span>
            </span>
            <span className={`font-mono text-[10px] font-bold ${shadows > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {shadows > 0 ? `+${shadows}` : shadows}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            step="2"
            value={shadows}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, shadows: parseInt(e.target.value) })}
            className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
          <span className="text-[9px] text-slate-500 block">Lifts dark tones under eyes &amp; chin without washing out card</span>
        </div>

        {/* 2. Brightness */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-500" /> Photo Brightness
            </span>
            <span className={`font-mono text-[10px] font-bold ${brightness !== 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {brightness > 0 ? `+${brightness}` : brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="2"
            value={brightness}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, brightness: parseInt(e.target.value) })}
            className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* 3. Contrast */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Contrast className="w-3 h-3 text-indigo-500" /> Photo Contrast
            </span>
            <span className={`font-mono text-[10px] font-bold ${contrast !== 0 ? 'text-indigo-600' : 'text-slate-500'}`}>
              {contrast > 0 ? `+${contrast}` : contrast}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="2"
            value={contrast}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, contrast: parseInt(e.target.value) })}
            className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* 4. Highlights */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700">Highlights</span>
            <span className={`font-mono text-[10px] font-bold ${highlights !== 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {highlights > 0 ? `+${highlights}` : highlights}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            step="2"
            value={highlights}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, highlights: parseInt(e.target.value) })}
            className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
          <span className="text-[9px] text-slate-500 block">Controls bright forehead/cheek reflections</span>
        </div>

        {/* 5. Clarity / Sharpness */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700">🔍 Clarity &amp; Sharpness</span>
            <span className={`font-mono text-[10px] font-bold ${sharpness > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
              +{sharpness}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="2"
            value={sharpness}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, sharpness: parseInt(e.target.value) })}
            className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
          <span className="text-[9px] text-slate-500 block">Recovers crisp eye, hair, and face contours from blurry scans</span>
        </div>

        {/* 6. Skin Warmth */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700">🎨 Skin Warmth</span>
            <span className={`font-mono text-[10px] font-bold ${warmth !== 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {warmth > 0 ? `+${warmth}` : warmth}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="70"
            step="2"
            value={warmth}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, warmth: parseInt(e.target.value) })}
            className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
          <span className="text-[9px] text-slate-500 block">Eliminates dull greenish/pale tint for natural skin</span>
        </div>

        {/* 7. Saturation */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700">Skin Vibrancy (Saturation)</span>
            <span className={`font-mono text-[10px] font-bold ${saturation !== 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {saturation > 0 ? `+${saturation}` : saturation}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="80"
            step="2"
            value={saturation}
            onChange={(e) => onChange({ ...photoEnhance, enabled: true, saturation: parseInt(e.target.value) })}
            className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
        </div>

        {/* 8. Seamless Edge Softening (Feather) */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-0.5">
            <span className="font-semibold text-slate-700">Edge Feather (Soft Blend)</span>
            <span className="font-mono text-[10px] font-bold text-slate-600">{feather}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="1"
            value={feather}
            onChange={(e) => onChange({ ...photoEnhance, feather: parseInt(e.target.value) })}
            className="w-full accent-slate-600 h-1.5 bg-slate-200 rounded cursor-pointer"
          />
          <span className="text-[9px] text-slate-500 block">Seamlessly blends photo into card background</span>
        </div>
      </div>

      {/* Hold to Compare Button */}
      <div className="pt-2">
        <button
          type="button"
          onMouseDown={() => setIsComparing(true)}
          onMouseUp={() => setIsComparing(false)}
          onMouseLeave={() => setIsComparing(false)}
          onTouchStart={() => setIsComparing(true)}
          onTouchEnd={() => setIsComparing(false)}
          className="w-full py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer select-none active:bg-amber-200"
        >
          <Eye className="w-4 h-4 text-slate-600" />
          <span>{isComparing ? 'Showing Original (Holding...)' : 'Press & Hold to Compare Original'}</span>
        </button>
      </div>
    </div>
  );
};
