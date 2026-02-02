import React, { useState, useEffect } from 'react';
import { PlusCircle, List, FileBox, LogOut, LayoutDashboard, Search, Trash2, Edit3, Loader2, Cloud } from 'lucide-react';
import { Invoice } from './types';
import InvoiceModal from './components/InvoiceModal';
import { subscribeToInvoices, saveInvoiceToCloud, deleteInvoiceFromCloud } from './services/firebaseService';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load from Firebase on mount
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToInvoices((data) => {
      setInvoices(data);
      setIsLoading(false);
    });
    // The subscribe function uses onValue which persists, so we return cleanup if needed
  }, []);

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleSaveInvoice = async (savedInvoice: Invoice) => {
    try {
      await saveInvoiceToCloud(savedInvoice);
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("حدث خطأ أثناء الحفظ في السحابة. يرجى التحقق من الاتصال.");
    }
  };

  const deleteInvoice = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة من السحابة؟')) {
      try {
        await deleteInvoiceFromCloud(id);
      } catch (error) {
        alert("حدث خطأ أثناء الحذف.");
      }
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans" dir="rtl">
      {/* Sidebar - no-print */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col shadow-xl no-print fixed h-full z-40">
        <div className="p-6 border-b border-indigo-800">
          <h1 className="text-xl font-black flex items-center gap-2 tracking-tight">
            <FileBox className="text-indigo-300" />
            Mr & Mrs Fashion
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-800/50 hover:bg-indigo-800 rounded-xl transition-all">
            <LayoutDashboard size={20} />
            <span>لوحة التحكم</span>
          </button>
          
          <div className="pt-4 pb-2 text-xs font-bold text-indigo-400 uppercase tracking-widest px-4">
            الفواتير السحابية
          </div>
          
          <button 
            onClick={handleCreateInvoice}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-900/50 group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold">إنشاء فاتورة</span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-800 rounded-xl transition-all">
            <List size={20} />
            <span>قائمة الفواتير</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-2 px-4 py-2 text-indigo-300 text-xs font-bold">
            <Cloud size={14} />
            <span>متصل بالسحابة</span>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 mt-2 hover:bg-red-900/50 hover:text-red-200 rounded-xl transition-all">
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mr-64 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 no-print">
          <div>
            <h2 className="text-3xl font-black text-gray-900">سجل الفواتير السحابي</h2>
            <p className="text-gray-500 mt-1">يتم حفظ جميع البيانات تلقائياً على خوادم Google Firebase</p>
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

        {/* Invoice List Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden no-print min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-40 text-indigo-600">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-bold">جاري جلب البيانات من السحابة...</p>
            </div>
          ) : (
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
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {inv.productName}
                          </span>
                        </td>
                        <td className="p-5 text-sm font-black text-gray-900 text-left">
                          {inv.total} ج.م
                        </td>
                        <td className="p-5 text-center">
                          <div className="flex items-center justify-center gap-3">
                             <button 
                              onClick={() => handleEditInvoice(inv)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="تعديل"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => deleteInvoice(inv.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="حذف"
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
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-sm text-gray-400 no-print">
          &copy; {new Date().getFullYear()} Mr & Mrs Fashion - مزود بخدمة الحفظ السحابي
        </footer>
      </main>

      <InvoiceModal 
        isOpen={isModalOpen} 
        editingInvoice={editingInvoice}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }} 
        onSave={handleSaveInvoice}
      />
    </div>
  );
};

export default App;