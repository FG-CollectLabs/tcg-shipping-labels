import { useState, useCallback } from 'react';
import { ShippingLabel, Address } from './types';
import { getReturnAddress, saveReturnAddress } from './utils/storage';
import { parseTCGPlayerCsv } from './utils/parseCsv';
import { parseAddressText } from './utils/parseText';
import { parseManapoolPdf } from './utils/parseManapool';
import DropZone from './components/DropZone';
import ReturnAddressConfig from './components/ReturnAddressConfig';
import LabelCard from './components/LabelCard';
import LabelPrint from './components/LabelPrint';

export default function App() {
  const [returnAddress, setReturnAddress] = useState<Address | null>(getReturnAddress);
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [showConfig, setShowConfig] = useState(() => !getReturnAddress());
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addLabels = useCallback((next: ShippingLabel[]) => {
    setLabels((prev) => [...prev, ...next]);
  }, []);

  const handleCsvFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseTCGPlayerCsv(file);
      addLabels(
        parsed.map(({ orderId, to }) => ({
          id: crypto.randomUUID(),
          to,
          orderId,
          source: 'csv' as const,
        })),
      );
    } catch {
      setError('Failed to parse TCGPlayer CSV — make sure it is an unmodified shipping export.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSubmit = () => {
    setError(null);
    const addr = parseAddressText(pasteText);
    if (!addr) {
      setError('Could not parse address. Expected: Name / Street / City, ST ZIP (optional: country on last line).');
      return;
    }
    addLabels([{ id: crypto.randomUUID(), to: addr, source: 'paste' }]);
    setPasteText('');
  };

  const handleManapoolFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const addresses = await parseManapoolPdf(file);
      if (addresses.length === 0) {
        setError('No addresses found in the PDF. Make sure it is a Manapool envelope print PDF.');
        return;
      }
      addLabels(
        addresses.map((to) => ({ id: crypto.randomUUID(), to, source: 'manapool' as const })),
      );
    } catch {
      setError('Failed to parse PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = (addr: Address) => {
    saveReturnAddress(addr);
    setReturnAddress(addr);
    setShowConfig(false);
  };

  const removeLabel = (id: string) =>
    setLabels((prev) => prev.filter((l) => l.id !== id));

  const clearAll = () => setLabels([]);

  return (
    <>
      {/* ── Screen UI ─────────────────────────────────────────────────────── */}
      <div id="screen-ui" className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📬</span>
            <h1 className="text-base font-bold text-gray-900">TCG Shipping Labels</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {returnAddress && (
              <span className="text-xs text-gray-400 hidden sm:block">
                {returnAddress.name} · {returnAddress.city}, {returnAddress.state}
              </span>
            )}
            <button
              onClick={() => setShowConfig(true)}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              {returnAddress ? 'Edit Return Address' : 'Set Return Address'}
            </button>
            {labels.length > 0 && (
              <>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors py-1.5 px-2"
                >
                  Clear all
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-primary text-sm py-1.5 px-3"
                >
                  Print all ({labels.length})
                </button>
              </>
            )}
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-5 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start text-sm gap-3">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-3 text-sm text-gray-400">Parsing…</div>
          )}

          {/* No return address warning */}
          {!returnAddress && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
              Set your return address above to start generating labels.
            </div>
          )}

          {/* Input zones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DropZone
              label="TCGPlayer CSV"
              hint="Drop a shipping export CSV"
              accept=".csv,text/csv"
              onFile={handleCsvFile}
            />

            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 flex flex-col gap-2 hover:border-gray-300 transition-colors">
              <p className="text-sm font-medium text-gray-600">Paste Address</p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePasteSubmit();
                }}
                placeholder={'John Doe\n123 Main St\nCity, ST 12345\nUS'}
                rows={5}
                className="input resize-none font-mono text-xs flex-1"
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!pasteText.trim() || !returnAddress}
                className="btn-primary text-sm py-1.5"
              >
                Add Label
              </button>
            </div>

            <DropZone
              label="Manapool PDF"
              hint="Drop an envelope print PDF"
              accept=".pdf,application/pdf"
              onFile={handleManapoolFile}
            />
          </div>

          {/* Label grid */}
          {labels.length > 0 && returnAddress && (
            <section>
              <p className="text-xs text-gray-400 mb-3">
                {labels.length} label{labels.length !== 1 ? 's' : ''} — click Print all to print on 4×6 sheets
              </p>
              <div className="flex flex-wrap gap-4">
                {labels.map((label) => (
                  <LabelCard
                    key={label.id}
                    label={label}
                    returnAddress={returnAddress}
                    onRemove={() => removeLabel(label.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ── Print area ────────────────────────────────────────────────────── */}
      <div id="print-area" style={{ display: 'none' }}>
        {returnAddress &&
          labels.map((label) => (
            <LabelPrint key={label.id} label={label} returnAddress={returnAddress} />
          ))}
      </div>

      {/* ── Return address modal ──────────────────────────────────────────── */}
      {showConfig && (
        <ReturnAddressConfig
          current={returnAddress}
          onSave={handleSaveAddress}
          onClose={returnAddress ? () => setShowConfig(false) : undefined}
        />
      )}
    </>
  );
}
