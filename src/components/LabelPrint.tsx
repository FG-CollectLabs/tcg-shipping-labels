import { Address, ShippingLabel } from '../types';

interface Props {
  label: ShippingLabel;
  returnAddress: Address;
}

export default function LabelPrint({ label, returnAddress }: Props) {
  const { to } = label;
  return (
    <div className="print-label">
      <div className="print-from">
        <div>{returnAddress.name}</div>
        <div>{returnAddress.line1}</div>
        {returnAddress.line2 && <div>{returnAddress.line2}</div>}
        <div>{returnAddress.city}, {returnAddress.state} {returnAddress.zip}</div>
      </div>

      <div className="print-stamp">STAMP<br />HERE</div>

      <div className="print-to">
        <div>{to.name}</div>
        <div>{to.line1}</div>
        {to.line2 && <div>{to.line2}</div>}
        <div>{to.city}, {to.state} {to.zip}</div>
      </div>

      {label.orderId && (
        <div className="print-order-id">{label.orderId}</div>
      )}
    </div>
  );
}
