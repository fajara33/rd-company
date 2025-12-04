import React, { useState, useEffect } from 'react';
import { ShoppingBag, Shirt, Smartphone, Printer, X } from 'lucide-react';
import { DB } from '../services/db';
import { StockItem, LAUNDRY_SERVICES } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { detail: string; total: number; date: string; id: string } | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Printable Area */}
        <div id="receipt-print-area" className="p-6 bg-white flex-1 overflow-y-auto">
            <div className="text-center mb-6 border-b border-gray-200 pb-4">
                <div className="text-2xl font-bold text-gray-800 tracking-tight">RD COMPANY</div>
                <p className="text-xs text-gray-500 mt-1">Laundry • Store • Konter HP</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(data.date).toLocaleString('id-ID')}</p>
                <p className="text-xs text-gray-400">ID: {data.id.slice(-6)}</p>
            </div>
            
            <div className="font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {data.detail}
            </div>

            <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
            
            <div className="flex justify-between items-center font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>Rp {data.total.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-400">
                <p>Terima kasih atas kepercayaan Anda.</p>
                <p>Barang yang tidak diambil  > 30 hari resiko sendiri.</p>
            </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 no-print">
            <button 
                onClick={handlePrint}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Printer className="w-4 h-4" /> Cetak
            </button>
            <button 
                onClick={onClose}
                className="flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export const POS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'laundry' | 'retail' | 'konter'>('laundry');
  const [items, setItems] = useState<StockItem[]>([]);
  
  // Receipt State
  const [receiptData, setReceiptData] = useState<{ detail: string; total: number; date: string; id: string } | null>(null);

  // --- LAUNDRY STATE ---
  const [laundryName, setLaundryName] = useState('');
  const [laundryQty, setLaundryQty] = useState(''); // Weight or Pieces
  const [selectedServiceId, setSelectedServiceId] = useState(LAUNDRY_SERVICES[0].id);
  const [laundryPricePerUnit, setLaundryPricePerUnit] = useState(LAUNDRY_SERVICES[0].basePrice.toString());
  const [isExpress, setIsExpress] = useState(false);

  // --- RETAIL STATE ---
  const [retailItemId, setRetailItemId] = useState('');

  // --- KONTER STATE ---
  const [konterItemId, setKonterItemId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Load items for Retail and Konter
    setItems(DB.getStock());
  }, [activeTab, receiptData]); // Reload when receipt closes (stock updates)

  // Update laundry price when service changes
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedServiceId(newId);
    const service = LAUNDRY_SERVICES.find(s => s.id === newId);
    if (service) {
        // Reset express when changing service
        setIsExpress(false);
        setLaundryPricePerUnit(service.basePrice.toString());
    }
  };

  // Handle Express Toggle
  const handleExpressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsExpress(checked);
    
    // Auto adjust price for convenience (User can still edit manually)
    const currentPrice = parseInt(laundryPricePerUnit) || 0;
    if (checked) {
        setLaundryPricePerUnit((currentPrice * 1.5).toFixed(0));
    } else {
        // Try to revert (approximate)
        setLaundryPricePerUnit((currentPrice / 1.5).toFixed(0));
    }
  };

  // 1. LAUNDRY LOGIC
  const handleLaundrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(laundryQty);
    const price = parseInt(laundryPricePerUnit);

    if (!laundryName || isNaN(qty) || qty <= 0 || isNaN(price)) {
        alert("Mohon lengkapi data dengan benar.");
        return;
    }

    const service = LAUNDRY_SERVICES.find(s => s.id === selectedServiceId);
    if (!service) return;

    // Total Calculation based on Manual Price * Qty
    const total = Math.ceil(price * qty);
    
    const speedLabel = isExpress ? "EXPRESS (1 Hari)" : "REGULER (2-3 Hari)";
    
    const detail = 
