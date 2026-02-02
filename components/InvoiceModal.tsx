import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Printer, FileText, FileSpreadsheet, FileBox, Edit3, Image as ImageIcon, Trash2, Calendar } from 'lucide-react';
import { Invoice, InvoiceFormData } from '../types';
import { exportToExcel, exportToPDF, exportToWord } from '../services/exportService';

interface InvoiceModalProps {
  isOpen: boolean;
  editingInvoice: Invoice | null;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, editingInvoice, onClose, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
    companyName: 'Mr & Mrs Fashion',
    companyLogo: '',
    customerName: '',
    phone1: '',
    phone2: '',
    address: '',
    orderDate: new Date().toISOString().split('T')[0],
    productName: '',
    quantity: 1,
    price: 0,
    shippingCost: 0,
    watermarkText: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingInvoice) {
        setFormData({
          invoiceNumber: editingInvoice.invoiceNumber,
          companyName: editingInvoice.companyName,
          companyLogo: editingInvoice.companyLogo || '',
          customerName: editingInvoice.customerName,
          phone1: editingInvoice.phone1,
          phone2: editingInvoice.phone2,
          address: editingInvoice.address,
          orderDate: editingInvoice.orderDate,
          productName: editingInvoice.productName,
          quantity: editingInvoice.quantity,
          price: editingInvoice.price,
          shippingCost: editingInvoice.shippingCost,
          watermarkText: editingInvoice.watermarkText || '',
        });
      } else {
        setFormData({
          invoiceNumber: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
          companyName: 'Mr & Mrs Fashion',
          companyLogo: '',
          customerName: '',
          phone1: '',
          phone2: '',
          address: '',
          orderDate: new Date().toISOString().split('T')[0],
          productName: '',
          quantity: 1,
          price: 0,
          shippingCost: 0,
          watermarkText: '',
        });
      }
    }
  }, [isOpen, editingInvoice]);

  const total = Number(formData.price) * Number(formData.quantity) + Number(formData.shippingCost);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, companyLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, companyLogo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.productName) {
      alert('يرجى ملء البيانات الأساسية (اسم العميل واسم المنتج)');
      return;
    }
    const savedInvoice: Invoice = {
      ...formData,
      id: editingInvoice ? editingInvoice.id : crypto.randomUUID(),
      total,
    };
    onSave(savedInvoice);
  };

  const currentInvoice: Invoice = { 
    ...formData, 
    id: editingInvoice ? editingInvoice.id : 'temp', 
    total 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`${editingInvoice ? 'bg-blue-600' : 'bg-indigo-700'} text-white p-6 flex justify-between items-center no-print transition-colors`}>
          <h2 className="text-2xl font-black flex items-center gap-2">
            {editingInvoice ? <Edit3 size={28} /> : <FileBox size={28} />}
            {editingInvoice ? 'تعديل الفاتورة بالكامل' : 'إنشاء فاتورة احترافية'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Inputs Section (Left Side - No Print) */}
          <div className="w-full md:w-1/3 p-6 bg-gray-50 border-l border-gray-100 overflow-y-auto no-print">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">بيانات الإعدادات</h3>
            
            <div className="space-y-5">
              {/* Invoice Number - HAND EDITABLE */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الفاتورة (AR-)</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="AR-000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-700"
                />
              </div>

              {/* Company Logo Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شعار الشركة (Logo)</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all text-gray-500 font-bold"
                  >
                    <ImageIcon size={20} />
                    <span>رفع صورة</span>
                  </button>
                  {formData.companyLogo && (
                    <button onClick={removeLogo} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>

              {/* Watermark Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>العلامة المائية</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">خلفية شفافة</span>
                </label>
                <input
                  type="text"
                  name="watermarkText"
                  value={formData.watermarkText}
                  onChange={handleChange}
                  placeholder="مثال: مدفوع / خاص / Mr & Mrs"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                 <h4 className="text-xs font-black text-gray-400 mb-4">بيانات العميل والطلب</h4>
                 <div className="space-y-4">
                    {/* Date Selection */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">تاريخ الطلب</label>
                      <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className="w-full px-4 py-3 bg-white border rounded-xl" />
                    </div>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="اسم العميل" className="w-full px-4 py-3 bg-white border rounded-xl font-bold" />
                    <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} placeholder="رقم الهاتف الأساسي" className="w-full px-4 py-3 bg-white border rounded-xl" />
                    <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} placeholder="رقم هاتف آخر" className="w-full px-4 py-3 bg-white border rounded-xl" />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="العنوان بالتفصيل" className="w-full px-4 py-3 bg-white border rounded-xl" />
                    <input type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="اسم الصنف" className="w-full px-4 py-3 bg-white border rounded-xl font-bold" />
                    <div className="grid grid-cols-2 gap-3">
                       <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="الكمية" className="px-4 py-3 bg-white border rounded-xl font-bold" />
                       <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="السعر" className="px-4 py-3 bg-white border rounded-xl font-bold" />
                    </div>
                    <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleChange} placeholder="توصيل" className="w-full px-4 py-3 bg-white border rounded-xl font-bold" />
                 </div>
              </div>
            </div>
          </div>

          {/* Preview Section (Right Side) */}
          <div className="flex-1 p-10 overflow-y-auto relative bg-white" id="invoice-printable">
            
            {/* Watermark Preview Overlay */}
            {formData.watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0 overflow-hidden select-none">
                <span className="text-[120px] font-black uppercase tracking-tighter -rotate-45 whitespace-nowrap">
                  {formData.watermarkText}
                </span>
              </div>
            )}

            <div className="relative z-10 space-y-8">
              {/* Top Header with Logo and Company Info */}
              <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-6">
                <div className="flex flex-col gap-1">
                  <h1 className="text-4xl font-black text-indigo-900 leading-none">{formData.companyName}</h1>
                  <span className="text-sm font-bold text-gray-400">لأرقى الموديلات والأزياء الحديثة</span>
                  <div className="mt-4 flex flex-col text-sm font-bold text-gray-500">
                     <span>رقم الفاتورة: <span className="text-indigo-600 font-black">{formData.invoiceNumber}</span></span>
                     <span>التاريخ: {formData.orderDate}</span>
                  </div>
                </div>
                {formData.companyLogo && (
                  <div className="w-24 h-24 p-2 bg-gray-50 rounded-2xl border flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={formData.companyLogo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Customer Info Card */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">بيانات العميل</h4>
                  <p className="text-xl font-black text-gray-900 mb-1">{formData.customerName || '---'}</p>
                  <p className="text-sm font-bold text-gray-500">{formData.address || 'العنوان غير محدد'}</p>
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">أرقام التواصل</h4>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{formData.phone1 || '---'}</p>
                  <p className="text-lg font-bold text-gray-800 leading-tight">{formData.phone2}</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b-2 border-gray-900 text-sm font-black text-gray-400">
                    <th className="py-3 pr-2">الصنف</th>
                    <th className="py-3 text-center">الكمية</th>
                    <th className="py-3 text-center">السعر</th>
                    <th className="py-3 pl-2 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="text-lg font-bold text-gray-900">
                    <td className="py-5 pr-2">{formData.productName || '---'}</td>
                    <td className="py-5 text-center">{formData.quantity}</td>
                    <td className="py-5 text-center">{formData.price} ج.م</td>
                    <td className="py-5 pl-2 text-left">{Number(formData.price) * Number(formData.quantity)} ج.م</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex flex-col items-end gap-2 pt-6 border-t-2 border-gray-900">
                 <div className="flex justify-between w-64 text-sm font-bold text-gray-500">
                    <span>مصاريف الشحن:</span>
                    <span>{formData.shippingCost} ج.م</span>
                 </div>
                 <div className="flex justify-between w-64 text-2xl font-black text-gray-900 bg-indigo-50 px-4 py-2 rounded-xl">
                    <span>الإجمالي:</span>
                    <span>{total} ج.م</span>
                 </div>
              </div>

              {/* Signature Section */}
              <div className="flex justify-between items-end pt-12">
                 <div className="text-center">
                    <div className="w-40 border-b border-gray-300 h-10"></div>
                    <span className="text-[10px] font-bold text-gray-400">إمضاء الاستلام</span>
                 </div>
                 <div className="text-indigo-900 font-black italic opacity-20 text-sm">
                    {formData.companyName}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 flex flex-wrap gap-3 justify-center border-t no-print">
          <div className="flex gap-2">
            <button onClick={() => exportToWord(currentInvoice)} className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border hover:bg-blue-600 hover:text-white transition-all" title="Word"><FileText size={20} /></button>
            <button onClick={() => exportToExcel(currentInvoice)} className="p-3 bg-white text-green-600 rounded-xl shadow-sm border hover:bg-green-600 hover:text-white transition-all" title="Excel"><FileSpreadsheet size={20} /></button>
            <button onClick={() => exportToPDF('invoice-printable', formData.invoiceNumber)} className="p-3 bg-white text-red-600 rounded-xl shadow-sm border hover:bg-red-600 hover:text-white transition-all" title="PDF"><FileBox size={20} /></button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold"
          >
            <Printer size={20} />
            <span>طباعة مباشر</span>
          </button>
          
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-10 py-3 ${editingInvoice ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-black rounded-xl transition-all shadow-lg active:scale-95`}
          >
            <Save size={20} />
            <span>{editingInvoice ? 'حفظ التعديلات' : 'إنشاء وحفظ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;