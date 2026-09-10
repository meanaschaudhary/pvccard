import React, { useRef, useState, useEffect } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Unlock,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  RefreshCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Layers,
  Sparkles,
  Sliders,
  Crop,
} from 'lucide-react';
import { CardSideData, CropState, PhotoEnhanceSettings } from '../types';
import { renderHighResCardImage, createDefaultPhotoEnhance } from '../utils/imageProcessing';
import { loadPdfDocument, renderPdfPageToDataUrl } from '../utils/pdfHelper';
import { PhotoEnhanceOverlay } from './PhotoEnhanceOverlay';
import { PhotoEnhancerPanel } from './PhotoEnhancerPanel';

interface CardEditorProps {
  side: 'front' | 'back';
  cardData: CardSideData;
  cardWidthMm: number;
  cardHeightMm: number;
  initialTab?: 'crop' | 'photo_enhance';
  onUpdateCardData: (updated: Partial<CardSideData>) => void;
  onApplyCrop: (highResDataUrl: string) => void;
  onSwitchSide?: (side: 'front' | 'back') => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  side,
  cardData,
  cardWidthMm,
  cardHeightMm,
  initialTab = 'crop',
  onUpdateCardData,
  onApplyCrop,
  onSwitchSide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = useState<'crop' | 'photo_enhance'>(initialTab);
  const [isComparing, setIsComparing] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 540, height: 337 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { crop, brightness, contrast, sourceImageUrl, fileName, fileType, pdfNumPages, selectedPdfPage } = cardData;
  const photoEnhance = cardData.photoEnhance || createDefaultPhotoEnhance();

  const targetAspect = cardWidthMm / cardHeightMm;

  // Measure container dimensions for pixel-accurate photo overlay
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      if (containerRef.current) {
        setContainerDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [sourceImageUrl]);

