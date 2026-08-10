'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  XCircle,
  Navigation,
  Calendar,
  Route,
  TrendingUp,
  Users,
  Timer,
} from 'lucide-react';
import { useState } from 'react';

const visitCards = [
  { customer: 'Pars Steel Co.', rep: 'Ahmad Reza', checkIn: '08:30 AM', checkOut: '09:45 AM', duration: '1h 15m', status: 'Completed', gps: '35.7219, 51.3347', photo: true },
  { customer: 'Mobarakeh Steel', rep: 'Sara Karimi', checkIn: '09:15 AM', checkOut: null, duration: 'Ongoing', status: 'In Progress', gps: '32.6539, 51.6680', photo: false },
  { customer: 'Hormozgan Steel', rep: 'Mehdi Ahmadi', checkIn: '10:00 AM', checkOut: null, duration: 'Scheduled', status: 'Scheduled', gps: '27.1832, 56.2666', photo: false },
  { customer: 'Khouzestan Steel', rep: 'Reza Mohammadi', checkIn: '11:30 AM', checkOut: '12:45 PM', duration: '1h 15m', status: 'Completed', gps: '31.3183, 48.6706', photo: true },
  { customer: 'Esfahan Steel Co.', rep: 'Niloofar S.', checkIn: '01:00 PM', checkOut: null, duration: 'Scheduled', status: 'Scheduled', gps: '32.6539, 51.6680', photo: false },
  { customer: 'Ghadir Steel', rep: 'Omid Farahi', checkIn: '02:15 PM', checkOut: null, duration: 'Scheduled', status: 'Scheduled', gps: '35.7219, 51.3347', photo: false },
];

