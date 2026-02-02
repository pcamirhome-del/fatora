import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Download, Settings, MapPin, Type } from 'lucide-react';
import { EGYPT_GOVERNORATES, Invoice } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  onUpdateAppName: (name: string) => void;
  shippingRates: Record<string, number>;
  onUpdateShippingRates: (rates: Record<string, number>) => void;
  invoices: Invoice[];
  onImportInvoices: (invoices: Invoice[]) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, appName, onUpdateAppName, shippingRates, onUpdateShippingRates, invoices, onImportInvoices
}) => {
  const [localAppName, setLocalAppName] = useState(appName);
  const [selectedGov, setSelectedGov] = useState(EGYPT_GOVERNORATES[0]);
  const [currentShippingPrice, setCurrentShippingPrice] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalAppName(appName);
  }, [appName]);

  useEffect(() => {
    setCurrentShippingPrice(shippingRates[selectedGov] || 0);
  }, [selectedGov, shippingRates]);

  const handleSaveAppName = () => {
    onUpdateAppName(localAppName);
    alert('تم حفظ اسم البرنامج بنجاح');
  };

  const handleSaveShipping = () => {
    const newRates = { ...shippingRates, [selectedGov]: Number(currentShippingPrice) };
    onUpdateShippingRates(newRates);
    alert(`تم تحديث سعر الشحن لمحافظة ${selectedGov}`);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoices));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "invoice_system_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          if(confirm('هل أنت متأكد؟ سيتم استبدال البيانات الحالية بالبيانات المستوردة.')) {
            onImportInvoices(importedData);
            alert('تم استعادة النسخة الاحتياطية بنجاح');
          }
        } else {
          alert('ملف غير صالح');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة الملف');
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} />
            الإعدادات العامة
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* App Name Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-100">
              <Type size={20} />
              اسم البرنامج
            </h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={localAppName}
                onChange={(e) => setLocalAppName(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/60 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold backdrop-blur-sm"
                placeholder="أدخل اسم البرنامج الجديد"
              />
              <button onClick={handleSaveAppName} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200">حفظ</button>
            </div>
          </section>

          {/* Shipping Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-100">
              <MapPin size={20} />
              مصاريف الشحن
            </h3>
            <div className="bg-gray-50/50 backdrop-blur-sm p-4 rounded-xl space-y-4 border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">المحافظة</label>
                <select 
                  value={selectedGov} 
                  onChange={(e) => setSelectedGov(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold"
                >
                  {EGYPT_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-600 mb-2">سعر الشحن (ج.م)</label>
                 <div className="flex gap-3">
                   <input 
                      type="number" 
                      value={currentShippingPrice}
                      onChange={(e) => setCurrentShippingPrice(Number(e.target.value))}
                      className="flex-1 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold"
                   />
                   <button onClick={handleSaveShipping} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-lg shadow-green-200">حفظ السعر</button>
                 </div>
              </div>
            </div>
          </section>

          {/* Backup Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-black text-indigo-900 flex items-center gap-2 pb-2 border-b border-indigo-100">
              <Upload size={20} />
              النسخ الاحتياطي والاستعادة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={handleExportBackup} className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-400 transition-all group bg-white/50">
                <Download size={32} className="text-indigo-400 group-hover:text-indigo-600" />
                <span className="font-bold text-indigo-700">تصدير نسخة احتياطية</span>
                <span className="text-xs text-indigo-400">حفظ ملف JSON</span>
              </button>
              
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-green-200 rounded-xl hover:bg-green-50/50 hover:border-green-400 transition-all group bg-white/50">
                <Upload size={32} className="text-green-400 group-hover:text-green-600" />
                <span className="font-bold text-green-700">استعادة نسخة احتياطية</span>
                <span className="text-xs text-green-400">رفع ملف JSON</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;