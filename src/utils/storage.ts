import { Address } from '../types';

const KEY = 'tcg-return-address';

export function getReturnAddress(): Address | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Address;
  } catch {
    return null;
  }
}

export function saveReturnAddress(addr: Address): void {
  localStorage.setItem(KEY, JSON.stringify(addr));
}