`LAYANAN: LAUNDRY
Pelanggan: ${laundryName}
Tipe: ${service.name}
Paket: ${speedLabel}
Harga: Rp ${price.toLocaleString('id-ID')} / ${service.unit}
Berat/Jml: ${qty} ${service.unit}`;

    const tx = DB.addTransaction({
        type: 'LAUNDRY',
        detail,
        total,
        customerPhone: '-'
    });

    setReceiptData({ detail, total, date: tx.date, id: tx.id });
    
    // Reset Form
    setLaundryName('');
    setLaundryQty('');
    setIsExpress(false);
    // Reset price to base
    setLaundryPricePerUnit(service.basePrice.toString());
  };

  // 2. RETAIL LOGIC
  const handleRetailSubmit = () => {
    if (!retailItemId) return;
    const item = items.find(i => i.id === retailItemId);
    if (!item || item.quantity <= 0) {
        alert("Stok barang habis!");
        return;
    }

    DB.updateStockQuantity(item.id, -1);
    
    const total = item.price;
    const detail = 
`LAYANAN: TOKO (RETAIL)
Barang: ${item.name}
Kategori: ${item.category}
Harga: Rp ${item.price.toLocaleString('id-ID')}`;

    const tx = DB.addTransaction({
        type: 'RETAIL',
        detail,
        total
    });

    setReceiptData({ detail, total, date: tx.date, id: tx.id });
    setRetailItemId('');
  };

  // 3. KONTER LOGIC
  const handleKonterSubmit = () => {
    if (!konterItemId || !phoneNumber) {
        alert("Mohon lengkapi data.");
        return;
    }
    const item = items.find(i => i.id === konterItemId);
    if (!item || item.quantity <= 0) {
        alert("Stok/Saldo habis!");
        return;
    }

    DB.updateStockQuantity(item.id, -1);

    const total = item.price;
    const detail = 
`LAYANAN: KONTER HP
Produk: ${item.name}
No. HP: ${phoneNumber}
Harga: Rp ${item.price.toLocaleString('id-ID')}`;

    const tx = DB.addTransaction({
        type: 'KONTER',
        detail,
        total,
        customerPhone: phoneNumber
    });

    setReceiptData({ detail, total, date: tx.date, id: tx.id });
    setKonterItemId('');
    setPhoneNumber('');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Kasir (POS)</h1>
        <p className="text-gray-500">Pilih layanan transaksi.</p>
      </header>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-gray-200 rounded-xl w-full max-w-2xl mx-auto">
        <button
            onClick={() => setActiveTab('laundry')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'laundry' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
        >
            <Shirt className="w-4 h-4 hidden sm:block" /> Laundry
        </button>
        <button
            onClick={() => setActiveTab('retail')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'retail' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'
            }`}
        >
            <ShoppingBag className="w-4 h-4 hidden sm:block" /> Toko
        </button>
        <button
            onClick={() => setActiveTab('konter')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'konter' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
            }`}
        >
            <Smartphone className="w-4 h-4 hidden sm:block" /> Konter
        </button>
      </div>

      <div className="max-w-xl mx-auto">
        
        {/* === TAB LAUNDRY === */}
        {activeTab === 'laundry' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Shirt className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Input Laundry</h2>
                        <p className="text-xs text-gray-500">Cuci, Setrika, Karpet, dll</p>
                    </div>
                </div>

                <form onSubmit={handleLaundrySubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Bpk. Budi"
                            value={laundryName}
                            onChange={(e) => setLaundryName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
                        <select 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={selectedServiceId}
                            onChange={handleServiceChange}
                        >
                            {LAUNDRY_SERVICES.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Manual ({LAUNDRY_SERVICES.find(s => s.id === selectedServiceId)?.unit})</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                <input 
                                    type="number" 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"
                                    placeholder="0"
                                    value={laundryPricePerUnit}
                                    onChange={(e) => setLaundryPricePerUnit(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah / Berat</label>
                            <input 
                                type="number" 
                                step="0.1"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.0"
                                value={laundryQty}
                                onChange={(e) => setLaundryQty(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer w-full select-none">
                            <input 
                                type="checkbox" 
                                checked={isExpress}
                                onChange={handleExpressToggle}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <span className="font-semibold text-gray-800">Layanan Express (+50%)</span>
                                <p className="text-xs text-gray-500">Otomatis update harga (bisa diedit)</p>
                            </div>
                        </label>
                    </div>

                    {/* Total Preview */}
                    <div className="flex justify-between items-center px-4 py-2">
                        <span className="text-gray-500 font-medium">Estimasi Total:</span>
                        <span className="text-xl font-bold text-blue-600">
                            Rp {(Math.ceil((parseInt(laundryPricePerUnit) || 0) * (parseFloat(laundryQty) || 0))).toLocaleString('id-ID')}
                        </span>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all">
                        Proses Laundry
                    </button>
                </form>
            </div>
        )}

        {/* === TAB RETAIL === */}
        {activeTab === 'retail' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                         <h2 className="text-xl font-bold text-gray-800">Toko / Retail</h2>
                         <p className="text-xs text-gray-500">Baju, Tas, Aksesoris</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
                        <select 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
                            value={retailItemId}
                            onChange={(e) => setRetailItemId(e.target.value)}
                        >
                            <option value="">-- Cari Barang --</option>
                            {items.filter(i => i.category !== 'Konter HP').map(item => (
                                <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                                    {item.name} | Rp {item.price.toLocaleString('id-ID')} | Stok: {item.quantity}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleRetailSubmit}
                        disabled={!retailItemId}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all mt-4"
                    >
                        Bayar Barang
                    </button>
                </div>
            </div>
        )}

        {/* === TAB KONTER === */}
        {activeTab === 'konter' && (
             <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                         <h2 className="text-xl font-bold text-gray-800">Konter Pulsa</h2>
                         <p className="text-xs text-gray-500">Pulsa, Paket Data, Token</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / ID Pelanggan</label>
                        <input 
                            type="tel" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-lg tracking-wider"
                            placeholder="08xxxxxxxxxx"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Produk</label>
                        <select 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                            value={konterItemId}
                            onChange={(e) => setKonterItemId(e.target.value)}
                        >
                            <option value="">-- Pilih Pulsa/Data --</option>
                            {items.filter(i => i.category === 'Konter HP').map(item => (
                                <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                                    {item.name} | Rp {item.price.toLocaleString('id-ID')}
                                </option>
                            ))}
                        </select>
                         <p className="text-xs text-gray-400 mt-2">*Pastikan stok pulsa/saldo tersedia di gudang.</p>
                    </div>

                    <button 
                        onClick={handleKonterSubmit}
                        disabled={!konterItemId || !phoneNumber}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all mt-4"
                    >
                        Proses Transaksi
                    </button>
                </div>
            </div>
        )}

      </div>

      <ReceiptModal 
        isOpen={!!receiptData} 
        onClose={() => setReceiptData(null)} 
        data={receiptData} 
      />
    </div>
  );
};