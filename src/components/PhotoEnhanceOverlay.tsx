import React, { useRef, useState, useEffect, useCallback } from 'react';
import { PhotoEnhanceSettings, CropState } from '../types';
import { applyPhotoEnhancementToCanvas } from '../utils/imageProcessing';
import { Move, CornerDownRight, Sparkles } from 'lucide-react';

interface PhotoEnhanceOverlayProps {
  photoEnhance: PhotoEnhanceSettings;
  onChange: (updated: PhotoEnhanceSettings) => void;
  sourceImageUrl: string | null;
  crop: CropState;
  globalBrightness: number;
  globalContrast: number;
  containerWidth: number;
  containerHeight: number;
  isComparing: boolean;
  isActive: boolean;
}

export const PhotoEnhanceOverlay: React.FC<PhotoEnhanceOverlayProps> = ({
  photoEnhance,
  onChange,
  sourceImageUrl,
  crop,
  globalBrightness,
  globalContrast,
  containerWidth,
  containerHeight,
  isComparing,
  isActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { region } = photoEnhance;

  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startRegion, setStartRegion] = useState({ ...region });

  // Update canvas preview when photo settings, image, crop, or dimensions change
  const renderEnhancedPreview = useCallback(() => {
    if (!sourceImageUrl || !canvasRef.current || containerWidth <= 0 || containerHeight <= 0) return;

    const canvas = canvasRef.current;
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, containerWidth, containerHeight);

    if (isComparing || !photoEnhance.enabled) {
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Recreate exact card transform on this preview canvas
      ctx.translate(containerWidth / 2, containerHeight / 2);
      ctx.translate(crop.x * (containerWidth / 100), crop.y * (containerHeight / 100));
      ctx.rotate((crop.rotation * Math.PI) / 180);

      const scaleX = (crop.flipH ? -1 : 1) * crop.zoom;
      const scaleY = (crop.flipV ? -1 : 1) * crop.zoom;
      ctx.scale(scaleX, scaleY);

      // Fit to container aspect
      const targetAspect = containerWidth / containerHeight;
      const imgAspect = img.width / img.height;
      let drawW: number;
      let drawH: number;

      if (imgAspect > targetAspect) {
        drawW = containerWidth;
        drawH = containerWidth / imgAspect;
      } else {
        drawH = containerHeight;
        drawW = containerHeight * imgAspect;
      }

      ctx.filter = `brightness(${globalBrightness}%) contrast(${globalContrast}%)`;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Reset filter before applying pixel enhancement
      ctx.filter = 'none';

      // Apply the photo enhancement specifically to the photo box!
      applyPhotoEnhancementToCanvas(ctx, containerWidth, containerHeight, photoEnhance);

      // Now clip ONLY the photo region on this canvas so only the enhanced photo is drawn over the card
      // (This guarantees 0 interference with any area outside the box)
      const px = Math.round((region.x / 100) * containerWidth);
      const py = Math.round((region.y / 100) * containerHeight);
      const pw = Math.round((region.width / 100) * containerWidth);
      const ph = Math.round((region.height / 100) * containerHeight);

      // Extract enhanced photo data
      const photoImageData = ctx.getImageData(px, py, pw, ph);

      // Clear whole canvas and only put the enhanced photo region back
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      ctx.putImageData(photoImageData, px, py);
    };
    img.src = sourceImageUrl;
  }, [
    sourceImageUrl,
    crop,
    globalBrightness,
    globalContrast,
    containerWidth,
    containerHeight,
    photoEnhance,
    region,
    isComparing,
  ]);

  useEffect(() => {
    renderEnhancedPreview();
  }, [renderEnhancedPreview]);

  // Handle Drag to Move Photo Box
  const handleBoxMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMoving(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRegion({ ...region });
  };

  // Handle Resize Corner Drag
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRegion({ ...region });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isMoving) {
        const dxPercent = ((e.clientX - startPos.x) / containerWidth) * 100;
        const dyPercent = ((e.clientY - startPos.y) / containerHeight) * 100;

        const newX = Math.max(0, Math.min(100 - startRegion.width, startRegion.x + dxPercent));
        const newY = Math.max(0, Math.min(100 - startRegion.height, startRegion.y + dyPercent));

        onChange({
          ...photoEnhance,
          region: {
            ...region,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          },
        });
      } else if (isResizing) {
        const dxPercent = ((e.clientX - startPos.x) / containerWidth) * 100;
        const dyPercent = ((e.clientY - startPos.y) / containerHeight) * 100;

        const newW = Math.max(10, Math.min(100 - startRegion.x, startRegion.width + dxPercent));
        const newH = Math.max(10, Math.min(100 - startRegion.y, startRegion.height + dyPercent));

        onChange({
          ...photoEnhance,
          region: {
            ...region,
            width: Math.round(newW * 10) / 10,
            height: Math.round(newH * 10) / 10,
          },
        });
      }
    };

    const handleMouseUp = () => {
      setIsMoving(false);
      setIsResizing(false);
    };

    if (isMoving || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMoving, isResizing, startPos, startRegion, containerWidth, containerHeight, photoEnhance, region, onChange]);

  return (
    <>
      {/* Real-time Enhanced Photo Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-150"
        style={{ opacity: isComparing ? 0 : 1 }}
      />

      {/* Interactive Photo Selection Bounding Box (Shown when active) */}
      {isActive && (
        <div
          onMouseDown={handleBoxMouseDown}
          className="absolute z-20 cursor-move border-2 border-amber-400 bg-amber-400/10 rounded shadow-md group transition-colors select-none"
          style={{
            left: `${region.x}%`,
            top: `${region.y}%`,
            width: `${region.width}%`,
            height: `${region.height}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 0 16px rgba(251, 191, 36, 0.4)',
          }}
        >
          {/* Top Label Tag */}
          <div className="absolute -top-6 left-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap pointer-events-none">
            <Sparkles className="w-3 h-3" />
            <span>Profile Photo Box</span>
          </div>

          {/* Center Move Icon hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-75 transition pointer-events-none">
            <div className="bg-slate-950/80 text-amber-300 p-1.5 rounded-full border border-amber-400/40">
              <Move className="w-4 h-4" />
            </div>
          </div>

          {/* Corner Guides */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white pointer-events-none" />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white pointer-events-none" />

          {/* Interactive Resize Handle (Bottom-Right) */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute -bottom-2 -right-2 w-5 h-5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full shadow-lg border-2 border-white cursor-nwse-resize flex items-center justify-center transition"
            title="Drag to resize photo box"
          >
            <CornerDownRight className="w-2.5 h-2.5" />
          </div>
        </div>
      )}
    </>
  );
};
