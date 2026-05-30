import { Address, ShippingLabel } from '../types';

interface Props {
  label: ShippingLabel;
  returnAddress: Address;
  onRemove: () => void;
}

const SOURCE_BADGE: Record<ShippingLabel['source'], string> = {
  csv: 'TCGPlayer',
  paste: 'Pasted',
  manapool: 'Manapool',
};

export default function LabelCard({ label, returnAddress, onRemove }: Props) {
  const { to } = label;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-56 flex-shrink-0">
      {/* Miniature label preview — approximately 2:3 aspect (4×6) */}
      <div
        className="relative bg-white p-2 border-b border-gray-100 font-mono"
        style={{ aspectRatio: '4/6', fontSize: '5px', lineHeight: 1.4 }}
      >
        {/* Return address */}
        <div className="absolute top-2 left-2 text-gray-500" style={{ fontSize: '5px' }}>
          <div>{returnAddress.name}</div>
          <div>{returnAddress.line1}</div>
          {returnAddress.line2 && <div>{returnAddress.line2}</div>}
          <div>{returnAddress.city}, {returnAddress.state} {returnAddress.zip}</div>
        </div>
        {/* Stamp placeholder */}
        <div
          className="absolute top-2 right-2 border border-dashed border-gray-300 flex items-center justify-center text-gray-300"
          style={{ width: '20px', height: '15px', fontSize: '4px' }}
        >
          STAMP
        </div>
        {/* Delivery address */}
        <div className="absolute left-3 right-1" style={{ top: '38%', fontSize: '7px' }}>
          <div className="font-semibold">{to.name}</div>
          <div>{to.line1}</div>
          {to.line2 && <div>{to.line2}</div>}
          <div>{to.city}, {to.state} {to.zip}</div>
        </div>
      </div>
      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 flex-shrink-0">
            {SOURCE_BADGE[label.source]}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {label.orderId ? `#${label.orderId.slice(-6)}` : to.city}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-300 hover:text-red-400 transition-colors text-sm flex-shrink-0"
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
