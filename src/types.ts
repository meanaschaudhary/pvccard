export type CardOrientation = 'portrait' | 'landscape';

export type PaperSizeKey = 'a4' | 'a5' | '4x6' | 'canon_tray' | 'custom';

export interface PaperDimensions {
  key: PaperSizeKey;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export type BackFlipMode = 'none' | 'flip_horizontal' | 'flip_vertical' | 'rotate_90' | 'rotate_180' | 'flip_h_and_v';

export type BackSheetFlipType = 'tray_same_coords' | 'flip_short_edge' | 'flip_long_edge' | 'custom_offset';

export interface CardSizePreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  category: 'id_standard' | 'government' | 'custom';
  description: string;
}

export interface CropState {
  x: number; // in percentage of image or offset
  y: number;
  zoom: number; // 1 = 100%
  rotation: number; // 0, 90, 180, 270 degrees
  flipH: boolean;
  flipV: boolean;
  aspectRatioLocked: boolean;
}

export interface PhotoRegion {
  x: number; // percentage (0 - 100) from left edge of card
  y: number; // percentage (0 - 100) from top edge of card
  width: number; // percentage (0 - 100) of card width
  height: number; // percentage (0 - 100) of card height
}

export interface PhotoEnhanceSettings {
  enabled: boolean;
  region: PhotoRegion;
  brightness: number; // -100 to +100 (0 default)
  contrast: number; // -100 to +100 (0 default)
  highlights: number; // -100 to +100 (0 default)
  shadows: number; // -100 to +100 (0 default)
  sharpness: number; // 0 to 100 (0 default)
  warmth: number; // -100 to +100 (0 default)
  saturation: number; // -100 to +100 (0 default)
  feather: number; // 0 to 20 px (default 8)
}

export interface CardSideData {
  originalFile: File | null;
  fileName: string | null;
  fileType: 'image' | 'pdf' | null;
  pdfNumPages?: number;
  selectedPdfPage?: number;
  pdfPassword?: string;
  sourceImageUrl: string | null; // high-res base64 or blob URL
  croppedImageUrl: string | null; // high-res rendered crop
  crop: CropState;
  brightness: number; // 100 default
  contrast: number; // 100 default
  photoEnhance?: PhotoEnhanceSettings; // Specific face / profile photo clarify
}

export interface CardSlot {
  id: string;
  slotIndex: number;
  label: string;
  front: CardSideData;
  back: CardSideData;
}

export type PlacementMode = 'top_center' | 'page_center' | 'custom';

export interface AlignmentSettings {
  paperSizeKey: PaperSizeKey;
  paperWidthMm: number;
  paperHeightMm: number;
  cardWidthMm: number;
  cardHeightMm: number;
  placementMode: PlacementMode; // 'top_center' = horizontally centered at top of page; 'page_center' = dead center; 'custom' = manual coordinates
  centerOnPage: boolean; // Kept for backwards compatibility
  topMarginMm: number; // Top position when top_center is active (default 20mm)
  originXMm: number; // Left position of Card 1
  originYMm: number; // Top position of Card 1
  multiCardLayout: {
    enabled: boolean;
    rows: number;
    columns: number;
    gapXMm: number;
    gapYMm: number;
  };
  backSheetFlipType: BackSheetFlipType;
  backFlipMode: BackFlipMode;
  backOffsetX: number; // Fine-tune offset for back in mm
  backOffsetY: number;
  copies: number;
}

export interface CalibrationSettings {
  offsetX: number; // in mm (-20 to +20)
  offsetY: number; // in mm (-20 to +20)
  scaleCorrectionPct: number; // 95 to 105% (default 100)
}

export interface PrinterProfile {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  alignment: AlignmentSettings;
  calibration: CalibrationSettings;
  createdAt: number;
  updatedAt: number;
}

export type ActiveTab = 'workflow' | 'editor' | 'alignment' | 'calibration' | 'profiles' | 'guide';

export type WorkflowStep = 'front' | 'reinsert' | 'back' | 'completed';