  // Handle PDF page change if document is PDF
  const handlePdfPageChange = async (newPage: number) => {
    if (!cardData.originalFile || cardData.fileType !== 'pdf') return;
    try {
      setPdfLoading(true);
      let doc = pdfDoc;
      if (!doc) {
        const info = await loadPdfDocument(cardData.originalFile, cardData.pdfPassword);
        doc = info.pdfDoc;
        setPdfDoc(doc);
      }
      const rendered = await renderPdfPageToDataUrl(doc, newPage, 4.0);
      onUpdateCardData({
        sourceImageUrl: rendered.dataUrl,
        selectedPdfPage: newPage,
      });
    } catch (err) {
      console.error('Error changing PDF page', err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Drag to pan logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sourceImageUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sourceImageUrl) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    // Sensitivity factor relative to zoom
    const factor = 0.25 / Math.max(0.5, crop.zoom);
    onUpdateCardData({
      crop: {
        ...crop,
        x: crop.x + dx * factor,
        y: crop.y + dy * factor,
      },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom wheel (smooth scaling up to 2500% / 25x for full A4 PDF documents)
  const handleWheel = (e: React.WheelEvent) => {
    if (!sourceImageUrl || editorMode === 'photo_enhance') return;
    e.preventDefault();
    // Dynamic wheel step scaling: smooth at low zoom, faster at high zoom
    const zoomStep = Math.max(0.08, crop.zoom * 0.08);
    const zoomDelta = e.deltaY < 0 ? zoomStep : -zoomStep;
    const newZoom = Math.min(25, Math.max(0.2, crop.zoom + zoomDelta));
    onUpdateCardData({
      crop: {
        ...crop,
        zoom: Number(newZoom.toFixed(2)),
      },
    });
  };

  const handleZoomChange = (val: number) => {
    const clamped = Math.min(25, Math.max(0.2, Number(val.toFixed(2))));
    onUpdateCardData({
      crop: {
        ...crop,
        zoom: clamped,
      },
    });
  };

  const handleRotate = () => {
    onUpdateCardData({
      crop: {
        ...crop,
        rotation: (crop.rotation + 90) % 360,
      },
    });
  };

  const handleFlipH = () => {
    onUpdateCardData({
      crop: {
        ...crop,
        flipH: !crop.flipH,
      },
    });
  };

  const handleFlipV = () => {
    onUpdateCardData({
      crop: {
        ...crop,
        flipV: !crop.flipV,
      },
    });
  };

  const handleReset = () => {
    onUpdateCardData({
      crop: {
        x: 0,
        y: 0,
        zoom: 1,
        rotation: 0,
        flipH: false,
        flipV: false,
        aspectRatioLocked: true,
      },
      brightness: 100,
      contrast: 100,
      photoEnhance: createDefaultPhotoEnhance(),
    });
  };

  const handleSaveCrop = async () => {
    if (!sourceImageUrl) return;
    setIsProcessing(true);
    try {
      const highRes = await renderHighResCardImage(
        sourceImageUrl,
        crop,
        cardWidthMm,
        cardHeightMm,
        brightness,
        contrast,
        photoEnhance
      );
      onApplyCrop(highRes);
    } catch (err) {
      console.error('Failed to render cropped card', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {onSwitchSide && (
            <div className="inline-flex rounded-lg bg-slate-200 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onSwitchSide('front')}
                className={`px-3 py-1 rounded-md transition ${
                  side === 'front' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Front Side
              </button>
              <button
                type="button"
                onClick={() => onSwitchSide('back')}
                className={`px-3 py-1 rounded-md transition ${
                  side === 'back' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Back Side
              </button>
            </div>
          )}

          {/* Editor Mode Switcher (Framing vs Photo Clarifier) */}
          <div className="inline-flex rounded-lg bg-slate-200 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setEditorMode('crop')}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                editorMode === 'crop'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crop className="w-3.5 h-3.5 text-slate-500" />
              <span>Card Framing &amp; Crop</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditorMode('photo_enhance');
                if (!photoEnhance.enabled) {
                  onUpdateCardData({
                    photoEnhance: {
                      ...photoEnhance,
                      enabled: true,
                    },
                  });
                }
              }}
              className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                editorMode === 'photo_enhance'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>✨ Clear Profile Photo Only</span>
            </button>
          </div>

          <div>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              ({cardWidthMm} × {cardHeightMm} mm • {targetAspect.toFixed(2)}:1)
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
          <button
            type="button"
            disabled={!sourceImageUrl || isProcessing}
            onClick={handleSaveCrop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 rounded-md shadow-sm transition"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'Processing High-Res...' : 'Apply & Save'}</span>
          </button>
        </div>
      </div>

      {/* PDF Page Selector Bar (if PDF) */}
      {fileType === 'pdf' && (pdfNumPages || 1) > 1 && (
        <div className="bg-amber-50/70 px-4 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Multi-Page PDF Detected:</span>
            <span>
              Page {selectedPdfPage || 1} of {pdfNumPages}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={(selectedPdfPage || 1) <= 1 || pdfLoading}
              onClick={() => handlePdfPageChange((selectedPdfPage || 1) - 1)}
              className="p-1 rounded bg-amber-100 hover:bg-amber-200 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-bold">
              {selectedPdfPage || 1}
            </span>
            <button
              disabled={(selectedPdfPage || 1) >= (pdfNumPages || 1) || pdfLoading}
              onClick={() => handlePdfPageChange((selectedPdfPage || 1) + 1)}
              className="p-1 rounded bg-amber-100 hover:bg-amber-200 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas & Crop Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        <div className="lg:col-span-3 bg-slate-900 p-6 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden select-none">
          {sourceImageUrl ? (
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`relative rounded-lg shadow-2xl overflow-hidden bg-slate-950 flex items-center justify-center transition-all ${
                editorMode === 'crop' ? 'cursor-grab active:cursor-grabbing border-2 border-amber-400/80' : 'border-2 border-slate-700'
              }`}
              style={{
                width: 'min(92%, 560px)',
                aspectRatio: `${targetAspect}`,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
              }}
            >
              {/* Actual Scaled Image */}
              <div
                className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75 ease-out pointer-events-none"
                style={{
                  transform: `translate(${crop.x}%, ${crop.y}%) rotate(${crop.rotation}deg) scale(${
                    (crop.flipH ? -1 : 1) * crop.zoom
                  }, ${(crop.flipV ? -1 : 1) * crop.zoom})`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
              >
                <img
                  src={sourceImageUrl}
                  alt="Card Preview"
                  className="max-w-none w-full h-full object-contain pointer-events-none"
                />
              </div>

              {/* Profile Photo Enhancement Overlay & Bounding Box */}
              <PhotoEnhanceOverlay
                photoEnhance={photoEnhance}
                onChange={(updated) => onUpdateCardData({ photoEnhance: updated })}
                sourceImageUrl={sourceImageUrl}
                crop={crop}
                globalBrightness={brightness}
                globalContrast={contrast}
                containerWidth={containerDimensions.width}
                containerHeight={containerDimensions.height}
                isComparing={isComparing}
                isActive={editorMode === 'photo_enhance'}
              />

              {/* Exact Physical Bounding Box Overlay & Crosshairs (in Crop mode) */}
              {editorMode === 'crop' && (
                <div className="absolute inset-0 pointer-events-none border border-dashed border-amber-300/60 rounded-lg">
                  {/* 3x3 Grid Guidelines for Alignment */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                    <div className="border-r border-b border-amber-300" />
                    <div className="border-r border-b border-amber-300" />
                    <div className="border-b border-amber-300" />
                    <div className="border-r border-b border-amber-300" />
                    <div className="border-r border-b border-amber-300" />
                    <div className="border-b border-amber-300" />
                    <div className="border-r border-amber-300" />
                    <div className="border-r border-amber-300" />
                    <div />
                  </div>

                  {/* Center Crosshair */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-amber-400/70" />
                    <div className="h-full w-0.5 bg-amber-400/70 absolute" />
                  </div>

                  {/* Physical Dimensions Pill */}
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    Master Box: {cardWidthMm} × {cardHeightMm} mm
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12 px-6">
              <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">No document image loaded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Please upload an ID card scan, photo, or PDF document, or click "Load Demo Cards" to test.
              </p>
            </div>
          )}

          {/* Bottom navigation hint */}
          <div className="absolute bottom-2 left-4 text-[11px] text-slate-400 flex items-center gap-3">
            {editorMode === 'crop' ? (
              <>
                <span>🖱️ Drag to pan</span>
                <span>⚲ Scroll to zoom</span>
                <span>⤾ Rotate in sidebar</span>
              </>
            ) : (
              <>
                <span className="text-amber-400 font-semibold">✨ Photo Clarifier Active</span>
                <span>🖱️ Drag box to place face</span>
                <span>↘ Drag corner to resize</span>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-1 p-4 bg-slate-50/80 border-l border-slate-200 flex flex-col justify-between space-y-4 text-xs overflow-y-auto max-h-[640px]">
          {editorMode === 'photo_enhance' ? (
            /* Dedicated Profile Photo Enhancer Panel */
            <PhotoEnhancerPanel
              photoEnhance={photoEnhance}
              onChange={(updated) => onUpdateCardData({ photoEnhance: updated })}
              isComparing={isComparing}
              setIsComparing={setIsComparing}
            />
          ) : (
            /* Standard Card Framing & Cropping Controls */
            <div className="space-y-4">
              {/* Ultra High-Capacity Zoom Controls (up to 2500% / 25x for full A4 PDF documents) */}
              <div>
                <div className="flex justify-between items-center mb-1 text-slate-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-slate-500" /> Zoom Level (Up to 2500%)
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="20"
                      max="2500"
                      step="10"
                      value={Math.round(crop.zoom * 100)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          handleZoomChange(val / 100);
                        }
                      }}
                      className="w-16 px-1.5 py-0.5 text-right font-mono text-[11px] font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="font-mono text-[11px] text-slate-600">%</span>
                    {crop.zoom !== 1 && (
                      <button
                        type="button"
                        onClick={() => handleZoomChange(1.0)}
                        className="text-[10px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded font-semibold transition"
                        title="Reset zoom to 100%"
                      >
                        100%
                      </button>
                    )}
                  </div>
                </div>

                {/* Slider + Step Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const step = crop.zoom >= 5 ? 1.0 : crop.zoom >= 2 ? 0.5 : 0.1;
                      handleZoomChange(Math.max(0.2, crop.zoom - step));
                    }}
                    className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 active:bg-slate-200"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <input
                    type="range"
                    min="0.2"
                    max="25"
                    step={crop.zoom >= 5 ? '0.2' : '0.05'}
                    value={crop.zoom}
                    onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const step = crop.zoom >= 5 ? 1.0 : crop.zoom >= 2 ? 0.5 : 0.1;
                      handleZoomChange(Math.min(25, crop.zoom + step));
                    }}
                    className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 active:bg-slate-200"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>

                {/* Quick 1-Click Zoom Presets for PDFs */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  {[
                    { label: '100%', val: 1.0 },
                    { label: '250%', val: 2.5 },
                    { label: '500%', val: 5.0 },
                    { label: '800%', val: 8.0 },
                    { label: '1200%', val: 12.0 },
                    { label: '1600%', val: 16.0 },
                    { label: '2000%', val: 20.0 },
                    { label: '2500%', val: 25.0 },
                  ].map((p) => {
                    const isSelected = Math.abs(crop.zoom - p.val) < 0.05;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => handleZoomChange(p.val)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <span className="block text-[10px] text-slate-400 mt-1">
                  💡 High-capacity zoom (up to <strong>2500% / 25×</strong>) for cropping small card sections from full A4 PDFs.
                </span>
              </div>

              {/* Rotation & Flips */}
              <div>
                <span className="block mb-1.5 font-semibold text-slate-700">Orientation &amp; Flips</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white border border-slate-200 rounded hover:bg-slate-100 font-medium text-slate-700 transition"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>+90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFlipH}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded font-medium transition ${
                      crop.flipH
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Flip Horizontally"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>Flip H</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleFlipV}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 border rounded font-medium transition ${
                      crop.flipV
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    title="Flip Vertically"
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                    <span>Flip V</span>
                  </button>
                </div>
              </div>

              {/* Global Image Tuning (Brightness / Contrast for entire card) */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="block font-semibold text-slate-700">Whole Card Scan Tuning</span>
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-600 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Whole Card Brightness
                    </span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    step="5"
                    value={brightness}
                    onChange={(e) => onUpdateCardData({ brightness: parseInt(e.target.value) })}
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-600 mb-0.5">
                    <span className="flex items-center gap-1">
                      <Contrast className="w-3 h-3 text-indigo-500" /> Whole Card Contrast
                    </span>
                    <span className="font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="140"
                    step="5"
                    value={contrast}
                    onChange={(e) => onUpdateCardData({ contrast: parseInt(e.target.value) })}
                    className="w-full accent-amber-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Switch to Photo Enhancer callout banner */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-950 space-y-1">
                <div className="flex items-center gap-1 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Face / Photo looks dark?</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-tight">
                  Use the <strong>"Clear Profile Photo Only"</strong> tab above to brighten shadows and clarify facial details without washing out text!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditorMode('photo_enhance');
                    if (!photoEnhance.enabled) {
                      onUpdateCardData({
                        photoEnhance: {
                          ...photoEnhance,
                          enabled: true,
                        },
                      });
                    }
                  }}
                  className="w-full py-1 text-center font-bold text-[10px] bg-amber-600 hover:bg-amber-500 text-white rounded transition"
                >
                  Open Photo Clarifier
                </button>
              </div>

              {/* File Info */}
              {fileName && (
                <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700 block truncate" title={fileName}>
                    Source: {fileName}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Preserving 400+ DPI high resolution
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Primary Save Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={!sourceImageUrl || isProcessing}
              onClick={handleSaveCrop}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] disabled:bg-slate-300 text-white font-bold rounded-lg shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Processing High-Res...' : `Apply & Save to ${side === 'front' ? 'Front' : 'Back'}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
