/**
 * PDF Text Extractor
 * Uses pdfjs-dist v5 to extract raw text from uploaded PDF files.
 * 
 * IMPORTANT: We output each text fragment on its own line (NOT grouped by Y).
 * This preserves the column structure so the bill parser can detect
 * serial numbers and HSN codes as separate lines.
 */

import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - worker import for v5
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfjsWorker;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;
  
  console.log('[PDF] Pages:', pdf.numPages);
  const allFragments: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // Output each text fragment as a separate line
    // This preserves the table column structure
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const text = item.str.trim();
      if (text) {
        allFragments.push(text);
      }
    }
  }
  
  const result = allFragments.join('\n');
  console.log('[PDF] Fragments:', allFragments.length);
  console.log('[PDF] Preview:', result.substring(0, 800));
  return result;
}
