import * as pdfjs from 'pdfjs-dist';
import PDFWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Address } from '../types';

pdfjs.GlobalWorkerOptions.workerSrc = PDFWorkerUrl;

const CITY_STATE_ZIP = /^(.+),\s+([A-Za-z]{2})\s+([\d]{5}(?:-\d{4})?)(?:\s+\w+)?$/;

interface TextItem {
  str: string;
  transform: number[];
}

function isTextItem(item: unknown): item is TextItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'str' in item &&
    'transform' in item &&
    Array.isArray((item as TextItem).transform)
  );
}

function groupIntoLines(rawItems: TextItem[]): string[] {
  const items = rawItems
    .filter((i) => i.str.trim() && i.str.trim() !== ',')
    .map((i) => ({ text: i.str.trim(), y: i.transform[5], x: i.transform[4] }));

  if (items.length === 0) return [];

  // Sort top-to-bottom (PDF y-axis increases upward → sort descending)
  items.sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: string[] = [];
  let curY = items[0].y;
  let curLine = items[0].text;

  for (let i = 1; i < items.length; i++) {
    if (Math.abs(items[i].y - curY) < 6) {
      curLine += ' ' + items[i].text;
    } else {
      lines.push(curLine.trim());
      curLine = items[i].text;
      curY = items[i].y;
    }
  }
  lines.push(curLine.trim());

  return lines.filter((l) => l.length > 0);
}

function parseLines(lines: string[]): Address | null {
  if (lines.length < 3) return null;

  const cityIdx = lines.findIndex((l) => CITY_STATE_ZIP.test(l));
  if (cityIdx < 2) return null;

  const match = lines[cityIdx].match(CITY_STATE_ZIP)!;
  const city = match[1].trim();
  const state = match[2].toUpperCase();
  const zip = match[3];

  const name = lines[0];
  const line1 = lines[1];
  const line2 = cityIdx === 3 ? lines[2] : undefined;

  return { name, line1, line2, city, state, zip };
}

export async function parseManapoolPdf(file: File): Promise<Address[]> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const addresses: Address[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const rawItems = (content.items as unknown[]).filter(isTextItem);
    const lines = groupIntoLines(rawItems);
    const addr = parseLines(lines);
    if (addr) addresses.push(addr);
  }

  return addresses;
}
