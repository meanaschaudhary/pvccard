import { AlignmentSettings, CalibrationSettings, PrinterProfile } from '../types';
import { DEFAULT_ALIGNMENT, DEFAULT_CALIBRATION, DEFAULT_PROFILES } from '../constants/presets';

const STORAGE_KEYS = {
  PROFILES: 'aazmi_pvc_printer_profiles',
  ACTIVE_PROFILE_ID: 'aazmi_pvc_active_profile_id',
  CURRENT_ALIGNMENT: 'aazmi_pvc_current_alignment',
  CURRENT_CALIBRATION: 'aazmi_pvc_current_calibration',
  AUTO_SAVE: 'aazmi_pvc_autosave_state',
};

export function loadSavedProfiles(): PrinterProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      saveProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_PROFILES;
    const hasTopCenter = parsed.some((p: PrinterProfile) => p.id === 'canon_a4_top_center');
    if (!hasTopCenter) {
      saveProfiles(DEFAULT_PROFILES);
      return DEFAULT_PROFILES;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load profiles from localStorage', e);
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: PrinterProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to localStorage', e);
  }
}

export function loadActiveAlignment(): AlignmentSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_ALIGNMENT);
    if (!raw) return DEFAULT_ALIGNMENT;
    const parsed = JSON.parse(raw);
    const merged: AlignmentSettings = { ...DEFAULT_ALIGNMENT, ...parsed };
    // If placementMode is undefined or if it has dead-center coordinates (X:65, Y:123.5), default to top_center
    if (!merged.placementMode || (merged.originYMm === 123.5 && merged.paperSizeKey === 'a4')) {
      merged.placementMode = 'top_center';
      merged.topMarginMm = 20.0;
      merged.originXMm = Math.round(((merged.paperWidthMm - merged.cardWidthMm) / 2) * 10) / 10;
      merged.originYMm = 20.0;
      merged.centerOnPage = true;
    }
    return merged;
  } catch {
    return DEFAULT_ALIGNMENT;
  }
}

export function saveActiveAlignment(settings: AlignmentSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ALIGNMENT, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save alignment settings', e);
  }
}

export function loadActiveCalibration(): CalibrationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_CALIBRATION);
    if (!raw) return DEFAULT_CALIBRATION;
    return { ...DEFAULT_CALIBRATION, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CALIBRATION;
  }
}

export function saveActiveCalibration(settings: CalibrationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CALIBRATION, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save calibration settings', e);
  }
}

export function exportProfilesToJson(profiles: PrinterProfile[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profiles, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `aazmi_canon_pvc_profiles_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
