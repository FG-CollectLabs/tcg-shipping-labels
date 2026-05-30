import Papa from 'papaparse';
import { Address } from '../types';

interface TCGRow {
  'Order #': string;
  FirstName: string;
  LastName: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  PostalCode: string;
  Country: string;
}

export function parseTCGPlayerCsv(file: File): Promise<{ orderId: string; to: Address }[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<TCGRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const out = results.data.map((row) => ({
          orderId: row['Order #'],
          to: {
            name: `${row.FirstName} ${row.LastName}`.trim(),
            line1: row.Address1,
            line2: row.Address2 || undefined,
            city: row.City,
            state: row.State,
            zip: row.PostalCode,
          },
        }));
        resolve(out);
      },
      error: reject,
    });
  });
}
