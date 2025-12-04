import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DollarSign, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { DB } from '../services/db';
import { Transaction } from '../types';

export const Dashboard: React.FC = () => {
  const [revenue, setRevenue] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadData = () => {
    setRevenue(DB.getTotalRevenue());
    const txs = DB.getTransactions();
    setRecentTransactions(txs.slice(-5).reverse());

    // Prepare chart data (Revenue by Type)
    const laundryTotal = txs.filter(t => t.type === 'LAUNDRY').reduce((acc, t) => acc + t.total, 0);
    const retailTotal = txs.filter(t => t.type === 'RETAIL').reduce((acc, t) => acc + t.total, 0);
    
    setChartData([
      { name: 'Laundry', total: laundryTotal },
      { name: 'Retail', total: retailTotal },
    ]);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000); // Poll for updates
    return () => clearInterval(interval);
  }, []);

  const handleAttendance = () => {
    DB.addAttendance("Karyawan", "MASUK");
    alert("Absensi Masuk Berhasil!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Ringkasan aktivitas bisnis hari ini.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium opacity-80">Total Pendapatan</span>
          </div>
          <h2 className="text-3xl font-bold">
            Rp {revenue.toLocaleString('id-ID')}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center items-start">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Absensi Cepat</h3>
           </div>
           <button 
            onClick={handleAttendance}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
           >
             <Clock className="w-4 h-4" />
             Absen Masuk
           </button>
        </div>

         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-700">Analitik</h3>
           </div>
           <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Transaksi Terakhir</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-3 font-medium">Tanggal</th>
                <th className="px-6 py-3 font-medium">Tipe</th>
                <th className="px-6 py-3 font-medium">Detail</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">Belum ada data transaksi.</td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(tx.date).toLocaleDateString('id-ID')} <br/>
                      <span className="text-xs">{new Date(tx.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'LAUNDRY' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium whitespace-pre-wrap">{tx.detail}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      Rp {tx.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};