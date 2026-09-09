import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  WorkflowStep,
  CardSideData,
  AlignmentSettings,
  CalibrationSettings,
  PrinterProfile,
} from './types';
import {
  loadSavedProfiles,
  saveProfiles,
  loadActiveAlignment,
  saveActiveAlignment,
  loadActiveCalibration,
  saveActiveCalibration,
} from './utils/storage';
import { DEFAULT_PROFILES, DEFAULT_ALIGNMENT, DEFAULT_CALIBRATION } from './constants/presets';
import { SAMPLE_FRONT_SVG, SAMPLE_BACK_SVG } from './constants/sampleCards';
import { executeBrowserPrint } from './utils/printHelper';
import { createBlankCardSide } from './utils/imageProcessing';

// Components
import { Header } from './components/Header';
import { StepWorkflow } from './components/StepWorkflow';
import { CardEditor } from './components/CardEditor';
import { PrintBedPreview } from './components/PrintBedPreview';
import { AlignmentControls } from './components/AlignmentControls';
import { CalibrationPanel } from './components/CalibrationPanel';
import { ProfilesManager } from './components/ProfilesManager';
import { ReinsertionGuideModal } from './components/ReinsertionGuideModal';
import { CanonSettingsGuide } from './components/CanonSettingsGuide';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { PhysicalPrintStage } from './components/PhysicalPrintStage';

