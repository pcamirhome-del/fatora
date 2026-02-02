
import React, { useState, useEffect } from 'react';
import { PlusCircle, List, FileBox, LogOut, LayoutDashboard, Search, Trash2, Printer } from 'lucide-react';
import { Invoice } from './types';
import InvoiceModal from './components/InvoiceModal';
import { APP_LOGO } from './constants';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mrs_fashion_invoices');
    if (saved) {
      try {
        setInvoices(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse invoices', e);
      }
    }
  }, []);

  // Save to localStorage whenever invoices change
  useEffect(() => {
    localStorage.setItem('mrs_fashion_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleSaveInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    setIsModalOpen(false);
  };

  const deleteInvoice = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans" dir="rtl">
      {/* Sidebar - no-print */}
      <aside className="w-64 bg-white text-indigo-900 flex flex-col shadow-2xl no-print fixed h-full z-40 border-l border-gray-100">
        <div className="p-6 flex flex-col items-center gap-4 border-b border-gray-50">
          <img 
            src={APP_LOGO} 
            alt="Logo" 
            className="w-32 h-32 object-contain drop-shadow-sm" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Mr%26Mrs';
            }}
          />
          <h1 className="text-xl font-black text-center text-indigo-950 tracking-tight">
            Mr & Mrs Fashion
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl transition-all font-bold"
          >
            <LayoutDashboard size={20} />
            <span>لوحة التحكم</span>
          </button>
          
          <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
            الفواتير
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-200 group active:scale-95"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold text-lg">إنشاء فاتورة</span>
          </button>
          
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 rounded-xl transition-all"
          >
            <List size={20} />
            <span>قائمة الفواتير</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-50">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 no-print">
          <div>
            <h2 className="text-3xl font-black text-gray-900">سجل الفواتير</h2>
            <p className="text-gray-500 mt-1">إدارة جميع الفواتير الصادرة لشركة Mr & Mrs Fashion</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="بحث برقم الفاتورة أو اسم العميل..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-3 rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
            />
          </div>
        </header>

        {/* Invoice List Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden no-print">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 text-sm font-bold text-gray-600">رقم الفاتورة</th>
                  <th className="p-5 text-sm font-bold text-gray-600">اسم العميل</th>
                  <th className="p-5 text-sm font-bold text-gray-600">التاريخ</th>
                  <th className="p-5 text-sm font-bold text-gray-600">المنتج</th>
                  <th className="p-5 text-sm font-bold text-gray-600 text-left">الإجمالي</th>
                  <th className="p-5 text-sm font-bold text-gray-600 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-5 text-sm font-bold text-indigo-700">{inv.invoiceNumber}</td>
                      <td className="p-5">
                        <div className="text-sm font-bold text-gray-900">{inv.customerName}</div>
                        <div className="text-xs text-gray-400">{inv.phone1}</div>
                      </td>
                      <td className="p-5 text-sm text-gray-600">{inv.orderDate}</td>
                      <td className="p-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {inv.productName}
                        </span>
                      </td>
                      <td className="p-5 text-sm font-black text-gray-900 text-left">
                        {inv.total} ج.م
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                            onClick={() => {
                              alert('يمكنك طباعة الفاتورة عند إنشائها أو من خلال قائمة العمليات قريباً.');
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <Printer size={18} />
                          </button>
                          <button 
                            onClick={() => deleteInvoice(inv.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-400">
                      <FileBox size={48} className="mx-auto mb-4 opacity-20" />
                      <p>لا توجد فواتير مطابقة لبحثك</p>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 text-indigo-600 font-bold hover:underline"
                      >
                        أنشئ أول فاتورة الآن
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-8 text-center text-sm text-gray-400 no-print">
          &copy; {new Date().getFullYear()} Mr & Mrs Fashion - جميع الحقوق محفوظة
        </footer>
      </main>

      {/* Invoice Modal Popup */}
      <InvoiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveInvoice}
      />
    </div>
  );
};

export default App;
