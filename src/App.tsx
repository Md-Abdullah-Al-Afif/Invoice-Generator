import { useState, useRef, useCallback } from 'react';

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderZip: string;
  senderCountry: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  currency: string;
  taxRate: number;
  discount: number;
  notes: string;
  terms: string;
  paymentMethod: string;
}

const COLOR_PRESETS = [
  { name: 'Violet', primary: '#7c3aed', secondary: '#8b5cf6', light: '#ede9fe', text: '#5b21b6' },
  { name: 'Blue', primary: '#2563eb', secondary: '#3b82f6', light: '#dbeafe', text: '#1e40af' },
  { name: 'Emerald', primary: '#059669', secondary: '#10b981', light: '#d1fae5', text: '#065f46' },
  { name: 'Rose', primary: '#e11d48', secondary: '#f43f5e', light: '#ffe4e6', text: '#9f1239' },
  { name: 'Amber', primary: '#d97706', secondary: '#f59e0b', light: '#fef3c7', text: '#92400e' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', light: '#ccfbf1', text: '#115e59' },
  { name: 'Indigo', primary: '#4f46e5', secondary: '#6366f1', light: '#e0e7ff', text: '#3730a3' },
  { name: 'Pink', primary: '#db2777', secondary: '#ec4899', light: '#fce7f3', text: '#9d174d' },
  { name: 'Slate', primary: '#475569', secondary: '#64748b', light: '#f1f5f9', text: '#1e293b' },
  { name: 'Orange', primary: '#ea580c', secondary: '#f97316', light: '#ffedd5', text: '#9a3412' },
];

export function App() {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: '', quantity: 1, rate: 0 },
  ]);
  const [data, setData] = useState<InvoiceData>({
    invoiceNumber: 'INV-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderZip: '',
    senderCountry: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientZip: '',
    clientCountry: '',
    currency: 'BDT',
    taxRate: 0,
    discount: 0,
    notes: '',
    terms: '',
    paymentMethod: '',
  });

  const [activeTab, setActiveTab] = useState<'sender' | 'client' | 'items' | 'settings' | 'style'>('sender');
  const [logo, setLogo] = useState<string | null>(null);
  const [colorScheme, setColorScheme] = useState(COLOR_PRESETS[0]);
  const [customColor, setCustomColor] = useState('#7c3aed');
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyCustomColor = () => {
    const hex = customColor;
    // Generate lighter shade
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lightR = Math.min(255, r + Math.round((255 - r) * 0.85));
    const lightG = Math.min(255, g + Math.round((255 - g) * 0.85));
    const lightB = Math.min(255, b + Math.round((255 - b) * 0.85));
    const secR = Math.min(255, r + Math.round((255 - r) * 0.15));
    const secG = Math.min(255, g + Math.round((255 - g) * 0.15));
    const secB = Math.min(255, b + Math.round((255 - b) * 0.15));
    const darkR = Math.round(r * 0.7);
    const darkG = Math.round(g * 0.7);
    const darkB = Math.round(b * 0.7);
    setColorScheme({
      name: 'Custom',
      primary: hex,
      secondary: `#${secR.toString(16).padStart(2, '0')}${secG.toString(16).padStart(2, '0')}${secB.toString(16).padStart(2, '0')}`,
      light: `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`,
      text: `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`,
    });
  };

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount - data.discount;

  const currencySymbols: Record<string, string> = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    INR: '₹',
    CNY: '¥',
    BRL: 'R$',
    CHF: 'CHF',
  };

  const fmt = (amount: number) => {
    const sym = currencySymbols[data.currency] || data.currency;
    return `${sym}${amount.toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:outline-none transition-all text-sm';

  const tabs = [
    { id: 'sender' as const, label: 'From', icon: '🏢' },
    { id: 'client' as const, label: 'Bill To', icon: '👤' },
    { id: 'items' as const, label: 'Items', icon: '📦' },
    { id: 'settings' as const, label: 'Details', icon: '⚙️' },
    { id: 'style' as const, label: 'Style', icon: '🎨' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200">
      {/* Top Header */}
      <div
        className="py-5 px-6 shadow-md print:hidden"
        style={{ background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})` }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white text-xl">
              📄
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Invoice Generator</h1>
              <p className="text-white/70 text-xs">Create professional invoices with custom branding</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-medium flex items-center gap-2 text-sm border border-white/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 print:p-0 print:max-w-none">
        <div className="grid lg:grid-cols-[420px_1fr] gap-6">
          {/* ========== INPUT FORM ========== */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-2 text-xs font-semibold transition-all relative ${
                    activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <div
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: colorScheme.primary }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {/* ---- Sender Tab ---- */}
              {activeTab === 'sender' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-lg font-bold text-slate-900">Your Business Information</h2>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Business Name *</label>
                    <input
                      type="text"
                      value={data.senderName}
                      onChange={(e) => setData({ ...data, senderName: e.target.value })}
                      className={inputClass}
                      style={{ '--tw-ring-color': colorScheme.primary } as React.CSSProperties}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={data.senderEmail}
                        onChange={(e) => setData({ ...data, senderEmail: e.target.value })}
                        className={inputClass}
                        placeholder="email@business.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={data.senderPhone}
                        onChange={(e) => setData({ ...data, senderPhone: e.target.value })}
                        className={inputClass}
                        placeholder="+880 1234567890"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={data.senderAddress}
                      onChange={(e) => setData({ ...data, senderAddress: e.target.value })}
                      className={inputClass}
                      placeholder="123 Business Ave"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={data.senderCity}
                        onChange={(e) => setData({ ...data, senderCity: e.target.value })}
                        className={inputClass}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State / Province</label>
                      <input
                        type="text"
                        value={data.senderState}
                        onChange={(e) => setData({ ...data, senderState: e.target.value })}
                        className={inputClass}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ZIP / Postal Code</label>
                      <input
                        type="text"
                        value={data.senderZip}
                        onChange={(e) => setData({ ...data, senderZip: e.target.value })}
                        className={inputClass}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                      <input
                        type="text"
                        value={data.senderCountry}
                        onChange={(e) => setData({ ...data, senderCountry: e.target.value })}
                        className={inputClass}
                        placeholder="Bangladesh"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Client Tab ---- */}
              {activeTab === 'client' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-lg font-bold text-slate-900">Client Information</h2>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
                    <input
                      type="text"
                      value={data.clientName}
                      onChange={(e) => setData({ ...data, clientName: e.target.value })}
                      className={inputClass}
                      placeholder="Client Name or Business"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={data.clientEmail}
                        onChange={(e) => setData({ ...data, clientEmail: e.target.value })}
                        className={inputClass}
                        placeholder="client@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={data.clientPhone}
                        onChange={(e) => setData({ ...data, clientPhone: e.target.value })}
                        className={inputClass}
                        placeholder="+880 123456789"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={data.clientAddress}
                      onChange={(e) => setData({ ...data, clientAddress: e.target.value })}
                      className={inputClass}
                      placeholder="Client Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={data.clientCity}
                        onChange={(e) => setData({ ...data, clientCity: e.target.value })}
                        className={inputClass}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State / Province</label>
                      <input
                        type="text"
                        value={data.clientState}
                        onChange={(e) => setData({ ...data, clientState: e.target.value })}
                        className={inputClass}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">ZIP / Postal Code</label>
                      <input
                        type="text"
                        value={data.clientZip}
                        onChange={(e) => setData({ ...data, clientZip: e.target.value })}
                        className={inputClass}
                        placeholder="10001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                      <input
                        type="text"
                        value={data.clientCountry}
                        onChange={(e) => setData({ ...data, clientCountry: e.target.value })}
                        className={inputClass}
                        placeholder="Bangladesh"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Items Tab ---- */}
              {activeTab === 'items' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400">ITEM #{idx + 1}</span>
                          {items.length > 1 && (
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-400 hover:text-red-600 text-xs font-semibold transition-colors"
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className={inputClass}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-slate-500 mb-0.5">Qty</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                              className={inputClass}
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-0.5">Rate</label>
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className={inputClass}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-0.5">Amount</label>
                            <div
                              className="px-3 py-2.5 rounded-lg text-sm font-semibold"
                              style={{ backgroundColor: colorScheme.light, color: colorScheme.text }}
                            >
                              {fmt(item.quantity * item.rate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addItem}
                    className="w-full py-3 border-2 border-dashed rounded-xl hover:opacity-80 transition-all font-semibold text-sm"
                    style={{ borderColor: colorScheme.secondary, color: colorScheme.primary }}
                  >
                    + Add Line Item
                  </button>

                  {/* Quick totals */}
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: colorScheme.light }}>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal</span>
                        <span className="font-semibold">{fmt(subtotal)}</span>
                      </div>
                      {data.taxRate > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Tax ({data.taxRate}%)</span>
                          <span className="font-semibold">{fmt(taxAmount)}</span>
                        </div>
                      )}
                      {data.discount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Discount</span>
                          <span className="font-semibold">-{fmt(data.discount)}</span>
                        </div>
                      )}
                      <div className="border-t pt-1.5 flex justify-between font-bold" style={{ borderColor: colorScheme.primary, color: colorScheme.primary }}>
                        <span>Total</span>
                        <span>{fmt(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---- Settings Tab ---- */}
              {activeTab === 'settings' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={data.invoiceNumber}
                        onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                        className={inputClass}
                        placeholder="INV-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Currency</label>
                      <select
                        value={data.currency}
                        onChange={(e) => setData({ ...data, currency: e.target.value })}
                        className={inputClass}
                      >
                        <option value="BDT">BDT (৳)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="AUD">AUD (A$)</option>
                        <option value="CAD">CAD (C$)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="CNY">CNY (¥)</option>
                        <option value="BRL">BRL (R$)</option>
                        <option value="CHF">CHF</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice Date</label>
                      <input
                        type="date"
                        value={data.invoiceDate}
                        onChange={(e) => setData({ ...data, invoiceDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={data.dueDate}
                        onChange={(e) => setData({ ...data, dueDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={data.taxRate}
                        onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Discount ({currencySymbols[data.currency]})</label>
                      <input
                        type="number"
                        value={data.discount}
                        onChange={(e) => setData({ ...data, discount: parseFloat(e.target.value) || 0 })}
                        className={inputClass}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <input
                      type="text"
                      value={data.paymentMethod}
                      onChange={(e) => setData({ ...data, paymentMethod: e.target.value })}
                      className={inputClass}
                      placeholder="Cash, Bank Transfer, Bkash, Nagad , Rocket, Credit Card, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                    <textarea
                      value={data.notes}
                      onChange={(e) => setData({ ...data, notes: e.target.value })}
                      rows={3}
                      className={inputClass}
                      placeholder="Thank you for your business!"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Terms & Conditions</label>
                    <textarea
                      value={data.terms}
                      onChange={(e) => setData({ ...data, terms: e.target.value })}
                      rows={3}
                      className={inputClass}
                      placeholder="Payment is due within 30 days of the invoice date."
                    />
                  </div>
                </div>
              )}

              {/* ---- Style Tab ---- */}
              {activeTab === 'style' && (
                <div className="space-y-5 animate-fadeIn">
                  <h2 className="text-lg font-bold text-slate-900">Branding & Colors</h2>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Company Logo</label>
                    {logo ? (
                      <div className="relative inline-block">
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-32 h-32 object-contain border-2 border-dashed border-slate-300 rounded-xl p-2 bg-white"
                        />
                        <button
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow-md"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-slate-400 transition-colors bg-slate-50">
                          <div className="text-3xl mb-2">🖼️</div>
                          <p className="text-sm font-medium text-slate-600">Click to upload logo</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, SVG (max 2MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                    {logo && (
                      <label className="mt-2 inline-block cursor-pointer text-xs font-semibold hover:underline" style={{ color: colorScheme.primary }}>
                        Change logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Color Presets */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Color Theme</label>
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => {
                            setColorScheme(c);
                            setCustomColor(c.primary);
                          }}
                          className={`group relative p-1 rounded-xl border-2 transition-all ${
                            colorScheme.primary === c.primary
                              ? 'border-slate-900 shadow-md scale-105'
                              : 'border-transparent hover:border-slate-300'
                          }`}
                        >
                          <div className="w-full aspect-square rounded-lg" style={{ backgroundColor: c.primary }} />
                          <p className="text-[10px] text-center mt-1 font-semibold text-slate-600">{c.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Custom Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-12 h-10 rounded-lg cursor-pointer border border-slate-300"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono"
                        placeholder="#7c3aed"
                      />
                      <button
                        onClick={applyCustomColor}
                        className="px-4 py-2.5 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
                        style={{ backgroundColor: customColor }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="text-xs font-semibold text-slate-500 mb-3">COLOR PREVIEW</p>
                    <div className="flex gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colorScheme.primary }}>
                          Primary
                        </div>
                        <div className="h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: colorScheme.secondary }}>
                          Secondary
                        </div>
                        <div className="h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: colorScheme.light, color: colorScheme.text }}>
                          Light
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========== INVOICE PREVIEW ========== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between print:hidden">
              <h2 className="text-lg font-bold text-slate-900">📋 Live Preview</h2>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                style={{ backgroundColor: colorScheme.primary }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
            </div>

            <div
              ref={printRef}
              id="invoice-print"
              className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
            >
              {/* Invoice colored top bar */}
              <div className="h-2" style={{ background: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})` }} />

              <div className="p-8 md:p-10">
                {/* Header: Logo + INVOICE title */}
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-4">
                    {logo && (
                      <img src={logo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                    )}
                    <div>
                      {data.senderName ? (
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">{data.senderName}</h2>
                      ) : (
                        <h2 className="text-xl md:text-2xl font-bold text-slate-300 italic">Your Business</h2>
                      )}
                      {data.senderEmail && <p className="text-sm text-slate-500">{data.senderEmail}</p>}
                      {data.senderPhone && <p className="text-sm text-slate-500">{data.senderPhone}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: colorScheme.primary }}>
                      INVOICE
                    </h1>
                    {data.invoiceNumber && (
                      <p className="text-sm font-semibold mt-1" style={{ color: colorScheme.secondary }}>
                        #{data.invoiceNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                  {/* From */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colorScheme.primary }}>
                      From
                    </p>
                    <div className="text-sm text-slate-700 space-y-0.5">
                      {data.senderName && <p className="font-semibold text-slate-900">{data.senderName}</p>}
                      {data.senderAddress && <p>{data.senderAddress}</p>}
                      {(data.senderCity || data.senderState || data.senderZip) && (
                        <p>{[data.senderCity, data.senderState, data.senderZip].filter(Boolean).join(', ')}</p>
                      )}
                      {data.senderCountry && <p>{data.senderCountry}</p>}
                      {data.senderEmail && <p className="mt-1">{data.senderEmail}</p>}
                      {data.senderPhone && <p>{data.senderPhone}</p>}
                    </div>
                  </div>
                  {/* Bill To */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colorScheme.primary }}>
                      Bill To
                    </p>
                    <div className="text-sm text-slate-700 space-y-0.5">
                      {data.clientName ? (
                        <p className="font-semibold text-slate-900">{data.clientName}</p>
                      ) : (
                        <p className="text-slate-300 italic">Client Name</p>
                      )}
                      {data.clientAddress && <p>{data.clientAddress}</p>}
                      {(data.clientCity || data.clientState || data.clientZip) && (
                        <p>{[data.clientCity, data.clientState, data.clientZip].filter(Boolean).join(', ')}</p>
                      )}
                      {data.clientCountry && <p>{data.clientCountry}</p>}
                      {data.clientEmail && <p className="mt-1">{data.clientEmail}</p>}
                      {data.clientPhone && <p>{data.clientPhone}</p>}
                    </div>
                  </div>
                  {/* Invoice Details */}
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: colorScheme.primary }}>
                      Details
                    </p>
                    <div className="text-sm space-y-1.5">
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500">Invoice Date:</span>
                        <span className="font-medium text-slate-900 md:ml-2">{data.invoiceDate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between md:block">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-medium text-slate-900 md:ml-2">{data.dueDate || 'N/A'}</span>
                      </div>
                      {data.paymentMethod && (
                        <div className="flex justify-between md:block">
                          <span className="text-slate-500">Payment:</span>
                          <span className="font-medium text-slate-900 md:ml-2">{data.paymentMethod}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: colorScheme.primary }}>
                        <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider rounded-tl-lg">
                          Description
                        </th>
                        <th className="text-center py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-bold text-white uppercase tracking-wider rounded-tr-lg">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100"
                          style={{ backgroundColor: idx % 2 === 0 ? 'white' : colorScheme.light }}
                        >
                          <td className="py-3 px-4 text-sm text-slate-900">
                            {item.description || <span className="text-slate-300 italic">No description</span>}
                          </td>
                          <td className="py-3 px-4 text-sm text-center text-slate-600">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm text-right text-slate-600">{fmt(item.rate)}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-slate-900">
                            {fmt(item.quantity * item.rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-72">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-600 px-2">
                        <span>Subtotal</span>
                        <span className="font-medium">{fmt(subtotal)}</span>
                      </div>
                      {data.taxRate > 0 && (
                        <div className="flex justify-between text-sm text-slate-600 px-2">
                          <span>Tax ({data.taxRate}%)</span>
                          <span className="font-medium">{fmt(taxAmount)}</span>
                        </div>
                      )}
                      {data.discount > 0 && (
                        <div className="flex justify-between text-sm text-slate-600 px-2">
                          <span>Discount</span>
                          <span className="font-medium">-{fmt(data.discount)}</span>
                        </div>
                      )}
                      <div
                        className="flex justify-between py-3 px-4 rounded-lg mt-2"
                        style={{ backgroundColor: colorScheme.primary }}
                      >
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-lg font-extrabold text-white">{fmt(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes, Terms, Payment */}
                {(data.notes || data.terms || data.paymentMethod) && (
                  <div className="border-t border-slate-200 pt-6 space-y-4">
                    {data.notes && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colorScheme.primary }}>
                          Notes
                        </p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{data.notes}</p>
                      </div>
                    )}
                    {data.terms && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: colorScheme.primary }}>
                          Terms & Conditions
                        </p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{data.terms}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-slate-200 text-center">
                  <p className="text-xs font-semibold" style={{ color: colorScheme.secondary }}>
                    Thank you for your business!
                  </p>
                  <p className="text-xs font-semibold" style={{ color: colorScheme.secondary }}>
                    Made with ❤️ by <a href="https://mdabdullahalafif.vercel.app/" className="underline hover:text-slate-900">Afif</a>
                  </p>
                  {data.senderName && (
                    <p className="text-xs text-slate-400 mt-1">{data.senderName}</p>
                  )}
                </div>
              </div>

              {/* Bottom colored bar */}
              <div className="h-2" style={{ background: `linear-gradient(90deg, ${colorScheme.secondary}, ${colorScheme.primary})` }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print, #invoice-print * {
            visibility: visible;
          }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
