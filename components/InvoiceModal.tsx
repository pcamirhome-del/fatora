import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Printer, FileText, FileSpreadsheet, FileBox, Edit3, Image as ImageIcon, Trash2, Calendar, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Invoice, InvoiceFormData, EGYPT_GOVERNORATES } from '../types';
import { exportToExcel, exportToPDF, exportToWord } from '../services/exportService';

interface InvoiceModalProps {
  isOpen: boolean;
  editingInvoice: Invoice | null;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  shippingRates: Record<string, number>;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, editingInvoice, onClose, onSave, shippingRates }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrCodeImg, setQrCodeImg] = useState<string>('');
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
    pageTitle: 'فاتورة مبيعات',
    companyName: 'Mr & Mrs Fashion',
    companyLogo: '',
    customerName: '',
    phone1: '',
    phone2: '',
    address: '',
    governorate: '',
    orderDate: new Date().toISOString().split('T')[0],
    productName: '',
    quantity: 1,
    price: 0,
    shippingCost: 0,
    watermarkText: '',
    websiteUrl: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingInvoice) {
        setFormData({
          invoiceNumber: editingInvoice.invoiceNumber,
          pageTitle: editingInvoice.pageTitle || 'فاتورة مبيعات',
          companyName: editingInvoice.companyName,
          companyLogo: editingInvoice.companyLogo || '',
          customerName: editingInvoice.customerName,
          phone1: editingInvoice.phone1,
          phone2: editingInvoice.phone2,
          address: editingInvoice.address,
          governorate: editingInvoice.governorate || '',
          orderDate: editingInvoice.orderDate,
          productName: editingInvoice.productName,
          quantity: editingInvoice.quantity,
          price: editingInvoice.price,
          purchasePrice: editingInvoice.purchasePrice,
          shippingCost: editingInvoice.shippingCost,
          watermarkText: editingInvoice.watermarkText || '',
          websiteUrl: editingInvoice.websiteUrl || '',
        });
      } else {
        setFormData({
          invoiceNumber: `AR-${Math.floor(100000 + Math.random() * 900000)}`,
          pageTitle: 'فاتورة مبيعات',
          companyName: 'Mr & Mrs Fashion',
          companyLogo: '',
          customerName: '',
          phone1: '',
          phone2: '',
          address: '',
          governorate: '',
          orderDate: new Date().toISOString().split('T')[0],
          productName: '',
          quantity: 1,
          price: 0,
          shippingCost: 0, 
          watermarkText: '',
          websiteUrl: '',
        });
      }
    }
  }, [isOpen, editingInvoice]);

  useEffect(() => {
    const generateQR = async () => {
      let dataToEncode = formData.websiteUrl;
      if (!dataToEncode) {
         dataToEncode = `${formData.companyName} - Invoice: ${formData.invoiceNumber} - Total: ${Number(formData.price) * Number(formData.quantity) + Number(formData.shippingCost)}`;
      }
      try {
        const dataUrl = await QRCode.toDataURL(dataToEncode, { width: 150, margin: 1 });
        setQrCodeImg(dataUrl);
      } catch (err) {
        console.error("Error generating QR code", err);
      }
    };
    if (isOpen) {
        generateQR();
    }
  }, [formData.websiteUrl, formData.invoiceNumber, formData.companyName, isOpen]);

  const total = Number(formData.price) * Number(formData.quantity) + Number(formData.shippingCost);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'governorate') {
        const rate = shippingRates[value];
        if (rate !== undefined) {
          newData.shippingCost = rate;
        }
      }
      return newData;
    });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white/95 backdrop-blur-md w-full max-w-6xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col h-full md:max-h-[95vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`${editingInvoice ? 'bg-blue-600/90' : 'bg-indigo-700/90'} backdrop-blur-md text-white p-4 md:p-6 flex justify-between items-center no-print sticky top-0 z-20`}>
          <h2 className="text-lg md:text-2xl font-black flex items-center gap-2">
            {editingInvoice ? <Edit3 size={24} /> : <FileBox size={24} />}
            {editingInvoice ? 'تعديل الفاتورة' : 'إنشاء فاتورة'}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          
          {/* Inputs Section (Left Side) */}
          <div className="w-full lg:w-1/3 p-4 md:p-6 bg-gray-50/50 backdrop-blur-sm border-l border-gray-100 overflow-y-auto no-print order-2 lg:order-1 h-full">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">بيانات الإعدادات</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">رقم الفاتورة</label>
                  <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-indigo-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الفاتورة</label>
                  <input type="text" name="pageTitle" value={formData.pageTitle} onChange={handleChange} className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">شعار الشركة</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/80 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all text-gray-500 font-bold">
                    <ImageIcon size={20} />
                    <span>رفع صورة</span>
                  </button>
                  {formData.companyLogo && (
                    <button onClick={removeLogo} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">العلامة المائية</label>
                <input type="text" name="watermarkText" value={formData.watermarkText} onChange={handleChange} className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none mb-3" />
                <label className="block text-sm font-bold text-gray-700 mb-2">رابط الموقع (QR)</label>
                <input type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-left" dir="ltr" />
              </div>

              <div className="border-t pt-4 mt-4">
                 <h4 className="text-xs font-black text-gray-400 mb-4">بيانات العميل والطلب</h4>
                 <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">تاريخ الطلب</label>
                      <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} className="w-full px-4 py-3 bg-white/80 border rounded-xl" />
                    </div>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="اسم العميل" className="w-full px-4 py-3 bg-white/80 border rounded-xl font-bold" />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" name="phone1" value={formData.phone1} onChange={handleChange} placeholder="رقم الهاتف" className="w-full px-4 py-3 bg-white/80 border rounded-xl" />
                        <input type="text" name="phone2" value={formData.phone2} onChange={handleChange} placeholder="رقم آخر" className="w-full px-4 py-3 bg-white/80 border rounded-xl" />
                    </div>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="العنوان بالتفصيل" className="w-full px-4 py-3 bg-white/80 border rounded-xl" />
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">المحافظة (لتحديد الشحن)</label>
                      <select name="governorate" value={formData.governorate} onChange={handleChange} className="w-full px-4 py-3 bg-white/80 border rounded-xl font-bold text-indigo-900">
                        <option value="">اختر المحافظة...</option>
                        {EGYPT_GOVERNORATES.map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>

                    <div className="h-px bg-gray-200 my-2"></div>

                    <input type="text" name="productName" value={formData.productName} onChange={handleChange} placeholder="اسم الصنف" className="w-full px-4 py-3 bg-white/80 border rounded-xl font-bold" />
                    <div className="grid grid-cols-2 gap-3">
                       <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="الكمية" className="px-4 py-3 bg-white/80 border rounded-xl font-bold" />
                       <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="السعر" className="px-4 py-3 bg-white/80 border rounded-xl font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 mb-1">مصاريف الشحن</label>
                       <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleChange} placeholder="توصيل" className="w-full px-4 py-3 bg-white/80 border rounded-xl font-bold text-green-700" />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Preview Section (Right Side) */}
          <div className="flex-1 p-4 md:p-10 overflow-y-auto relative bg-white flex flex-col justify-between order-1 lg:order-2 min-h-[500px]" id="invoice-printable">
            
            {/* Watermark */}
            {formData.watermarkText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] z-0 overflow-hidden select-none">
                <span className="text-[80px] md:text-[120px] font-black uppercase tracking-tighter -rotate-45 whitespace-nowrap">
                  {formData.watermarkText}
                </span>
              </div>
            )}

            <div className="relative z-10 space-y-8 flex-1">
              {/* Header */}
              <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl md:text-4xl font-black text-indigo-900 leading-none">{formData.companyName}</h1>
                  <h2 className="text-base md:text-lg font-bold text-gray-500 mt-1">{formData.pageTitle}</h2>
                  <div className="mt-2 flex flex-col text-sm font-bold text-gray-500">
                     <span>رقم الفاتورة: &nbsp;<span className="text-indigo-600 font-black">{formData.invoiceNumber}</span></span>
                     <span>التاريخ: &nbsp;{formData.orderDate}</span>
                  </div>
                </div>
                {formData.companyLogo && (
                  <div className="w-16 h-16 md:w-24 md:h-24 p-2 bg-gray-50 rounded-2xl border flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={formData.companyLogo} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-3xl p-4 md:p-6 border border-gray-100 grid grid-cols-2 gap-4 md:gap-8">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">بيانات العميل</h4>
                  <p className="text-lg md:text-xl font-black text-gray-900 mb-1">{formData.customerName || '---'}</p>
                  <p className="text-xs md:text-sm font-bold text-gray-500">
                    {formData.address || 'العنوان غير محدد'}
                    {formData.governorate && ` - ${formData.governorate}`}
                  </p>
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">أرقام التواصل</h4>
                  <p className="text-base md:text-lg font-bold text-gray-800 leading-tight">{formData.phone1 || '---'}</p>
                  <p className="text-base md:text-lg font-bold text-gray-800 leading-tight">{formData.phone2}</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-right min-w-[300px]">
                  <thead>
                    <tr className="border-b-2 border-gray-900 text-sm font-black text-gray-400">
                      <th className="py-3 pr-2">الصنف</th>
                      <th className="py-3 text-center">الكمية</th>
                      <th className="py-3 text-center">السعر</th>
                      <th className="py-3 pl-2 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="text-base md:text-lg font-bold text-gray-900">
                      <td className="py-5 pr-2">{formData.productName || '---'}</td>
                      <td className="py-5 text-center">{formData.quantity}</td>
                      <td className="py-5 text-center">{formData.price} ج.م</td>
                      <td className="py-5 pl-2 text-left">{Number(formData.price) * Number(formData.quantity)} ج.م</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex flex-col items-end gap-2 pt-6 border-t-2 border-gray-900">
                 <div className="flex justify-between w-full md:w-64 text-sm font-bold text-gray-500">
                    <span>مصاريف الشحن:</span>
                    <span>{formData.shippingCost} ج.م</span>
                 </div>
                 <div className="flex justify-between w-full md:w-64 text-xl md:text-2xl font-black text-gray-900 bg-indigo-50 px-4 py-2 rounded-xl">
                    <span>الإجمالي:</span>
                    <span>{total} ج.م</span>
                 </div>
              </div>
            </div>

            {/* Footer with Signature and QR Code */}
            <div className="relative pt-8 md:pt-12 mt-8 flex justify-between items-end">
               <div className="text-center">
                  <div className="w-24 md:w-40 border-b border-gray-300 h-10"></div>
                  <span className="text-[10px] font-bold text-gray-400">إمضاء الاستلام</span>
               </div>
               
               <div className="flex items-center gap-3 bg-white p-2 border border-gray-100 rounded-lg shadow-sm">
                 {qrCodeImg && (
                   <img src={qrCodeImg} alt="QR Code" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                 )}
               </div>
            </div>

            <div className="mt-4 text-center">
               <p style={{ fontFamily: 'Arial', fontSize: '10pt' }} className="text-gray-500 font-bold">شكرا لتعاملكم معنا</p>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50/90 backdrop-blur-md p-4 md:p-6 flex flex-wrap gap-3 justify-center border-t no-print order-3">
          <div className="flex gap-2 w-full md:w-auto justify-center">
            <button onClick={() => exportToWord(currentInvoice)} className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border hover:bg-blue-600 hover:text-white transition-all" title="Word"><FileText size={20} /></button>
            <button onClick={() => exportToExcel(currentInvoice)} className="p-3 bg-white text-green-600 rounded-xl shadow-sm border hover:bg-green-600 hover:text-white transition-all" title="Excel"><FileSpreadsheet size={20} /></button>
            <button onClick={() => exportToPDF('invoice-printable', formData.invoiceNumber)} className="p-3 bg-white text-red-600 rounded-xl shadow-sm border hover:bg-red-600 hover:text-white transition-all" title="PDF"><FileBox size={20} /></button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold"
          >
            <Printer size={20} />
            <span className="md:inline">طباعة</span>
          </button>
          
          <button
            onClick={handleSave}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 md:px-10 py-3 ${editingInvoice ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-black rounded-xl transition-all shadow-lg active:scale-95`}
          >
            <Save size={20} />
            <span>{editingInvoice ? 'حفظ' : 'إنشاء وحفظ'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;