export default function App() {
  // Navigation & Workflow state
  const [activeTab, setActiveTab] = useState<ActiveTab>('workflow');
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('front');
  const [editorSide, setEditorSide] = useState<'front' | 'back'>('front');

  // Profiles & Settings
  const [profiles, setProfiles] = useState<PrinterProfile[]>(loadSavedProfiles);
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => profiles.find((p) => p.isDefault)?.id || profiles[0]?.id || 'canon_tray_default'
  );
  const [alignment, setAlignment] = useState<AlignmentSettings>(loadActiveAlignment);
  const [calibration, setCalibration] = useState<CalibrationSettings>(loadActiveCalibration);

  // Card Content State (Front & Back)
  const [frontData, setFrontData] = useState<CardSideData>(createBlankCardSide);
  const [backData, setBackData] = useState<CardSideData>(createBlankCardSide);

  // Print execution & Preview Modals state
  const [printMode, setPrintMode] = useState<'front' | 'back' | 'calibration' | null>(null);
  const [previewSide, setPreviewSide] = useState<'front' | 'back' | null>(null);
  const [isReinsertionModalOpen, setIsReinsertionModalOpen] = useState<boolean>(false);
  const [isCanonGuideOpen, setIsCanonGuideOpen] = useState<boolean>(false);

  // Keep localStorage in sync when alignment or calibration updates
  useEffect(() => {
    saveActiveAlignment(alignment);
  }, [alignment]);

  useEffect(() => {
    saveActiveCalibration(calibration);
  }, [calibration]);

  // Load specimen test card on demand or initial empty state
  const handleLoadSpecimenCards = () => {
    setFrontData((prev) => ({
      ...prev,
      fileName: 'Specimen_Front_Aazmi_ID.svg',
      fileType: 'image',
      sourceImageUrl: SAMPLE_FRONT_SVG,
      croppedImageUrl: SAMPLE_FRONT_SVG,
    }));
    setBackData((prev) => ({
      ...prev,
      fileName: 'Specimen_Back_Aazmi_ID.svg',
      fileType: 'image',
      sourceImageUrl: SAMPLE_BACK_SVG,
      croppedImageUrl: SAMPLE_BACK_SVG,
    }));
  };

  // Profile management
  const handleSelectProfile = (id: string) => {
    const selected = profiles.find((p) => p.id === id);
    if (selected) {
      setActiveProfileId(id);
      setAlignment({ ...selected.alignment });
      setCalibration({ ...selected.calibration });
    }
  };

  const handleSaveProfile = (newProfile: PrinterProfile) => {
    const updated = [newProfile, ...profiles.filter((p) => p.id !== newProfile.id)];
    setProfiles(updated);
    saveProfiles(updated);
    setActiveProfileId(newProfile.id);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    saveProfiles(updated);
    if (activeProfileId === id && updated[0]) {
      setActiveProfileId(updated[0].id);
      setAlignment({ ...updated[0].alignment });
    }
  };

  const handleRestoreDefaultProfiles = () => {
    setProfiles(DEFAULT_PROFILES);
    saveProfiles(DEFAULT_PROFILES);
    const defaultProfile = DEFAULT_PROFILES[0];
    setActiveProfileId(defaultProfile.id);
    setAlignment(defaultProfile.alignment);
    setCalibration(defaultProfile.calibration);
  };

  const handleImportProfiles = (imported: PrinterProfile[]) => {
    setProfiles(imported);
    saveProfiles(imported);
    if (imported[0]) {
      handleSelectProfile(imported[0].id);
    }
  };

  // Preset Card Size Apply
  const handleApplyPresetCardSize = (widthMm: number, heightMm: number) => {
    setAlignment((prev) => {
      const updates: Partial<AlignmentSettings> = {
        cardWidthMm: widthMm,
        cardHeightMm: heightMm,
      };
      if (prev.centerOnPage) {
        updates.originXMm = Math.round(((prev.paperWidthMm - widthMm) / 2) * 10) / 10;
        updates.originYMm = Math.round(((prev.paperHeightMm - heightMm) / 2) * 10) / 10;
      }
      return {
        ...prev,
        ...updates,
      };
    });
  };

  // Print Handlers
  const handlePrintFront = () => {
    setPrintMode('front');
    // Open print dialog with dynamic styles
    executeBrowserPrint(alignment.paperWidthMm, alignment.paperHeightMm, () => {
      setWorkflowStep('reinsert');
      setIsReinsertionModalOpen(true);
      setPrintMode(null);
    });
  };

  const handlePrintBack = () => {
    setPrintMode('back');
    executeBrowserPrint(alignment.paperWidthMm, alignment.paperHeightMm, () => {
      setWorkflowStep('completed');
      setPrintMode(null);
    });
  };

  const handlePrintCalibrationSheet = () => {
    setPrintMode('calibration');
    executeBrowserPrint(alignment.paperWidthMm, alignment.paperHeightMm, () => {
      setPrintMode(null);
    });
  };

  const handleResetWorkflow = () => {
    setWorkflowStep('front');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header with Branding, Profile Selector, Nav Tabs, Canon Guide */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profiles={profiles}
        activeProfileId={activeProfileId}
        onSelectProfile={handleSelectProfile}
        onLoadSampleCards={handleLoadSpecimenCards}
        onOpenCanonGuide={() => setIsCanonGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: WORKFLOW (Step 1 Front & Step 2 Back) */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <StepWorkflow
              workflowStep={workflowStep}
              frontData={frontData}
              backData={backData}
              alignment={alignment}
              calibration={calibration}
              onUpdateFrontData={(updated) => setFrontData((prev) => ({ ...prev, ...updated }))}
              onUpdateBackData={(updated) => setBackData((prev) => ({ ...prev, ...updated }))}
              onPreviewSide={(side) => setPreviewSide(side)}
              onPrintFront={handlePrintFront}
              onOpenReinsertionModal={() => setIsReinsertionModalOpen(true)}
              onDirectPrintBack={handlePrintBack}
              onGoToEditor={(side) => {
                setEditorSide(side);
                setActiveTab('editor');
              }}
              onResetWorkflow={handleResetWorkflow}
              onLoadSpecimenCards={handleLoadSpecimenCards}
              onUpdateAlignment={(updated) => setAlignment((prev) => ({ ...prev, ...updated }))}
            />

            {/* Live Print Bed Simulation below workflow */}
            <div className="pt-2">
              <PrintBedPreview
                currentSide={workflowStep === 'reinsert' || workflowStep === 'back' ? 'back' : 'front'}
                frontData={frontData}
                backData={backData}
                alignment={alignment}
                calibration={calibration}
                onUpdateOrigin={(x, y) => setAlignment((prev) => ({ ...prev, originXMm: x, originYMm: y }))}
              />
            </div>
          </div>
        )}

        {/* TAB 2: CROP & ADJUST EDITOR */}
        {activeTab === 'editor' && (
          <div className="space-y-6">
            <CardEditor
              side={editorSide}
              cardData={editorSide === 'front' ? frontData : backData}
              cardWidthMm={alignment.cardWidthMm}
              cardHeightMm={alignment.cardHeightMm}
              onUpdateCardData={(updated) => {
                if (editorSide === 'front') {
                  setFrontData((prev) => ({ ...prev, ...updated }));
                } else {
                  setBackData((prev) => ({ ...prev, ...updated }));
                }
              }}
              onApplyCrop={(highResUrl) => {
                if (editorSide === 'front') {
                  setFrontData((prev) => ({ ...prev, croppedImageUrl: highResUrl }));
                } else {
                  setBackData((prev) => ({ ...prev, croppedImageUrl: highResUrl }));
                }
                setActiveTab('workflow');
              }}
              onSwitchSide={(side) => setEditorSide(side)}
            />
          </div>
        )}

        {/* TAB 3: ALIGNMENT & PHYSICAL COORDINATES */}
        {activeTab === 'alignment' && (
          <div className="space-y-6">
            <AlignmentControls
              alignment={alignment}
              onUpdateAlignment={(updated) => setAlignment((prev) => ({ ...prev, ...updated }))}
              onApplyPresetCardSize={handleApplyPresetCardSize}
            />

            <PrintBedPreview
              currentSide="front"
              frontData={frontData}
              backData={backData}
              alignment={alignment}
              calibration={calibration}
              onUpdateOrigin={(x, y) => setAlignment((prev) => ({ ...prev, originXMm: x, originYMm: y }))}
            />
          </div>
        )}

        {/* TAB 4: CALIBRATION TEST PRINT */}
        {activeTab === 'calibration' && (
          <div className="space-y-6">
            <CalibrationPanel
              calibration={calibration}
              alignment={alignment}
              onUpdateCalibration={(updated) => setCalibration((prev) => ({ ...prev, ...updated }))}
              onPrintCalibrationSheet={handlePrintCalibrationSheet}
            />
          </div>
        )}

        {/* TAB 5: SAVED PROFILES */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <ProfilesManager
              profiles={profiles}
              activeProfileId={activeProfileId}
              currentAlignment={alignment}
              currentCalibration={calibration}
              onSelectProfile={handleSelectProfile}
              onSaveProfile={handleSaveProfile}
              onDeleteProfile={handleDeleteProfile}
              onRestoreDefaults={handleRestoreDefaultProfiles}
              onImportProfiles={handleImportProfiles}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <p>
            &copy; 2026 <strong>Aazmi PVC Card Printer</strong> • High-Precision Canon Card Duplex Alignment System
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Physical Scale: 80 × 50 mm (8:5)</span>
            <span>Zero-Margin Print Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Safety Reinsertion Confirmation Modal */}
      <ReinsertionGuideModal
        isOpen={isReinsertionModalOpen}
        onClose={() => setIsReinsertionModalOpen(false)}
        onConfirmPrintBack={() => {
          setIsReinsertionModalOpen(false);
          handlePrintBack();
        }}
        flipType={alignment.backSheetFlipType}
        flipMode={alignment.backFlipMode}
      />

      {/* 2. Canon Driver Settings Guide */}
      <CanonSettingsGuide
        isOpen={isCanonGuideOpen}
        onClose={() => setIsCanonGuideOpen(false)}
      />

      {/* 3. Pre-Print Visual 1:1 Preview Modal */}
      {previewSide && (
        <PrintPreviewModal
          isOpen={Boolean(previewSide)}
          side={previewSide}
          frontData={frontData}
          backData={backData}
          alignment={alignment}
          calibration={calibration}
          onClose={() => setPreviewSide(null)}
          onUpdateAlignment={(updated) => setAlignment((prev) => ({ ...prev, ...updated }))}
          onConfirmPrint={() => {
            if (previewSide === 'front') {
              handlePrintFront();
            } else {
              handlePrintBack();
            }
          }}
        />
      )}

      {/* DEDICATED PRINT STAGE (Visible only during @media print) */}
      <PhysicalPrintStage
        printMode={printMode}
        frontData={frontData}
        backData={backData}
        alignment={alignment}
        calibration={calibration}
      />
    </div>
  );
}
