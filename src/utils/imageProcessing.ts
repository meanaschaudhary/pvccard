import { CardSideData, CropState } from '../types';

export function createBlankCardSide(): CardSideData {
  return {
    originalFile: null,
    fileName: null,
    fileType: null,
    sourceImageUrl: null,
    croppedImageUrl: null,
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
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renders the image with crop, rotation, flips, and filters to a high-resolution PNG data URL.
 * Preserves high DPI (e.g., minimum 1600x1000 for standard 80x50 card, which is > 500 DPI).
 */
export async function renderHighResCardImage(
  sourceUrl: string,
  crop: CropState,
  cardWidthMm: number,
  cardHeightMm: number,
  brightness: number = 100,
  contrast: number = 100
): Promise<string> {
  const img = await loadImage(sourceUrl);

  // Target high-definition dimensions based on mm. 1mm approx 11.81 pixels at 300 DPI.
  // Using ~400 DPI scale: 80mm * 15.75 = ~1260px, 50mm * 15.75 = ~788px.
  // Minimum target canvas width: 1600px.
  const targetAspect = cardWidthMm / cardHeightMm;
  const targetWidth = Math.max(1600, Math.round(cardWidthMm * 20));
  const targetHeight = Math.round(targetWidth / targetAspect);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill pure white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Apply filters
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

  ctx.save();

  // Move to center of output canvas
  ctx.translate(targetWidth / 2, targetHeight / 2);

  // Apply pan offsets (normalized)
  ctx.translate(crop.x * (targetWidth / 100), crop.y * (targetHeight / 100));

  // Apply rotation
  ctx.rotate((crop.rotation * Math.PI) / 180);

  // Apply flips
  const scaleX = (crop.flipH ? -1 : 1) * crop.zoom;
  const scaleY = (crop.flipV ? -1 : 1) * crop.zoom;
  ctx.scale(scaleX, scaleY);

  // Compute base drawing scale to fit image appropriately
  // Default: fit to container
  const imgAspect = img.width / img.height;
  let drawW: number;
  let drawH: number;

  if (imgAspect > targetAspect) {
    // Image is wider than card
    drawW = targetWidth;
    drawH = targetWidth / imgAspect;
  } else {
    // Image is taller than card
    drawH = targetHeight;
    drawW = targetHeight * imgAspect;
  }

  // Draw centered
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  return canvas.toDataURL('image/png', 1.0);
}
