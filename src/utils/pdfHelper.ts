import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to use the local worker bundled or CDN fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch {
  console.warn('PDF Worker initialization error, falling back to embedded worker');
}

export interface PdfInfo {
  numPages: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
}

/**
 * Load a PDF file from an ArrayBuffer or File
 */
export async function loadPdfDocument(file: File): Promise<PdfInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  return {
    numPages: pdfDoc.numPages,
    pdfDoc,
  };
}

/**
 * Render a specific page from a loaded PDF document to high-resolution image data URL.
 * Scale of 3.0 or 4.0 gives ~300 DPI quality for razor-sharp text and QR codes.
 */
export async function renderPdfPageToDataUrl(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number = 3.5
): Promise<{ dataUrl: string; width: number; height: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Canvas 2D context unavailable');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // High quality image rendering flags
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  // Fill with white background
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  // @ts-expect-error pdfjs v4/v5 render interface
  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL('image/png', 1.0);
  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}
