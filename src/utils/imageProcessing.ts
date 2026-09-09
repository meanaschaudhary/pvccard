import { CardSideData, CropState, PhotoEnhanceSettings } from '../types';

export function createDefaultPhotoEnhance(): PhotoEnhanceSettings {
  return {
    enabled: false,
    region: {
      x: 6,
      y: 18,
      width: 28,
      height: 52,
    },
    brightness: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    sharpness: 0,
    warmth: 0,
    saturation: 0,
    feather: 8,
  };
}

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
    photoEnhance: createDefaultPhotoEnhance(),
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
 * Applies tone, shadow lift, highlight recovery, sharpness (clarity),
 * skin warmth, and edge feathering strictly to the specified profile photo region on the card.
 * Leaves the surrounding document, text, and barcodes untouched.
 */
export function applyPhotoEnhancementToCanvas(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  settings?: PhotoEnhanceSettings
) {
  if (!settings || !settings.enabled) return;

  const {
    region,
    brightness = 0,
    contrast = 0,
    highlights = 0,
    shadows = 0,
    sharpness = 0,
    warmth = 0,
    saturation = 0,
    feather = 8,
  } = settings;

  // Check if any adjustments are actually non-zero
  const hasAdjustments =
    brightness !== 0 ||
    contrast !== 0 ||
    highlights !== 0 ||
    shadows !== 0 ||
    sharpness !== 0 ||
    warmth !== 0 ||
    saturation !== 0;

  if (!hasAdjustments) return;

  // Compute exact pixel bounding box
  const px = Math.max(0, Math.min(canvasWidth - 10, Math.round((region.x / 100) * canvasWidth)));
  const py = Math.max(0, Math.min(canvasHeight - 10, Math.round((region.y / 100) * canvasHeight)));
  const pw = Math.max(10, Math.min(canvasWidth - px, Math.round((region.width / 100) * canvasWidth)));
  const ph = Math.max(10, Math.min(canvasHeight - py, Math.round((region.height / 100) * canvasHeight)));

  const imageData = ctx.getImageData(px, py, pw, ph);
  const data = imageData.data;
  const original = new Uint8ClampedArray(data);

  // Pre-calculate contrast factor (-100 to 100)
  const cFactor =
    contrast !== 0
      ? (259 * (contrast * 1.35 + 255)) / (255 * (259 - contrast * 1.35))
      : 1;

  // Pre-calculate feather in pixels based on box dimensions
  const featherPx = Math.max(1, Math.round((feather / 100) * Math.min(pw, ph) * 0.5));

  // First pass: Tone curve, shadows lift, highlights, brightness, contrast, skin warmth, saturation
  for (let i = 0; i < data.length; i += 4) {
    let r = original[i];
    let g = original[i + 1];
    let b = original[i + 2];

    // Perceptual luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // 1. Shadows Lift (brighten deep webcam/ID face shadows without blowing out light areas)
    if (shadows !== 0 && lum < 170) {
      const shadowWeight = Math.pow((170 - lum) / 170, 1.5);
      const shadowDelta = shadows * 1.2 * shadowWeight;
      r += shadowDelta;
      g += shadowDelta;
      b += shadowDelta;
    }

    // 2. Highlights Recovery / Boost
    if (highlights !== 0 && lum > 100) {
      const highlightWeight = Math.min(1, (lum - 100) / 155);
      const highlightDelta = highlights * 0.85 * highlightWeight;
      r += highlightDelta;
      g += highlightDelta;
      b += highlightDelta;
    }

    // 3. Brightness
    if (brightness !== 0) {
      const bDelta = brightness * 1.25;
      r += bDelta;
      g += bDelta;
      b += bDelta;
    }

    // 4. Contrast
    if (contrast !== 0) {
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;
    }

    // 5. Skin Warmth (adds healthy golden warmth, eliminates dull grayish/green webcam casts)
    if (warmth !== 0) {
      r += warmth * 0.45;
      b -= warmth * 0.45;
    }

    // 6. Saturation (boosts skin vibrancy)
    if (saturation !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const satMultiplier = 1 + saturation / 100;
      r = gray + (r - gray) * satMultiplier;
      g = gray + (g - gray) * satMultiplier;
      b = gray + (g - gray) * satMultiplier;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  // Second pass: Sharpness / Clarity using 3x3 unsharp convolution kernel
  if (sharpness > 0) {
    const sharpData = new Uint8ClampedArray(data);
    const amount = (sharpness / 100) * 0.65;
    const centerWeight = 1 + 4 * amount;

    for (let y = 1; y < ph - 1; y++) {
      for (let x = 1; x < pw - 1; x++) {
        const idx = (y * pw + x) * 4;
        const top = ((y - 1) * pw + x) * 4;
        const btm = ((y + 1) * pw + x) * 4;
        const left = (y * pw + (x - 1)) * 4;
        const right = (y * pw + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            sharpData[idx + c] * centerWeight -
            amount * (sharpData[top + c] + sharpData[btm + c] + sharpData[left + c] + sharpData[right + c]);
          data[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
        }
      }
    }
  }

  // Third pass: Seamless Feather / Edge Blending so there is never a harsh box border
  if (featherPx > 0) {
    for (let y = 0; y < ph; y++) {
      const distY = Math.min(y, ph - 1 - y);
      for (let x = 0; x < pw; x++) {
        const distX = Math.min(x, pw - 1 - x);
        const minDist = Math.min(distX, distY);

        if (minDist < featherPx) {
          const alpha = minDist / featherPx;
          const idx = (y * pw + x) * 4;
          for (let c = 0; c < 3; c++) {
            data[idx + c] = Math.round(alpha * data[idx + c] + (1 - alpha) * original[idx + c]);
          }
        }
      }
    }
  }

  // Put the enhanced pixels back onto the card canvas
  ctx.putImageData(imageData, px, py);
}

/**
 * Renders the image with crop, rotation, flips, and filters to a high-resolution PNG data URL.
 * Preserves high DPI (e.g., minimum 1600x1000 for standard 80x50 card, which is > 500 DPI).
 * Also applies the profile-photo-only clarifier if enabled.
 */
export async function renderHighResCardImage(
  sourceUrl: string,
  crop: CropState,
  cardWidthMm: number,
  cardHeightMm: number,
  brightness: number = 100,
  contrast: number = 100,
  photoEnhance?: PhotoEnhanceSettings
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

  // Apply global filters (if any)
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
  const imgAspect = img.width / img.height;
  let drawW: number;
  let drawH: number;

  if (imgAspect > targetAspect) {
    drawW = targetWidth;
    drawH = targetWidth / imgAspect;
  } else {
    drawH = targetHeight;
    drawW = targetHeight * imgAspect;
  }

  // Draw centered
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  ctx.restore();

  // Reset filter before applying pixel-level photo enhancement
  ctx.filter = 'none';

  // Apply specific profile photo enhancement if enabled
  if (photoEnhance?.enabled) {
    applyPhotoEnhancementToCanvas(ctx, targetWidth, targetHeight, photoEnhance);
  }

  return canvas.toDataURL('image/png', 1.0);
}
