'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Search,
  Plus,
  Building2,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  Wallet,
  ShoppingCart,
  FileText,
  Activity,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';

const customers = [
  { code: 'CUST-001', company: 'Pars Steel Co.', phone: '+98 21 8845 1234', location: 'Tehran', rep: 'Ahmad Reza', creditLimit: 500000, outstanding: 125000, revenue: 1280000, initials: 'PS', color: 'from-blue-500 to-blue-600' },
  { code: 'CUST-002', company: 'Mobarakeh Steel', phone: '+98 31 3234 5678', location: 'Isfahan', rep: 'Sara Karimi', creditLimit: 800000, outstanding: 340000, revenue: 2450000, initials: 'MS', color: 'from-sky-500 to-sky-600' },
  { code: 'CUST-003', company: 'Hormozgan Steel', phone: '+98 76 3334 4444', location: 'Hormozgan', rep: 'Mehdi Ahmadi', creditLimit: 600000, outstanding: 0, revenue: 890000, initials: 'HS', color: 'from-green-500 to-green-600' },
  { code: 'CUST-004', company: 'Khouzestan Steel', phone: '+98 61 3444 5555', location: 'Khouzestan', rep: 'Reza Mohammadi', creditLimit: 400000, outstanding: 89000, revenue: 670000, initials: 'KS', color: 'from-amber-500 to-amber-600' },
  { code: 'CUST-005', company: 'Esfahan Steel Co.', phone: '+98 31 3555 6666', location: 'Isfahan', rep: 'Niloofar S.', creditLimit: 1000000, outstanding: 520000, revenue: 3200000, initials: 'ES', color: 'from-purple-500 to-purple-600' },
  { code: 'CUST-006', company: 'Ghadir Steel', phone: '+98 21 6666 7777', location: 'Tehran', rep: 'Omid Farahi', creditLimit: 350000, outstanding: 45000, revenue: 540000, initials: 'GS', color: 'from-rose-500 to-rose-600' },
  { code: 'CUST-007', company: 'Niru Steel', phone: '+98 21 7777 8888', location: 'Tehran', rep: 'Leila Hosseini', creditLimit: 450000, outstanding: 0, revenue: 720000, initials: 'NS', color: 'from-indigo-500 to-indigo-600' },
  { code: 'CUST-008', company: 'Mapna Steel', phone: '+98 26 8888 9999', location: 'Alborz', rep: 'Ahmad Reza', creditLimit: 900000, outstanding: 210000, revenue: 1850000, initials: 'MP', color: 'from-teal-500 to-teal-600' },
];

const tabs = ['Overview', 'Orders', 'Quotations', 'Visits', 'Payments', 'Activities'];

export default function CustomersPage() {
  const [selected, setSelected] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => !search || c.company.toLowerCase().includes(search.toLowerCase()));
  const selectedCustomer = customers[selected];

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-gray-100 card-shadow text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all"
          />
        </div>
        <Button size="sm" className="rounded-xl gradient-primary text-white border-0">
          <Plus size={15} className="mr-1.5" /> Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Customer List */}
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <Card
              key={c.code}
              onClick={() => setSelected(customers.indexOf(c))}
              className={`p-4 border-gray-100 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in-up opacity-0 ${selected === customers.indexOf(c) ? 'ring-2 ring-blue-200' : ''}`}
              style={{ borderRadius: '16px', animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <span className="text-white text-[13px] font-700" style={{ fontWeight: 700 }}>{c.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-600 text-gray-900 truncate" style={{ fontWeight: 600 }}>{c.company}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {c.location} · {c.code}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400">Outstanding</p>
                  <p className={`text-[12px] font-700 ${c.outstanding > 0 ? 'text-amber-600' : 'text-green-600'}`} style={{ fontWeight: 700 }}>
                    ${c.outstanding.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Lifetime Revenue</p>
                  <p className="text-[12px] font-700 text-gray-900" style={{ fontWeight: 700 }}>${(c.revenue / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Customer Detail */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile Card */}
          <Card className="p-6 border-gray-100 card-shadow animate-fade-in-up opacity-0" style={{ borderRadius: '18px', animationFillMode: 'forwards' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedCustomer.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <span className="text-white text-xl font-700" style={{ fontWeight: 700 }}>{selectedCustomer.initials}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-[18px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{selectedCustomer.company}</h2>
                <p className="text-[12px] text-gray-400 mb-2">{selectedCustomer.code}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1"><Phone size={12} className="text-blue-500" /> {selectedCustomer.phone}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500" /> {selectedCustomer.location}</span>
                  <span className="flex items-center gap-1"><Building2 size={12} className="text-blue-500" /> {selectedCustomer.rep}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Credit Limit', value: `$${(selectedCustomer.creditLimit / 1000).toFixed(0)}k`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Outstanding', value: `$${(selectedCustomer.outstanding / 1000).toFixed(0)}k`, icon: Wallet, color: selectedCustomer.outstanding > 0 ? 'text-amber-600' : 'text-green-600', bg: selectedCustomer.outstanding > 0 ? 'bg-amber-50' : 'bg-green-50' },
                { label: 'Lifetime Revenue', value: `$${(selectedCustomer.revenue / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-2xl bg-gray-50/50">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.bg} mb-2`}>
                    <s.icon size={15} className={s.color} />
                  </div>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                  <p className="text-[15px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Tabs */}
          <Card className="border-gray-100 card-shadow animate-fade-in-up opacity-0 overflow-hidden" style={{ borderRadius: '18px', animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-50 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-2.5 rounded-t-xl text-[12px] font-600 whitespace-nowrap transition-all duration-200 relative
                    ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
                  `}
                  style={{ fontWeight: 600 }}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full gradient-primary" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === 'Overview' && (
                <div className="space-y-4 animate-fade-in">
                  {[
                    { label: 'Total Orders', value: '42', icon: ShoppingCart, color: 'text-blue-600' },
                    { label: 'Active Quotations', value: '3', icon: FileText, color: 'text-amber-600' },
                    { label: 'Total Visits', value: '18', icon: MapPin, color: 'text-green-600' },
                    { label: 'Payments (YTD)', value: '$1.2M', icon: DollarSign, color: 'text-sky-600' },
                    { label: 'Last Activity', value: '2 hours ago', icon: Activity, color: 'text-purple-600' },
                    { label: 'Account Status', value: 'Active', icon: CheckCircle2Icon, color: 'text-green-600' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-[12px] text-gray-500 font-500 flex items-center gap-2" style={{ fontWeight: 500 }}>
                        <item.icon size={14} className={item.color} /> {item.label}
                      </span>
                      <span className="text-[13px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'Orders' && (
                <div className="space-y-2 animate-fade-in">
                  {['ORD-2845', 'ORD-2837', 'ORD-2830', 'ORD-2825'].map((oid, i) => (
                    <div key={oid} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-[12px] font-700 text-blue-600" style={{ fontWeight: 700 }}>{oid}</span>
                      <span className="text-[12px] text-gray-500">Aug {6 - i}, 2026</span>
                      <span className="text-[12px] font-600 text-gray-900" style={{ fontWeight: 600 }}>${[24500, 61200, 38500, 15800][i]}</span>
                      <span className="text-[10px] font-600 px-2 py-0.5 rounded-md bg-green-50 text-green-600" style={{ fontWeight: 600 }}>Completed</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab !== 'Overview' && activeTab !== 'Orders' && (
                <div className="text-center py-12 text-gray-400 text-[13px] animate-fade-in">
                  {activeTab} data will appear here
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2Icon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
