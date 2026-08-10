'use client';

import { StatCard, MotionCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CalendarDays,
  UserCheck,
  Users,
  ShoppingCart,
  FileText,
  Wallet,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  MapPin,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useI18n } from '@/lib/i18n';

const salesRevenueData = [
  { month: 'Jan', revenue: 420000, target: 450000 },
  { month: 'Feb', revenue: 480000, target: 460000 },
  { month: 'Mar', revenue: 520000, target: 500000 },
  { month: 'Apr', revenue: 490000, target: 520000 },
  { month: 'May', revenue: 580000, target: 540000 },
  { month: 'Jun', revenue: 640000, target: 600000 },
  { month: 'Jul', revenue: 680000, target: 650000 },
  { month: 'Aug', revenue: 720000, target: 700000 },
  { month: 'Sep', revenue: 780000, target: 750000 },
  { month: 'Oct', revenue: 820000, target: 800000 },
  { month: 'Nov', revenue: 880000, target: 850000 },
  { month: 'Dec', revenue: 940000, target: 900000 },
];

const ordersData = [
  { month: 'Jan', orders: 120, returns: 8 },
  { month: 'Feb', orders: 145, returns: 10 },
  { month: 'Mar', orders: 160, returns: 6 },
  { month: 'Apr', orders: 180, returns: 12 },
  { month: 'May', orders: 210, returns: 9 },
  { month: 'Jun', orders: 240, returns: 14 },
  { month: 'Jul', orders: 265, returns: 11 },
  { month: 'Aug', orders: 290, returns: 8 },
];

const quotationConversion = [
  { name: 'Converted', value: 145, color: '#2563EB' },
  { name: 'Pending', value: 52, color: '#38BDF8' },
  { name: 'Rejected', value: 28, color: '#EF4444' },
  { name: 'Draft', value: 35, color: '#E5E7EB' },
];

const customerGrowthData = [
  { month: 'Jan', customers: 800, new: 40 },
  { month: 'Feb', customers: 880, new: 80 },
  { month: 'Mar', customers: 950, new: 70 },
  { month: 'Apr', customers: 1020, new: 70 },
  { month: 'May', customers: 1080, new: 60 },
  { month: 'Jun', customers: 1150, new: 70 },
  { month: 'Jul', customers: 1200, new: 50 },
  { month: 'Aug', customers: 1240, new: 40 },
];

const provinceData = [
  { province: 'Phnom Penh', sales: 420, percentage: 35 },
  { province: 'Siem Reap', sales: 280, percentage: 23 },
  { province: 'Battambang', sales: 195, percentage: 16 },
  { province: 'Preah Sihanouk', sales: 165, percentage: 14 },
  { province: 'Kandal', sales: 130, percentage: 12 },
];

const recentOrders = [
  { id: 'ORD-2845', customer: 'Angkor Trading Co.', rep: 'Sokha Chan', date: 'Aug 6, 2026', status: 'Confirmed', total: 24500, payment: 'Paid' },
  { id: 'ORD-2844', customer: 'Mekong Steel', rep: 'Sopheak Heng', date: 'Aug 6, 2026', status: 'Processing', total: 38200, payment: 'Pending' },
  { id: 'ORD-2843', customer: 'Kirirom Logistics', rep: 'Vannak Keo', date: 'Aug 5, 2026', status: 'Completed', total: 52100, payment: 'Paid' },
  { id: 'ORD-2842', customer: 'Tonle Sap Commerce', rep: 'Bora Meng', date: 'Aug 5, 2026', status: 'Pending', total: 18900, payment: 'Unpaid' },
  { id: 'ORD-2841', customer: 'Bayon Enterprise', rep: 'Dara Rath', date: 'Aug 4, 2026', status: 'Cancelled', total: 9800, payment: 'Refunded' },
];

const statusColors: Record<string, string> = {
  Confirmed: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  Processing: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  Completed: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  Pending: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  Cancelled: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
};

