import React from 'react';
import { AlignmentSettings, CalibrationSettings, CardSideData } from '../types';
import { calculateSlotCoordinates } from '../utils/printHelper';

interface PhysicalPrintStageProps {
  printMode: 'front' | 'back' | 'calibration' | null;
  frontData: CardSideData;
  backData: CardSideData;
  alignment: AlignmentSettings;
  calibration: CalibrationSettings;
}

export const PhysicalPrintStage: React.FC<PhysicalPrintStageProps> = ({
  printMode,
  frontData,
  backData,
  alignment,
  calibration,
}) => {
  if (!printMode) return null;

  const { paperWidthMm, paperHeightMm, cardWidthMm, cardHeightMm } = alignment;

  // Render Calibration Page
  if (printMode === 'calibration') {
    return (
      <div
        id="print-master-stage"
        style={{
          width: `${paperWidthMm}mm`,
          height: `${paperHeightMm}mm`,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          fontFamily: 'monospace',
          boxSizing: 'border-box',
        }}
      >
        {/* Border line around printable boundary */}
        <div
          style={{
            position: 'absolute',
            left: '10mm',
            top: '10mm',
            width: `${paperWidthMm - 20}mm`,
            height: `${paperHeightMm - 20}mm`,
            border: '0.25mm solid #000000',
          }}
        />

        {/* Title Header */}
        <div style={{ position: 'absolute', left: '15mm', top: '15mm', fontSize: '12pt', fontWeight: 'bold' }}>
          AAZMI PVC CARD PRINTER — CANON HARDWARE CALIBRATION SHEET
        </div>
        <div style={{ position: 'absolute', left: '15mm', top: '21mm', fontSize: '8pt' }}>
          Instructions: Measure lines below with a physical steel ruler. If 80mm measures 79mm or 81mm, enter correction in UI.
        </div>

        {/* 10mm x 10mm Calibration Square */}
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            top: '30mm',
            width: '10mm',
            height: '10mm',
            backgroundColor: '#000000',
          }}
        />
        <div style={{ position: 'absolute', left: '33mm', top: '33mm', fontSize: '9pt', fontWeight: 'bold' }}>
          ← 10.0 mm × 10.0 mm Reference Solid Square
        </div>

        {/* 50 mm Measurement Line */}
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            top: '50mm',
            width: '50mm',
            height: '0.4mm',
            backgroundColor: '#000000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            top: '47mm',
            height: '6mm',
            width: '0.4mm',
            backgroundColor: '#000000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '70mm',
            top: '47mm',
            height: '6mm',
            width: '0.4mm',
            backgroundColor: '#000000',
          }}
        />
        <div style={{ position: 'absolute', left: '74mm', top: '48mm', fontSize: '9pt', fontWeight: 'bold' }}>
          ← 50.0 mm Exact Measurement Line (Card Height)
        </div>

        {/* 80 mm Measurement Line */}
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            top: '65mm',
            width: '80mm',
            height: '0.4mm',
            backgroundColor: '#000000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            top: '62mm',
            height: '6mm',
            width: '0.4mm',
            backgroundColor: '#000000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '100mm',
            top: '62mm',
            height: '6mm',
            width: '0.4mm',
            backgroundColor: '#000000',
          }}
        />
        <div style={{ position: 'absolute', left: '104mm', top: '63mm', fontSize: '9pt', fontWeight: 'bold' }}>
          ← 80.0 mm Exact Measurement Line (Card Width)
        </div>

        {/* Full Standard 80x50 mm Reference Card Outline */}
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            top: '80mm',
            width: '80mm',
            height: '50mm',
            border: '0.5mm solid #000000',
            boxSizing: 'border-box',
          }}
        >
          {/* Diagonal Center Crosshairs */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '25mm',
              width: '80mm',
              height: '0.2mm',
              backgroundColor: '#666666',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '40mm',
              top: 0,
              width: '0.2mm',
              height: '50mm',
              backgroundColor: '#666666',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '2mm',
              top: '2mm',
              fontSize: '8pt',
              fontWeight: 'bold',
            }}
          >
            Standard 80 × 50 mm Card Outline
          </div>
          <div
            style={{
              position: 'absolute',
              left: '2mm',
              bottom: '2mm',
              fontSize: '7pt',
            }}
          >
            Physical Ratio 8:5
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            left: '15mm',
            bottom: '15mm',
            fontSize: '8pt',
            color: '#333333',
          }}
        >
          Print Test Generated by Aazmi PVC Card Printer • Verification Date: {new Date().toLocaleDateString()}
        </div>
      </div>
    );
  }

  // Calculate coordinates for front or back side
  const slots = calculateSlotCoordinates(printMode, alignment, calibration);
  const activeData = printMode === 'front' ? frontData : backData;
  const imageSrc = activeData.croppedImageUrl || activeData.sourceImageUrl;

  return (
    <div
      id="print-master-stage"
      style={{
        width: `${paperWidthMm}mm`,
        height: `${paperHeightMm}mm`,
        position: 'absolute',
        left: 0,
        top: 0,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {slots.map((slot) => {
        // Compute transform for rotation/flips
        let transformStr = '';
        if (slot.flipMode === 'flip_horizontal') {
          transformStr += ' scaleX(-1)';
        } else if (slot.flipMode === 'flip_vertical') {
          transformStr += ' scaleY(-1)';
        } else if (slot.flipMode === 'rotate_180') {
          transformStr += ' rotate(180deg)';
        } else if (slot.flipMode === 'rotate_90') {
          transformStr += ' rotate(90deg)';
        } else if (slot.flipMode === 'flip_h_and_v') {
          transformStr += ' scaleX(-1) scaleY(-1)';
        }

        return (
          <div
            key={slot.slotIndex}
            style={{
              position: 'absolute',
              left: `${slot.xMm}mm`,
              top: `${slot.yMm}mm`,
              width: `${slot.widthMm}mm`,
              height: `${slot.heightMm}mm`,
              boxSizing: 'border-box',
              overflow: 'hidden',
              transform: transformStr || undefined,
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`${printMode} card slot ${slot.slotIndex}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  border: '0.2mm solid #000000',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9pt',
                  fontFamily: 'sans-serif',
                }}
              >
                {printMode.toUpperCase()} #{slot.slotIndex + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
