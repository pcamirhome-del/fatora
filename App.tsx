import React, { useState, useEffect } from 'react';
import { PlusCircle, List, FileBox, LogOut, LayoutDashboard, Search, Trash2, Edit3, Settings, TrendingUp, History, Menu } from 'lucide-react';
import { Invoice } from './types';
import InvoiceModal from './components/InvoiceModal';
import SettingsModal from './components/SettingsModal';
import SalesView from './components/SalesView';

type ViewMode = 'dashboard' | 'invoices' | 'sales';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  // Settings State
  const [appName, setAppName] = useState('Mr & Mrs Fashion');
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('mm_invoices');
    if (saved) try { setInvoices(JSON.parse(saved)); } catch (e) { console.error(e); }

    const savedName = localStorage.getItem('mm_app_name');
    if (savedName) setAppName(savedName);

    const savedRates = localStorage.getItem('mm_shipping_rates');
    if (savedRates) try { setShippingRates(JSON.parse(savedRates)); } catch (e) { console.error(e); }
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('mm_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('mm_app_name', appName);
  }, [appName]);

  useEffect(() => {
    localStorage.setItem('mm_shipping_rates', JSON.stringify(shippingRates));
  }, [shippingRates]);


  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
    setIsSidebarOpen(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleSaveInvoice = (savedInvoice: Invoice) => {
    const existingIndex = invoices.findIndex(inv => inv.id === savedInvoice.id);

    if (existingIndex >= 0) {
      const updatedInvoices = [...invoices];
      updatedInvoices[existingIndex] = savedInvoice;
      setInvoices(updatedInvoices);
    } else {
      setInvoices([savedInvoice, ...invoices]);
    }
    
    setIsModalOpen(false);
    setEditingInvoice(null);
    if (currentView === 'dashboard') {
       setCurrentView('invoices');
    }
  };

  const deleteInvoice = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleNavClick = (view: ViewMode) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex font-sans" dir="rtl">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 right-0 h-full w-72 z-50 transition-transform duration-300 ease-in-out
          bg-indigo-900/80 backdrop-blur-xl border-l border-white/10 shadow-2xl text-white
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2 tracking-tight">
            <FileBox className="text-indigo-300" />
            {appName}
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white/70 hover:text-white">
            <LogOut size={20} className="rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="pt-2 pb-2 text-xs font-bold text-indigo-200/70 uppercase tracking-widest px-4">
            الرئيسية
          </div>
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-white/20 shadow-lg border border-white/10' : 'hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} />
            <span>لوحة التحكم</span>
          </button>
          
          <div className="pt-4 pb-2 text-xs font-bold text-indigo-200/70 uppercase tracking-widest px-4">
            العمليات
          </div>
          
          <button 
            onClick={handleCreateInvoice}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 rounded-xl transition-all shadow-lg shadow-indigo-900/20 border border-indigo-400 group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold">إنشاء فاتورة</span>
          </button>
          
          <button 
             onClick={() => handleNavClick('invoices')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'invoices' ? 'bg-white/20 shadow-lg border border-white/10' : 'hover:bg-white/10'}`}
          >
            <History size={20} />
            <span>الفواتير السابقة</span>
          </button>

          <button 
             onClick={() => handleNavClick('sales')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'sales' ? 'bg-white/20 shadow-lg border border-white/10' : 'hover:bg-white/10'}`}
          >
            <TrendingUp size={20} />
            <span>المبيعات والأرباح</span>
          </button>
          
          <div className="pt-4 pb-2 text-xs font-bold text-indigo-200/70 uppercase tracking-widest px-4">
             النظام
          </div>

          <button 
             onClick={() => { setIsSettingsOpen(true); setIsSidebarOpen(false); }}
             className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-all"
          >
            <Settings size={20} />
            <span>الإعدادات</span>
          </button>

          <div className="pt-8 mt-4 border-t border-white/10">
            <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all text-red-200">
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen transition-all duration-300 md:mr-72 p-4 md:p-8">
        
        {/* Mobile Header */}
        <div className="flex items-center gap-4 mb-6 md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-3 bg-white/50 backdrop-blur-md rounded-xl text-indigo-900 shadow-sm border border-white/40"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-black text-indigo-900">{appName}</h1>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 drop-shadow-sm">
               {currentView === 'dashboard' && 'لوحة التحكم'}
               {currentView === 'invoices' && 'سجل الفواتير السابقة'}
               {currentView === 'sales' && 'تقارير المبيعات والأرباح'}
            </h2>
            <p className="text-gray-500 mt-1 font-medium">
               {currentView === 'dashboard' ? 'أهلاً بك في نظام إدارة الفواتير' : 'إدارة ومتابعة السجلات'}
            </p>
          </div>
          
          {currentView !== 'sales' && (
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="بحث برقم الفاتورة أو اسم العميل..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
              />
            </div>
          )}
        </header>

        {/* Dynamic Content */}
        {currentView === 'sales' ? (
          <SalesView 
             invoices={invoices} 
             onUpdateInvoice={(updatedInv) => handleSaveInvoice(updatedInv)} 
          />
        ) : (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 overflow-hidden no-print min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/50 border-b border-gray-100/50">
                    <th className="p-5 text-sm font-bold text-gray-600">رقم الفاتورة</th>
                    <th className="p-5 text-sm font-bold text-gray-600">اسم العميل</th>
                    <th className="p-5 text-sm font-bold text-gray-600">التاريخ</th>
                    <th className="p-5 text-sm font-bold text-gray-600">المنتج</th>
                    <th className="p-5 text-sm font-bold text-gray-600 text-left">الإجمالي</th>
                    <th className="p-5 text-sm font-bold text-gray-600 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/30">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/50 transition-colors group">
                        <td className="p-5 text-sm font-bold text-indigo-700">{inv.invoiceNumber}</td>
                        <td className="p-5">
                          <div className="text-sm font-bold text-gray-900">{inv.customerName}</div>
                          <div className="text-xs text-gray-500">
                             {inv.phone1}
                             {inv.governorate && ` - ${inv.governorate}`}
                          </div>
                        </td>
                        <td className="p-5 text-sm text-gray-600">{inv.orderDate}</td>
                        <td className="p-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100/50 text-indigo-700 border border-indigo-100">
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
                        <p>لا توجد بيانات للعرض</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-gray-500 no-print font-medium">
          &copy; {new Date().getFullYear()} {appName} - جميع الحقوق محفوظة
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
        shippingRates={shippingRates}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        appName={appName}
        onUpdateAppName={setAppName}
        shippingRates={shippingRates}
        onUpdateShippingRates={setShippingRates}
        invoices={invoices}
        onImportInvoices={setInvoices}
      />
    </div>
  );
};

export default App;