export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface ShippingLabel {
  id: string;
  to: Address;
  orderId?: string;
  source: 'csv' | 'paste' | 'manapool';
}