const timeline = [
  { time: '08:30 AM', title: 'Checked in at Pars Steel Co.', desc: 'GPS verified · Tehran', type: 'check-in', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  { time: '09:45 AM', title: 'Checked out from Pars Steel Co.', desc: 'Duration: 1h 15m · Order placed', type: 'check-out', icon: XCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  { time: '09:15 AM', title: 'Checked in at Mobarakeh Steel', desc: 'GPS verified · Isfahan', type: 'check-in', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  { time: '11:30 AM', title: 'Checked in at Khouzestan Steel', desc: 'GPS verified · Khouzestan', type: 'check-in', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  { time: '12:45 PM', title: 'Checked out from Khouzestan Steel', desc: 'Duration: 1h 15m', type: 'check-out', icon: XCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const statusColors: Record<string, string> = {
  Completed: 'bg-green-50 text-green-600 border-green-100',
  'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
  Scheduled: 'bg-gray-50 text-gray-500 border-gray-100',
};

const calendarDays = [
  { day: 1, visits: 3 }, { day: 2, visits: 5 }, { day: 3, visits: 2 }, { day: 4, visits: 6 },
  { day: 5, visits: 4 }, { day: 6, visits: 7 }, { day: 7, visits: 3 }, { day: 8, visits: 5 },
  { day: 9, visits: 4 }, { day: 10, visits: 6 }, { day: 11, visits: 8 }, { day: 12, visits: 5 },
  { day: 13, visits: 4 }, { day: 14, visits: 6 }, { day: 15, visits: 7 }, { day: 16, visits: 9 },
  { day: 17, visits: 5 }, { day: 18, visits: 4 }, { day: 19, visits: 6 }, { day: 20, visits: 7 },
  { day: 21, visits: 5 }, { day: 22, visits: 8 }, { day: 23, visits: 6 }, { day: 24, visits: 4 },
  { day: 25, visits: 5 }, { day: 26, visits: 7 }, { day: 27, visits: 6 }, { day: 28, visits: 5 },
  { day: 29, visits: 4 }, { day: 30, visits: 6 }, { day: 31, visits: 0 },
];

export default function VisitsPage() {
  const [selectedDay, setSelectedDay] = useState(6);

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Today's Visits", value: '12', total: '18', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', progress: 67 },
          { label: 'Completed', value: '8', total: '12', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', progress: 67 },
          { label: 'In Progress', value: '1', total: '12', icon: Timer, color: 'text-amber-600', bg: 'bg-amber-50', progress: 8 },
          { label: 'Completion Rate', value: '67%', total: '', icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-50', progress: 67 },
        ].map((s, i) => (
          <Card key={s.label} className="p-5 border-gray-100 card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in-up opacity-0" style={{ borderRadius: '18px', animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </div>
              {s.total && <span className="text-[11px] text-gray-400">of {s.total}</span>}
            </div>
            <p className="text-[12px] text-gray-400 font-500 mb-1" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className="text-[24px] font-700 text-gray-900 mb-3" style={{ fontWeight: 700 }}>{s.value}</p>
            <div className="h-1.5 rounded-full bg-gray-50 overflow-hidden">
              <div className="h-full rounded-full gradient-primary transition-all duration-1000" style={{ width: `${s.progress}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visit Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-700 text-gray-900" style={{ fontWeight: 700 }}>Today&apos;s Visit Cards</h2>
            <Button variant="outline" size="sm" className="rounded-xl text-[12px]">
              <Route size={14} className="mr-1.5" /> Daily Route
            </Button>
          </div>
          {visitCards.map((visit, i) => (
            <Card key={i} className="p-5 border-gray-100 card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up opacity-0" style={{ borderRadius: '18px', animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-600 text-gray-900 truncate" style={{ fontWeight: 600 }}>{visit.customer}</p>
                    <p className="text-[11px] text-gray-400">{visit.rep}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-600 border flex-shrink-0 ${statusColors[visit.status]}`} style={{ fontWeight: 600 }}>
                  {visit.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Check In</p>
                  <p className="text-[12px] font-600 text-gray-700" style={{ fontWeight: 600 }}>{visit.checkIn}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Check Out</p>
                  <p className="text-[12px] font-600 text-gray-700" style={{ fontWeight: 600 }}>{visit.checkOut || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">Duration</p>
                  <p className="text-[12px] font-600 text-gray-700 flex items-center gap-1" style={{ fontWeight: 600 }}>
                    <Clock size={11} /> {visit.duration}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 mb-0.5">GPS</p>
                  <p className="text-[12px] font-600 text-blue-500 flex items-center gap-1" style={{ fontWeight: 600 }}>
                    <Navigation size={11} /> Verified
                  </p>
                </div>
              </div>
              {visit.photo && (
                <div className="mt-3 flex items-center gap-2">
                  <Camera size={14} className="text-gray-400" />
                  <span className="text-[11px] text-gray-400">Photo attached</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Timeline + Calendar */}
        <div className="space-y-5">
          {/* Timeline */}
          <Card className="p-5 border-gray-100 card-shadow animate-fade-in-up opacity-0" style={{ borderRadius: '18px', animationDelay: '200ms', animationFillMode: 'forwards' }}>
            <h3 className="text-[14px] font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Visit Timeline</h3>
            <div className="space-y-1">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: `${250 + i * 50}ms`, animationFillMode: 'forwards' }}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.bg}`}>
                      <item.icon size={14} className={item.color} />
                    </div>
                    {i < timeline.length - 1 && <div className="w-px h-6 bg-gray-100" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-[11px] text-gray-400">{item.time}</p>
                    <p className="text-[12px] font-600 text-gray-800 mt-0.5" style={{ fontWeight: 600 }}>{item.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Calendar */}
          <Card className="p-5 border-gray-100 card-shadow animate-fade-in-up opacity-0" style={{ borderRadius: '18px', animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-700 text-gray-900" style={{ fontWeight: 700 }}>Visit Calendar</h3>
              <Calendar size={16} className="text-blue-500" />
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-gray-400 font-600 py-1" style={{ fontWeight: 600 }}>{d}</div>
              ))}
              {calendarDays.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDay(d.day)}
                  className={`
                    relative aspect-square rounded-lg text-[11px] font-500 transition-all duration-200
                    ${selectedDay === d.day ? 'gradient-primary text-white shadow-md shadow-blue-200' : 'text-gray-600 hover:bg-blue-50'}
                  `}
                  style={{ fontWeight: 500 }}
                >
                  {d.day}
                  {d.visits > 0 && selectedDay !== d.day && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-400">Visits on Aug {selectedDay}</span>
                <span className="font-700 text-blue-600" style={{ fontWeight: 700 }}>{calendarDays[selectedDay - 1]?.visits || 0} visits</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
