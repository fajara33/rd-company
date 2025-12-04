import { StockItem, Transaction, Attendance } from '../types';

// Keys for LocalStorage
const STORAGE_KEYS = {
  STOK: 'rd_stok',
  TRANSAKSI: 'rd_transaksi',
  ABSENSI: 'rd_absensi',
};

// Seed data if empty
const initDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.STOK)) {
    const seedData: StockItem[] = [
      { id: '1', name: 'Kemeja Putih', category: 'Baju', price: 150000, quantity: 10 },
      { id: '2', name: 'Tas Selempang', category: 'Tas', price: 75000, quantity: 5 },
      { id: '3', name: 'Kalung Emas (Imitasi)', category: 'Aksesoris', price: 50000, quantity: 20 },
      { id: '4', name: 'Pulsa 10k', category: 'Konter HP', price: 12000, quantity: 100 },
      { id: '5', name: 'Kuota Data 5GB', category: 'Konter HP', price: 35000, quantity: 50 },
    ];
    localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(seedData));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TRANSAKSI)) {
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ABSENSI)) {
    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify([]));
  }
};

// Initialize on load
initDB();

export const DB = {
  // --- Stock Methods ---
  getStock: (): StockItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STOK);
    return data ? JSON.parse(data) : [];
  },

  addStock: (item: Omit<StockItem, 'id'>) => {
    const items = DB.getStock();
    const newItem: StockItem = { ...item, id: Date.now().toString() };
    items.push(newItem);
    localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(items));
    return newItem;
  },

  updateStockQuantity: (id: string, delta: number) => {
    const items = DB.getStock();
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex > -1) {
      items[itemIndex].quantity += delta;
      localStorage.setItem(STORAGE_KEYS.STOK, JSON.stringify(items));
    }
  },

  // --- Transaction Methods ---
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSAKSI);
    return data ? JSON.parse(data) : [];
  },

  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => {
    const txs = DB.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    txs.push(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(txs));
    return newTx;
  },

  // --- Attendance Methods ---
  getAttendance: (): Attendance[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ABSENSI);
    return data ? JSON.parse(data) : [];
  },

  addAttendance: (name: string, status: 'MASUK' | 'KELUAR') => {
    const list = DB.getAttendance();
    const newItem: Attendance = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name,
      status,
    };
    list.push(newItem);
    localStorage.setItem(STORAGE_KEYS.ABSENSI, JSON.stringify(list));
    return newItem;
  },
  
  getTotalRevenue: (): number => {
    const txs = DB.getTransactions();
    return txs.reduce((acc, curr) => acc + curr.total, 0);
  }
};