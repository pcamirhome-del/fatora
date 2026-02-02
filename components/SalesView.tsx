import React, { useState } from 'react';
import { Invoice } from '../types';
import { Save, TrendingUp, TrendingDown, DollarSign, Edit } from 'lucide-react';

interface SalesViewProps {
  invoices: Invoice[];
  onUpdateInvoice: (invoice: Invoice) => void;
}

const SalesView: React.FC<SalesViewProps> = ({ invoices, onUpdateInvoice }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPurchasePrice, setTempPurchasePrice] = useState<number>(0);

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPurchaseCost = invoices.reduce((sum, inv) => sum + ((inv.purchasePrice || 0) * inv.quantity), 0);
  const netProfit = totalSales - totalPurchaseCost; // Simplification: Total Revenue - Total Cost of Goods

  const handleEditClick = (inv: Invoice) => {
    setEditingId(inv.id);
    setTempPurchasePrice(inv.purchasePrice || 0);
  };

  const handleSavePurchasePrice = (inv: Invoice) => {
    onUpdateInvoice({
      ...inv,
      purchasePrice: tempPurchasePrice
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">إجمالي المبيعات</p>
              <h3 className="text-3xl font-black text-indigo-900">{totalSales.toLocaleString()} <span className="text-sm font-medium text-gray-400">ج.م</span></h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">تكلفة الشراء (البضاعة)</p>
              <h3 className="text-3xl font-black text-red-900">{totalPurchaseCost.toLocaleString()} <span className="text-sm font-medium text-gray-400">ج.م</span></h3>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl text-red-600">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">صافي الربح التقديري</p>
              <h3 className="text-3xl font-black text-green-900">{netProfit.toLocaleString()} <span className="text-sm font-medium text-gray-400">ج.م</span></h3>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Price Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-800">تحديد أسعار الشراء وحساب الأرباح</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-sm font-bold text-gray-600">رقم الفاتورة</th>
                <th className="p-4 text-sm font-bold text-gray-600">المنتج</th>
                <th className="p-4 text-sm font-bold text-gray-600">الكمية</th>
                <th className="p-4 text-sm font-bold text-gray-600">سعر البيع (الوحدة)</th>
                <th className="p-4 text-sm font-bold text-gray-600 bg-yellow-50/50">سعر الشراء (الوحدة)</th>
                <th className="p-4 text-sm font-bold text-gray-600">الربح (الإجمالي)</th>
                <th className="p-4 text-sm font-bold text-gray-600 text-center">حفظ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const isEditing = editingId === inv.id;
                const unitProfit = inv.price - (inv.purchasePrice || 0);
                const totalProfit = unitProfit * inv.quantity;
                
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-indigo-700">{inv.invoiceNumber}</td>
                    <td className="p-4 text-sm font-medium">{inv.productName}</td>
                    <td className="p-4 font-bold">{inv.quantity}</td>
                    <td className="p-4 text-sm text-gray-600">{inv.price} ج.م</td>
                    <td className="p-4 bg-yellow-50/30">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempPurchasePrice}
                          onChange={(e) => setTempPurchasePrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                          autoFocus
                        />
                      ) : (
                        <span className="font-bold text-gray-700">
                          {inv.purchasePrice ? `${inv.purchasePrice} ج.م` : <span className="text-red-300 text-xs">غير محدد</span>}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`font-black ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {inv.purchasePrice ? `${totalProfit.toLocaleString()} ج.م` : '-'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {isEditing ? (
                        <button 
                          onClick={() => handleSavePurchasePrice(inv)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Save size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(inv)}
                          className="p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesView;