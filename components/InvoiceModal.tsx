
import React, { useState } from 'react';
import { X, Save, Printer, FileText, FileSpreadsheet, FileBox } from 'lucide-react';
import { Invoice, InvoiceFormData } from '../types';
import { exportToExcel, exportToPDF, exportToWord } from '../services/exportService';
import { APP_LOGO } from '../constants';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    companyName: 'Mr & Mrs Fashion',
    customerName: '',
    phone1: '',
    phone2: '',
    address: '',
    orderDate: new Date().toISOString().split('T')[0],
    productName: '',
    quantity: 1,
    price: 0,
    shippingCost: 0,
  });

  const total = Number(formData.price) * Number(formData.quantity) + Number(formData.shippingCost);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.productName) {
      alert('يرجى ملء البيانات الأساسية (اسم العميل واسم المنتج)');
      return;
    }
    const newInvoice: Invoice = {
      ...formData,
      id: crypto.randomUUID(),
      total,
    };
    onSave(newInvoice);
  };

  const currentInvoice: Invoice = { ...formData, id: 'temp', total };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-indigo-700 text-white p-6 flex justify-between items-center no-print">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileBox size={28} />
            إنشاء فاتورة جديدة
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto bg-white" id="invoice-printable">
          {/* Brand Header for Printing */}
          <div className="flex justify-between items-start mb-10 border-b pb-8">
            <div className="flex flex-col gap-2">
              <img src={APP_LOGO} alt="Brand Logo" className="w-40 h-40 object-contain" />
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Mr & Mrs Fashion</h1>
            </div>
            <div className="text-left flex flex-col items-end">
              <div className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-black text-xl mb-4">
                فـاتـورة بـيـع
              </div>
              <p className="text-gray-500 font-bold">رقم الفاتورة: <span className="text-gray-900">{formData.invoiceNumber}</span></p>
              <p className="text-gray-500 font-bold">التاريخ: <span className="text-gray-900">{formData.orderDate}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4 no-print">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">تعديل رقم الفاتورة</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-700 mb-4 border-r-4 border-indigo-600 pr-3">بيانات العميل</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1 no-print">اسم العميل</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="أدخل اسم العميل بالكامل"
                    className="w-full px-4 py-2 border-0 border-b border-gray-100 rounded-lg focus:border-indigo-500 outline-none text-xl font-bold text-gray-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1 no-print">رقم الهاتف</label>
                    <input
                      type="text"
                      name="phone1"
                      value={formData.phone1}
                      onChange={handleChange}
                      placeholder="رقم الهاتف"
                      className="w-full px-4 py-2 border-0 border-b border-gray-100 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1 no-print">رقم آخر</label>
                    <input
                      type="text"
                      name="phone2"
                      value={formData.phone2}
                      onChange={handleChange}
                      placeholder="رقم هاتف آخر"
                      className="w-full px-4 py-2 border-0 border-b border-gray-100 rounded-lg focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1 no-print">العنوان</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="العنوان التفصيلي"
                    className="w-full px-4 py-2 border-0 border-b border-gray-100 rounded-lg focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8 shadow-sm">
            <table className="w-full text-center">
              <thead className="bg-indigo-50 text-indigo-900">
                <tr>
                  <th className="p-4 font-bold border-l border-white">اسم الصنف</th>
                  <th className="p-4 font-bold border-l border-white w-24">العدد</th>
                  <th className="p-4 font-bold w-32">السعر</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="p-4">
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      placeholder="اسم المنتج"
                      className="w-full bg-transparent text-center focus:outline-none font-bold"
                    />
                  </td>
                  <td className="p-4 border-r border-gray-50">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full bg-transparent text-center focus:outline-none font-bold"
                    />
                  </td>
                  <td className="p-4 border-r border-gray-50">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full bg-transparent text-center focus:outline-none font-bold"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-8 items-start">
             <div className="flex flex-col gap-4 w-full md:w-1/2">
                <div className="bg-gray-50 p-6 rounded-2xl text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 mb-8">إمضاء الاستلام</p>
                  <div className="border-t border-gray-300 w-full pt-2 text-xs text-gray-400">توقيع العميل</div>
                </div>
             </div>

             <div className="flex flex-col gap-3 w-full md:w-72">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg text-gray-600 font-bold">
                  <span>مصاريف التوصيل:</span>
                  <div className="no-print w-20">
                    <input
                      type="number"
                      name="shippingCost"
                      value={formData.shippingCost}
                      onChange={handleChange}
                      className="w-full bg-transparent text-left focus:outline-none"
                    />
                  </div>
                  <span className="print-only">{formData.shippingCost} ج.م</span>
                </div>
                <div className="flex justify-between items-center px-4 py-4 bg-indigo-600 text-white rounded-xl shadow-lg">
                  <span className="font-bold text-lg">الإجمالي:</span>
                  <span className="text-2xl font-black">{total} ج.م</span>
                </div>
             </div>
          </div>
          
          <div className="mt-12 text-center text-gray-400 text-xs border-t pt-4 hidden print:block">
            شكراً لتعاملكم مع مستر أند مسز فاشون - Mr & Mrs Fashion
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 flex flex-wrap gap-3 justify-end border-t no-print">
          <button
            onClick={() => exportToWord(currentInvoice)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors shadow-sm font-bold"
          >
            <FileText size={18} />
            تصدير Word
          </button>
          <button
            onClick={() => exportToExcel(currentInvoice)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm font-bold"
          >
            <FileSpreadsheet size={18} />
            تصدير Excel
          </button>
          <button
            onClick={() => exportToPDF(currentInvoice)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors shadow-sm font-bold"
          >
            <FileText size={18} />
            تصدير PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors shadow-sm font-bold"
          >
            <Printer size={18} />
            طباعة
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-md active:scale-95"
          >
            <Save size={18} />
            حفظ الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
