import { Address } from '../types';

const CITY_STATE_ZIP = /^(.+),\s+([A-Za-z]{2})\s+([\d]{5}(?:-\d{4})?)$/;
const COUNTRY_SUFFIX = /\s+(US|USA|United States)$/i;

export function parseAddressText(raw: string): Address | null {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 3) return null;

  const name = lines[0];

  // Strip trailing country line if present (TCGPlayer pastes "US" on its own line)
  const withoutCountry =
    /^(US|USA|United States)$/i.test(lines[lines.length - 1])
      ? lines.slice(0, -1)
      : lines;

  if (withoutCountry.length < 3) return null;

  const lastLine = withoutCountry[withoutCountry.length - 1].replace(COUNTRY_SUFFIX, '').trim();
  const match = lastLine.match(CITY_STATE_ZIP);
  if (!match) return null;

  const city = match[1].trim();
  const state = match[2].toUpperCase();
  const zip = match[3];

  const addrLines = withoutCountry.slice(1, withoutCountry.length - 1);
  if (addrLines.length === 0) return null;

  return {
    name,
    line1: addrLines[0],
    line2: addrLines[1] || undefined,
    city,
    state,
    zip,
  };
}
