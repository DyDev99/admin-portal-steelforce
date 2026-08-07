'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Target,
  ShoppingCart,
  Star,
  Award,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';

const reps = [
  { name: 'Ahmad Reza', position: 'Senior Sales Rep', visits: 8, orders: 5, revenue: 48200, target: 92, online: true, initials: 'AR', color: 'from-blue-500 to-blue-600', rating: 4.8, province: 'Tehran' },
  { name: 'Sara Karimi', position: 'Sales Representative', visits: 6, orders: 3, revenue: 32400, target: 78, online: true, initials: 'SK', color: 'from-sky-500 to-sky-600', rating: 4.6, province: 'Isfahan' },
  { name: 'Mehdi Ahmadi', position: 'Field Sales Rep', visits: 7, orders: 4, revenue: 38900, target: 85, online: false, initials: 'MA', color: 'from-green-500 to-green-600', rating: 4.7, province: 'Fars' },
  { name: 'Reza Mohammadi', position: 'Senior Sales Rep', visits: 5, orders: 3, revenue: 28500, target: 71, online: true, initials: 'RM', color: 'from-amber-500 to-amber-600', rating: 4.5, province: 'Khorasan' },
  { name: 'Niloofar Sadr', position: 'Sales Representative', visits: 9, orders: 6, revenue: 52100, target: 95, online: true, initials: 'NS', color: 'from-purple-500 to-purple-600', rating: 4.9, province: 'Tehran' },
  { name: 'Omid Farahi', position: 'Field Sales Rep', visits: 4, orders: 2, revenue: 19800, target: 65, online: false, initials: 'OF', color: 'from-indigo-500 to-indigo-600', rating: 4.3, province: 'Azerbaijan' },
  { name: 'Leila Hosseini', position: 'Sales Representative', visits: 6, orders: 4, revenue: 35600, target: 82, online: true, initials: 'LH', color: 'from-rose-500 to-rose-600', rating: 4.7, province: 'Isfahan' },
  { name: 'Kian Mehrabi', position: 'Junior Sales Rep', visits: 3, orders: 1, revenue: 12400, target: 48, online: false, initials: 'KM', color: 'from-teal-500 to-teal-600', rating: 4.2, province: 'Khouzestan' },
];

export default function SalesRepsPage() {
  const [selectedRep, setSelectedRep] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Reps', value: '24', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Online Now', value: '18', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg. Target', value: '78%', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Top Performer', value: 'Niloofar S.', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <Card key={s.label} className="p-5 border-gray-100 card-shadow animate-fade-in-up opacity-0" style={{ borderRadius: '18px', animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.bg} mb-3`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="text-[12px] text-gray-400 font-500 mb-1" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className="text-[20px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Rep Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {reps.map((rep, i) => (
          <Card
            key={i}
            onClick={() => setSelectedRep(selectedRep === i ? null : i)}
            className={`p-5 border-gray-100 card-shadow hover:card-shadow-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up opacity-0 ${selectedRep === i ? 'ring-2 ring-blue-200' : ''}`}
            style={{ borderRadius: '18px', animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${rep.color} flex items-center justify-center shadow-md`}>
                    <span className="text-white text-sm font-700" style={{ fontWeight: 700 }}>{rep.initials}</span>
                  </div>
                  {rep.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{rep.name}</p>
                  <p className="text-[11px] text-gray-400">{rep.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50">
                <Star size={10} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-600 text-amber-600" style={{ fontWeight: 600 }}>{rep.rating}</span>
              </div>
            </div>

            {/* Province */}
            <div className="flex items-center gap-1.5 mb-4">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-[11px] text-gray-500">{rep.province}</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-xl bg-gray-50">
                <MapPin size={14} className="text-blue-500 mx-auto mb-1" />
                <p className="text-[14px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{rep.visits}</p>
                <p className="text-[9px] text-gray-400">Visits</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50">
                <ShoppingCart size={14} className="text-green-500 mx-auto mb-1" />
                <p className="text-[14px] font-700 text-gray-900" style={{ fontWeight: 700 }}>{rep.orders}</p>
                <p className="text-[9px] text-gray-400">Orders</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50">
                <TrendingUp size={14} className="text-amber-500 mx-auto mb-1" />
                <p className="text-[14px] font-700 text-gray-900" style={{ fontWeight: 700 }}>${(rep.revenue / 1000).toFixed(0)}k</p>
                <p className="text-[9px] text-gray-400">Revenue</p>
              </div>
            </div>

            {/* Target Progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-gray-400 font-500" style={{ fontWeight: 500 }}>Target Achievement</span>
                <span className={`text-[11px] font-700 ${rep.target >= 80 ? 'text-green-600' : rep.target >= 60 ? 'text-amber-600' : 'text-red-600'}`} style={{ fontWeight: 700 }}>{rep.target}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${rep.target >= 80 ? 'gradient-primary' : rep.target >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                  style={{ width: `${rep.target}%` }}
                />
              </div>
            </div>

            {/* Expanded Detail */}
            {selectedRep === i && (
              <div className="mt-4 pt-4 border-t border-gray-50 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Phone size={12} className="text-blue-500" /> +98 912 345 6789
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Mail size={12} className="text-blue-500" /> {rep.name.toLowerCase().replace(' ', '.')}@steelforce.com
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Calendar size={12} className="text-blue-500" /> Joined Jan 2024
                </div>
                <Button size="sm" className="w-full rounded-xl mt-2 gradient-primary text-white border-0">
                  View Full Profile
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