const paymentColors: Record<string, string> = {
  Paid: 'text-green-600 dark:text-green-400',
  Pending: 'text-amber-600 dark:text-amber-400',
  Unpaid: 'text-red-600 dark:text-red-400',
  Refunded: 'text-muted-foreground',
};

export default function DashboardPage() {
  const { t, formatCurrency, formatNumber } = useI18n();

  const stats = [
    { title: t('stat.todaySales'), value: 48250, prefix: '$', trend: 12.5, icon: DollarSign, iconColor: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-50 dark:bg-blue-500/10', sparkData: [30, 45, 38, 52, 48, 60, 72], sparkColor: '#2563EB' },
    { title: t('stat.monthlyRevenue'), value: 1284500, prefix: '$', trend: 8.2, icon: CalendarDays, iconColor: 'text-sky-500 dark:text-sky-400', iconBg: 'bg-sky-50 dark:bg-sky-500/10', sparkData: [60, 72, 68, 80, 75, 88, 95], sparkColor: '#38BDF8' },
    { title: t('stat.activeSalesReps'), value: 24, trend: 4.1, icon: UserCheck, iconColor: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-50 dark:bg-green-500/10', sparkData: [18, 20, 19, 22, 21, 23, 24], sparkColor: '#22C55E' },
    { title: t('stat.customersVisited'), value: 156, trend: 6.8, icon: Users, iconColor: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-500/10', sparkData: [100, 120, 110, 130, 125, 140, 156], sparkColor: '#F59E0B' },
    { title: t('stat.pendingOrders'), value: 38, trend: -2.3, icon: ShoppingCart, iconColor: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-50 dark:bg-orange-500/10', sparkData: [45, 42, 48, 40, 44, 41, 38], sparkColor: '#EF4444' },
    { title: t('stat.pendingQuotations'), value: 52, trend: 3.5, icon: FileText, iconColor: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-50 dark:bg-indigo-500/10', sparkData: [40, 45, 42, 48, 50, 49, 52], sparkColor: '#6366F1' },
    { title: t('stat.collectionToday'), value: 32500, prefix: '$', trend: 15.2, icon: Wallet, iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', sparkData: [20, 25, 22, 28, 30, 32, 32.5], sparkColor: '#10B981' },
    { title: t('stat.totalCustomers'), value: 1240, trend: 5.0, icon: Building2, iconColor: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-50 dark:bg-purple-500/10', sparkData: [1000, 1050, 1100, 1150, 1180, 1210, 1240], sparkColor: '#8B5CF6' },
  ];

  const performanceSummary = [
    { label: t('chart.conversionRate'), value: '68.5%', trend: 'up' },
    { label: 'Avg. Order Value', value: '$24,580', trend: 'up' },
    { label: 'Customer Retention', value: '84.2%', trend: 'up' },
    { label: 'Visit Success Rate', value: '72.0%', trend: 'down' },
    { label: 'Quotation Acceptance', value: '55.8%', trend: 'up' },
    { label: 'Collection Rate', value: '91.3%', trend: 'up' },
  ];

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-surface rounded-xl p-3 card-shadow">
        <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold text-main">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-main">{t('chart.salesRevenue')}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">{t('chart.salesRevenueDesc')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[11px] text-muted-foreground font-medium">{t('chart.revenue')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-200" />
                <span className="text-[11px] text-muted-foreground font-medium">{t('chart.target')}</span>
              </div>
              <button className="w-8 h-8 rounded-lg hover:bg-accent/50 flex items-center justify-center text-muted-foreground">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salesRevenueData} barGap={4}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={customTooltip} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
              <Bar dataKey="target" fill="rgba(186,230,253,0.4)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="revenue" fill="url(#revGrad)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-main">{t('chart.quotationConversion')}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">{t('chart.statusDistribution')}</p>
            </div>
          </div>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={quotationConversion} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} cornerRadius={6}>
                  {quotationConversion.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[24px] font-bold text-main">260</p>
              <p className="text-[10px] text-muted-foreground">{t('chart.total')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {quotationConversion.map((q) => (
              <div key={q.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: q.color }} />
                <span className="text-[11px] text-muted-foreground">{q.name}</span>
                <span className="text-[11px] font-semibold text-main ml-auto">{q.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-main">{t('chart.monthlyOrders')}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">{t('chart.ordersReturnsTrend')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[11px] text-muted-foreground font-medium">{t('chart.orders')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-[11px] text-muted-foreground font-medium">{t('chart.returns')}</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={customTooltip} cursor={{ stroke: 'rgba(148,163,184,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 3 }} activeDot={{ r: 5, fill: '#2563EB' }} />
              <Line type="monotone" dataKey="returns" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 3 }} activeDot={{ r: 5, fill: '#EF4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-main">{t('chart.salesByProvince')}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">{t('chart.topRegions')}</p>
            </div>
            <MapPin size={18} className="text-primary" />
          </div>
          <div className="space-y-4">
            {provinceData.map((p, i) => (
              <motion.div
                key={p.province}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">{p.province}</span>
                  <span className="text-[12px] font-semibold text-main">${p.sales}k</span>
                </div>
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #2563EB, #38BDF8)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.percentage}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-main">{t('chart.customerGrowth')}</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">{t('chart.customerGrowthDesc')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[11px] text-muted-foreground font-medium">{t('chart.customers')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-300" />
                <span className="text-[11px] text-muted-foreground font-medium">{t('chart.new')}</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={customerGrowthData}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#38BDF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip content={customTooltip} cursor={{ stroke: 'rgba(148,163,184,0.3)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="customers" stroke="#2563EB" strokeWidth={2.5} fill="url(#totalGrad)" />
              <Area type="monotone" dataKey="new" stroke="#38BDF8" strokeWidth={2.5} fill="url(#newGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
          <h3 className="text-[16px] font-bold text-main mb-5">Performance Summary</h3>
          <div className="space-y-3">
            {performanceSummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-surface last:border-0">
                <span className="text-[12px] text-muted-foreground font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-main">{item.value}</span>
                  {item.trend === 'up' ? (
                    <ArrowUpRight size={14} className="text-green-500" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="p-6 border-surface card-shadow" style={{ borderRadius: '18px' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[16px] font-bold text-main">Recent Orders</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Latest 5 orders across all reps</p>
          </div>
          <button className="text-[12px] text-primary font-semibold hover:opacity-80 transition-opacity">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface">
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2">{t('table.orderNumber')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2">{t('table.customer')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2 hidden md:table-cell">{t('table.salesRep')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2 hidden lg:table-cell">{t('table.date')}</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2">{t('table.status')}</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2">{t('table.total')}</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-2 hidden md:table-cell">{t('table.payment')}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.05, duration: 0.3 }}
                  className="border-b border-surface last:border-0 hover:bg-accent/20 transition-colors duration-150"
                >
                  <td className="py-3.5 px-2">
                    <span className="text-[12px] font-semibold text-primary">{order.id}</span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="text-[12px] font-medium text-main">{order.customer}</span>
                  </td>
                  <td className="py-3.5 px-2 hidden md:table-cell">
                    <span className="text-[12px] text-muted-foreground">{order.rep}</span>
                  </td>
                  <td className="py-3.5 px-2 hidden lg:table-cell">
                    <span className="text-[12px] text-muted-foreground">{order.date}</span>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusColors[order.status]}`}>
                      {t(`status.${order.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <span className="text-[12px] font-bold text-main">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="py-3.5 px-2 text-right hidden md:table-cell">
                    <span className={`text-[12px] font-medium ${paymentColors[order.payment]}`}>
                      {t(`status.${order.payment.toLowerCase()}`)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}