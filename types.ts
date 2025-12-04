export interface StockItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: 'LAUNDRY' | 'RETAIL' | 'KONTER';
  detail: string;
  total: number;
  customerPhone?: string; // For Konter or Laundry
}

export interface Attendance {
  id: string;
  date: string; // ISO String
  name: string;
  status: 'MASUK' | 'KELUAR';
}

export type TabView = 'dashboard' | 'pos' | 'inventory';

export const CATEGORIES = ['Baju', 'Tas', 'Aksesoris', 'Konter HP', 'Voucher', 'Lainnya'];

export const LAUNDRY_SERVICES = [
  { id: 'komplit', name: 'Cuci Komplit (Cuci+Gosok)', basePrice: 6000, unit: 'Kg' },
  { id: 'basah', name: 'Cuci Basah', basePrice: 4000, unit: 'Kg' },
  { id: 'kering', name: 'Cuci Kering (Lipat)', basePrice: 5000, unit: 'Kg' },
  { id: 'setrika', name: 'Setrika Saja', basePrice: 4000, unit: 'Kg' },
  { id: 'bedcover', name: 'Bed Cover (Satuan)', basePrice: 25000, unit: 'Pcs' },
  { id: 'karpet', name: 'Karpet (Per Meter)', basePrice: 15000, unit: 'Mtr' },
  { id: 'lainnya', name: 'Lainnya', basePrice: 0, unit: 'Pcs' },
];