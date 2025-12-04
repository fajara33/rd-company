import React, { useState, useEffect } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { DB } from '../services/db';
import { StockItem, CATEGORIES } from '../types';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');

  const loadItems = () => {
    setItems(DB.getStock());
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice || !newQty) return;

    DB.addStock({
      name: newName,
      category: newCategory,
      price: Number(newPrice),
      quantity: Number(newQty),
    });

    setNewName('');
    setNewPrice('');
    setNewQty('');
    loadItems();
    alert("Barang berhasil ditambahkan!");
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Stok</h1>
        <p className="text-gray-500">Atur ketersediaan barang baju, tas, dan pulsa.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Add Item Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Tambah Barang
          </h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang / Produk</label>
              <input 
                type="text" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Contoh: Pulsa 10k atau Kemeja"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                value={newCategory} 
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <input 
                  type="number" 
                  value={newPrice} 
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                <input 
                  type="number" 
                  value={newQty} 
                  onChange={e => setNewQty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Simpan Stok
            </button>
          </form>
        </div>

        {/* List Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
           <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Daftar Stok
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari barang..." 
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                />
              </div>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500">
                 <tr>
                   <th className="px-6 py-3 font-medium">Nama Barang</th>
                   <th className="px-6 py-3 font-medium">Kategori</th>
                   <th className="px-6 py-3 font-medium text-right">Harga</th>
                   <th className="px-6 py-3 font-medium text-right">Stok</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {filteredItems.map(item => (
                   <tr key={item.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                     <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${item.category === 'Konter HP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                         {item.category}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right font-medium">Rp {item.price.toLocaleString('id-ID')}</td>
                     <td className={`px-6 py-4 text-right font-bold ${item.quantity === 0 ? 'text-red-500' : item.quantity < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                       {item.quantity}
                     </td>
                   </tr>
                 ))}
                 {filteredItems.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Data tidak ditemukan.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};