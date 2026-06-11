import { useState, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, DollarSign, ShoppingCart, Award,
  CheckCircle, Calendar, ArrowUp, ArrowDown, Minus
} from "lucide-react";

// ===== Helpers =====
const GATEWAY_LABELS: Record<string, string> = {
  card: "بطاقة ائتمانية",
  stripe: "Stripe",
  paypal: "PayPal",
  sepa: "SEPA",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  alipay: "Alipay",
  wechatpay: "WeChat Pay",
  telr: "Telr",
  hyperpaywallet: "HyperPay",
  amex: "Amex",
  "2checkout": "2Checkout",
  payomentic: "Payomentic",
  bank_transfer: "تحويل بنكي",
  unionpay: "UnionPay",
};

const GATEWAY_COLORS = [
  "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6",
  "#ef4444", "#06b6d4", "#f97316", "#ec4899",
  "#84cc16", "#14b8a6", "#a855f7", "#6366f1",
];

const PERIOD_OPTIONS = [
  { label: "7 أيام", days: 7 },
  { label: "30 يوم", days: 30 },
  { label: "90 يوم", days: 90 },
];

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val.toFixed(0)}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ar-JO", { month: "short", day: "numeric" });
}

// ===== KPI Card =====
function KPICard({
  title, value, subtitle, icon: Icon, color, trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-gray-400";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-6 hover:border-amber-500/30 transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        style={{ background: `radial-gradient(circle at top right, ${color}15, transparent 60%)` }} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center`}
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          {value}
        </div>
        <div className="text-sm text-gray-400">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

// ===== Custom Tooltip =====
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-white/20 rounded-xl p-3 shadow-xl text-right" dir="rtl">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white font-medium">{typeof p.value === "number" && p.name === "revenue" ? formatCurrency(p.value) : p.value}</span>
          <span className="text-gray-400">{p.name === "revenue" ? "إيرادات" : "طلبات"}</span>
        </div>
      ))}
    </div>
  );
}

