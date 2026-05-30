import { useState } from 'react';
import { Address } from '../types';

interface Props {
  current: Address | null;
  onSave: (addr: Address) => void;
  onClose?: () => void;
}

const BLANK: Address = { name: '', line1: '', line2: '', city: '', state: '', zip: '' };

export default function ReturnAddressConfig({ current, onSave, onClose }: Props) {
  const [form, setForm] = useState<Address>(current ?? BLANK);

  const set = (field: keyof Address, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const valid = !!(form.name && form.line1 && form.city && form.state && form.zip);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold mb-1">Return Address</h2>
        <p className="text-sm text-gray-500 mb-4">Stored in your browser — never sent anywhere.</p>
        <div className="space-y-3">
          <input
            className="input w-full"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
          <input
            className="input w-full"
            placeholder="Address Line 1"
            value={form.line1}
            onChange={(e) => set('line1', e.target.value)}
          />
          <input
            className="input w-full"
            placeholder="Address Line 2 (optional)"
            value={form.line2 ?? ''}
            onChange={(e) => set('line2', e.target.value)}
          />
          <div className="grid grid-cols-5 gap-2">
            <input
              className="input col-span-2"
              placeholder="City"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
            <input
              className="input col-span-1 uppercase"
              placeholder="ST"
              maxLength={2}
              value={form.state}
              onChange={(e) => set('state', e.target.value.toUpperCase())}
            />
            <input
              className="input col-span-2"
              placeholder="ZIP"
              value={form.zip}
              onChange={(e) => set('zip', e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5 justify-end">
          {onClose && (
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          )}
          <button
            onClick={() => onSave({ ...form, line2: form.line2 || undefined })}
            disabled={!valid}
            className="btn-primary"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
