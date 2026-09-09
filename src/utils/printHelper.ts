import { AlignmentSettings, CalibrationSettings, BackFlipMode, PlacementMode } from '../types';

export interface PhysicalCardCoordinates {
  slotIndex: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  flipMode: BackFlipMode;
}

/**
 * Calculates physical millimeter print positions for each slot on the page.
 */
export function calculateSlotCoordinates(
  side: 'front' | 'back',
  alignment: AlignmentSettings,
  calibration: CalibrationSettings
): PhysicalCardCoordinates[] {
  const coordinates: PhysicalCardCoordinates[] = [];
  const {
    paperWidthMm,
    paperHeightMm,
    cardWidthMm,
    cardHeightMm,
    placementMode,
    centerOnPage,
    topMarginMm,
    originXMm,
    originYMm,
    multiCardLayout,
    backSheetFlipType,
    backFlipMode,
    backOffsetX,
    backOffsetY,
  } = alignment;

  const rows = multiCardLayout.enabled ? Math.max(1, multiCardLayout.rows) : 1;
  const cols = multiCardLayout.enabled ? Math.max(1, multiCardLayout.columns) : 1;
  const gapX = multiCardLayout.enabled ? multiCardLayout.gapXMm : 0;
  const gapY = multiCardLayout.enabled ? multiCardLayout.gapYMm : 0;

  const totalGridWidth = cols * cardWidthMm + (cols - 1) * gapX;
  const totalGridHeight = rows * cardHeightMm + (rows - 1) * gapY;

  // Placement mode calculation:
  // 'top_center': Centered horizontally on the page, positioned at the TOP (originYMm / topMarginMm)
  // 'page_center': Dead center of the entire sheet (both X and Y)
  // 'custom': Freehand X and Y millimeters
  let effectiveOriginX = originXMm;
  let effectiveOriginY = originYMm;

  const activeMode: PlacementMode = placementMode || (centerOnPage ? 'page_center' : 'custom');

  if (activeMode === 'top_center') {
    effectiveOriginX = Math.round(((paperWidthMm - totalGridWidth) / 2) * 10) / 10;
    effectiveOriginY = topMarginMm !== undefined ? topMarginMm : originYMm;
  } else if (activeMode === 'page_center') {
    effectiveOriginX = Math.round(((paperWidthMm - totalGridWidth) / 2) * 10) / 10;
    effectiveOriginY = Math.round(((paperHeightMm - totalGridHeight) / 2) * 10) / 10;
  }

  const scale = calibration.scaleCorrectionPct / 100.0;
  const finalWidthMm = cardWidthMm * scale;
  const finalHeightMm = cardHeightMm * scale;

  let slotIndex = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Base Front coordinates
      const frontX = effectiveOriginX + c * (cardWidthMm + gapX) + calibration.offsetX;
      const frontY = effectiveOriginY + r * (cardHeightMm + gapY) + calibration.offsetY;

      let xMm = frontX;
      let yMm = frontY;
      let flip: BackFlipMode = 'none';

      if (side === 'back') {
        flip = backFlipMode;
        if (backSheetFlipType === 'tray_same_coords') {
          // Dedicated Canon PVC tray: Card was flipped inside the tray slot, coordinates stay identical
          xMm = frontX + backOffsetX;
          yMm = frontY + backOffsetY;
        } else if (backSheetFlipType === 'flip_short_edge') {
          // Sheet flipped horizontally across short edge
          // The left side becomes the right side
          xMm = paperWidthMm - (frontX + cardWidthMm) + backOffsetX;
          yMm = frontY + backOffsetY;
        } else if (backSheetFlipType === 'flip_long_edge') {
          // Sheet flipped vertically across long edge
          // The top becomes the bottom
          xMm = frontX + backOffsetX;
          yMm = paperHeightMm - (frontY + cardHeightMm) + backOffsetY;
        } else {
          xMm = frontX + backOffsetX;
          yMm = frontY + backOffsetY;
        }
      }

      coordinates.push({
        slotIndex,
        xMm,
        yMm,
        widthMm: finalWidthMm,
        heightMm: finalHeightMm,
        flipMode: flip,
      });

      slotIndex++;
    }
  }

  return coordinates;
}

let dynamicStyleEl: HTMLStyleElement | null = null;

/**
 * Injects a temporary dynamic @page CSS rule so the browser print driver receives exact paper size and 0 margins
 */
export function injectPrintStyles(paperWidthMm: number, paperHeightMm: number): void {
  if (dynamicStyleEl) {
    dynamicStyleEl.remove();
  }

  dynamicStyleEl = document.createElement('style');
  dynamicStyleEl.id = 'aazmi-dynamic-print-css';
  dynamicStyleEl.innerHTML = `
    @page {
      size: ${paperWidthMm}mm ${paperHeightMm}mm;
      margin: 0mm !important;
    }
    @media print {
      html, body {
        width: ${paperWidthMm}mm !important;
        height: ${paperHeightMm}mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background: #ffffff !important;
      }
    }
  `;
  document.head.appendChild(dynamicStyleEl);
}

export function cleanupPrintStyles(): void {
  if (dynamicStyleEl) {
    dynamicStyleEl.remove();
    dynamicStyleEl = null;
  }
}

/**
 * Triggers browser print dialog with accurate paper setup
 */
export function executeBrowserPrint(
  paperWidthMm: number,
  paperHeightMm: number,
  onAfterPrint?: () => void
): void {
  injectPrintStyles(paperWidthMm, paperHeightMm);

  const handleAfterPrint = () => {
    window.removeEventListener('afterprint', handleAfterPrint);
    cleanupPrintStyles();
    if (onAfterPrint) onAfterPrint();
  };

  window.addEventListener('afterprint', handleAfterPrint);

  // Slight timeout to ensure layout repaint with dynamic CSS
  setTimeout(() => {
    window.print();
  }, 100);
}