// ===== Main Page =====
export default function AdminAnalytics() {
  const [period, setPeriod] = useState(30);

  const { data: kpis, isLoading: kpisLoading } = trpc.admin.analyticsKPIs.useQuery();
  const { data: dailyRevenue, isLoading: dailyLoading } = trpc.admin.dailyRevenue.useQuery({ days: period });
  const { data: gatewayData, isLoading: gatewayLoading } = trpc.admin.paymentsByGateway.useQuery();
  const { data: topEvents, isLoading: topLoading } = trpc.admin.topEvents.useQuery({ limit: 8 });

  // Fill missing days with 0
  const filledDailyData = useMemo(() => {
    if (!dailyRevenue) return [];
    const map: Record<string, { day: string; revenue: number; orderCount: number }> = {};
    dailyRevenue.forEach(d => { map[d.day] = d; });
    const result = [];
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      result.push(map[key] ?? { day: key, revenue: 0, orderCount: 0 });
    }
    return result;
  }, [dailyRevenue, period]);

  const pieData = useMemo(() => {
    if (!gatewayData) return [];
    return gatewayData.map(g => ({
      name: GATEWAY_LABELS[g.gateway] ?? g.gateway,
      value: g.orderCount,
      revenue: g.revenue,
    }));
  }, [gatewayData]);

  const isLoading = kpisLoading || dailyLoading || gatewayLoading || topLoading;

  return (
    <AdminLayout>
      <div className="p-6 space-y-8" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              تحليلات المدفوعات
            </h1>
            <p className="text-gray-400 text-sm mt-1">نظرة شاملة على أداء المبيعات والإيرادات</p>
          </div>
          {/* Period Filter */}
          <div className="flex items-center gap-2 bg-gray-900/60 border border-white/10 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => setPeriod(opt.days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === opt.days
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        {kpisLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-900/60 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="إجمالي الإيرادات"
              value={formatCurrency(kpis?.totalRevenue ?? 0)}
              subtitle="بالدولار الأمريكي تقريباً"
              icon={DollarSign}
              color="#f59e0b"
              trend="up"
            />
            <KPICard
              title="إجمالي الطلبات"
              value={(kpis?.totalOrders ?? 0).toLocaleString("ar")}
              subtitle="طلب مدفوع"
              icon={ShoppingCart}
              color="#3b82f6"
              trend="up"
            />
            <KPICard
              title="متوسط قيمة الطلب"
              value={formatCurrency(kpis?.avgOrderValue ?? 0)}
              subtitle="لكل طلب"
              icon={Award}
              color="#10b981"
            />
            <KPICard
              title="معدل النجاح"
              value={`${kpis?.successRate ?? 0}%`}
              subtitle="من إجمالي الطلبات"
              icon={CheckCircle}
              color="#8b5cf6"
            />
            <KPICard
              title="إيرادات اليوم"
              value={formatCurrency(kpis?.todayRevenue ?? 0)}
              subtitle={`${kpis?.todayOrders ?? 0} طلب اليوم`}
              icon={TrendingUp}
              color="#06b6d4"
            />
            <KPICard
              title="إيرادات الأسبوع"
              value={formatCurrency(kpis?.weekRevenue ?? 0)}
              subtitle={`${kpis?.weekOrders ?? 0} طلب هذا الأسبوع`}
              icon={Calendar}
              color="#f97316"
            />
            <div className="col-span-2 relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
              <div className="relative">
                <div className="text-amber-400 text-xs font-medium mb-2 uppercase tracking-wider">مقارنة الفترة</div>
                <div className="flex items-end gap-6">
                  <div>
                    <div className="text-3xl font-bold text-white">{formatCurrency(kpis?.weekRevenue ?? 0)}</div>
                    <div className="text-gray-400 text-sm mt-1">آخر 7 أيام</div>
                  </div>
                  <div className="text-gray-600 text-2xl mb-1">→</div>
                  <div>
                    <div className="text-3xl font-bold text-amber-400">{formatCurrency(kpis?.totalRevenue ?? 0)}</div>
                    <div className="text-gray-400 text-sm mt-1">إجمالي الكل</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Area Chart - Daily Revenue */}
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  الإيرادات اليومية
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">آخر {period} يوم (بالدولار)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-400 text-xs">الإيرادات</span>
              </div>
            </div>
            {dailyLoading ? (
              <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={filledDailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatDate}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.floor(filledDailyData.length / 6)}
                  />
                  <YAxis
                    tickFormatter={formatCurrency}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart - Gateway Distribution */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                توزيع بوابات الدفع
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">حسب عدد الطلبات</p>
            </div>
            {gatewayLoading ? (
              <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
            ) : pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">لا توجد مدفوعات بعد</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={GATEWAY_COLORS[i % GATEWAY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, props: any) => [
                        `${val} طلب (${formatCurrency(props.payload.revenue)})`,
                        props.payload.name,
                      ]}
                      contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", direction: "rtl" }}
                      labelStyle={{ color: "#9ca3af" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {pieData.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: GATEWAY_COLORS[i % GATEWAY_COLORS.length] }} />
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-gray-400">{item.value} طلب</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bar Chart + Top Events */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Bar Chart - Orders per Day */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  عدد الطلبات اليومية
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">آخر {period} يوم</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-400 text-xs">الطلبات</span>
              </div>
            </div>
            {dailyLoading ? (
              <div className="h-56 bg-gray-800/50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={filledDailyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={formatDate}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.floor(filledDailyData.length / 6)}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="orderCount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Events Table */}
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                أفضل الفعاليات مبيعاً
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">حسب الإيرادات الإجمالية</p>
            </div>
            {topLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !topEvents?.length ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">لا توجد مبيعات بعد</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {topEvents.map((ev, i) => {
                  const maxRevenue = topEvents[0]?.revenue ?? 1;
                  const pct = Math.round((ev.revenue / maxRevenue) * 100);
                  return (
                    <div key={ev.id} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            i === 0 ? "bg-amber-500 text-white" :
                            i === 1 ? "bg-gray-400 text-gray-900" :
                            i === 2 ? "bg-amber-700 text-white" :
                            "bg-gray-800 text-gray-400"
                          }`}>
                            {i + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white text-sm font-medium truncate">{ev.title}</div>
                            <div className="text-gray-500 text-xs">{ev.orderCount} طلب</div>
                          </div>
                        </div>
                        <div className="text-amber-400 font-bold text-sm flex-shrink-0 mr-2">
                          {formatCurrency(ev.revenue)}
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "#374151",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Gateway Revenue Table */}
        {!gatewayLoading && gatewayData && gatewayData.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                تفاصيل بوابات الدفع
              </h2>
              <p className="text-gray-500 text-xs mt-0.5">إجمالي الإيرادات لكل بوابة</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-white/5">
                    <th className="text-right pb-3 font-medium">بوابة الدفع</th>
                    <th className="text-center pb-3 font-medium">عدد الطلبات</th>
                    <th className="text-left pb-3 font-medium">الإيرادات (USD)</th>
                    <th className="text-left pb-3 font-medium">النسبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {gatewayData.map((g, i) => {
                    const totalRev = gatewayData.reduce((s, x) => s + x.revenue, 0);
                    const pct = totalRev > 0 ? Math.round((g.revenue / totalRev) * 100) : 0;
                    return (
                      <tr key={g.gateway} className="hover:bg-white/3 transition-colors">
                        <td className="py-3 pr-0">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: GATEWAY_COLORS[i % GATEWAY_COLORS.length] }} />
                            <span className="text-white font-medium">{GATEWAY_LABELS[g.gateway] ?? g.gateway}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center text-gray-300">{g.orderCount.toLocaleString("ar")}</td>
                        <td className="py-3 text-left text-amber-400 font-medium">{formatCurrency(g.revenue)}</td>
                        <td className="py-3 text-left">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden min-w-16">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: GATEWAY_COLORS[i % GATEWAY_COLORS.length] }} />
                            </div>
                            <span className="text-gray-400 text-xs w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
