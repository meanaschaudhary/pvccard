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

export class PdfPasswordException extends Error {
  code: number;
  isIncorrect: boolean;
  constructor(message: string, code: number = 1) {
    super(message);
    this.name = 'PdfPasswordException';
    this.code = code;
    this.isIncorrect = code === 2;
  }
}

/**
 * Checks if an error thrown by PDF.js or loadPdfDocument indicates password protection
 */
export function isPdfPasswordError(err: unknown): { isPasswordProtected: boolean; isIncorrect: boolean } {
  if (!err || typeof err !== 'object') {
    return { isPasswordProtected: false, isIncorrect: false };
  }
  const e = err as { name?: string; message?: string; code?: number };
  const name = String(e.name || '');
  const message = String(e.message || '');
  const code = e.code;

  const isPasswordIssue =
    name === 'PasswordException' ||
    name === 'PdfPasswordException' ||
    code === 1 || // NEED_PASSWORD
    code === 2 || // INCORRECT_PASSWORD
    message.toLowerCase().includes('password');

  const isIncorrect =
    code === 2 ||
    name.toLowerCase().includes('incorrect') ||
    message.toLowerCase().includes('incorrect') ||
    message.toLowerCase().includes('bad password') ||
    message.toLowerCase().includes('invalid password');

  return {
    isPasswordProtected: Boolean(isPasswordIssue),
    isIncorrect: Boolean(isIncorrect),
  };
}

/**
 * Load a PDF file from a File, ArrayBuffer, or Uint8Array with optional password support
 */
export async function loadPdfDocument(
  file: File | ArrayBuffer | Uint8Array,
  password?: string
): Promise<PdfInfo> {
  let data: Uint8Array;
  if (file instanceof Uint8Array) {
    data = file;
  } else if (file instanceof ArrayBuffer) {
    data = new Uint8Array(file);
  } else {
    const arrayBuffer = await file.arrayBuffer();
    data = new Uint8Array(arrayBuffer);
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    password: password || undefined,
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  try {
    const pdfDoc = await loadingTask.promise;
    return {
      numPages: pdfDoc.numPages,
      pdfDoc,
    };
  } catch (err: unknown) {
    const check = isPdfPasswordError(err);
    if (check.isPasswordProtected) {
      const isIncorrect = check.isIncorrect || Boolean(password);
      throw new PdfPasswordException(
        isIncorrect ? 'Incorrect password for PDF' : 'This PDF file is password-protected',
        isIncorrect ? 2 : 1
      );
    }
    throw err;
  }
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
