import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Calendar, ShoppingBag, Users, TrendingUp, DollarSign, Ticket, ArrowUpRight, Star } from "lucide-react";
import AdminLayout from "./AdminLayout";

function StatCard({ title, value, sub, icon: Icon, color }: { title: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <ArrowUpRight className="w-4 h-4 text-gray-300" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{title}</div>
      {sub && <div className="text-xs text-emerald-600 mt-1 font-medium">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  return (
    <AdminLayout>
      <div className="p-6" dir="rtl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            لوحة التحكم
          </h1>
          <p className="text-gray-400 text-sm mt-1">مرحباً بك في منصة خطة الخبراء</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 bg-white/10 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="إجمالي الفعاليات" value={stats?.totalEvents ?? 0} icon={Calendar} color="bg-amber-50 text-amber-600" />
            <StatCard title="إجمالي الطلبات" value={stats?.totalOrders ?? 0} icon={ShoppingBag} color="bg-blue-50 text-blue-600" />
            <StatCard title="الطلبات المدفوعة" value={stats?.paidOrders ?? 0} icon={Ticket} color="bg-emerald-50 text-emerald-600" />
            <StatCard title="إجمالي الإيرادات" value={`${parseFloat(String(stats?.totalRevenue ?? 0)).toFixed(0)} JOD`} icon={DollarSign} color="bg-purple-50 text-purple-600" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/admin/events/create")}
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-6 text-right hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-amber-200 group"
          >
            <Star className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-lg mb-1" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إنشاء فعالية</div>
            <div className="text-amber-100 text-sm">أضف فعالية جديدة للمنصة</div>
          </button>
          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-right hover:shadow-md transition-all border border-white/10 hover:border-amber-500/30 group"
          >
            <ShoppingBag className="w-8 h-8 mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-lg text-gray-900 mb-1" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إدارة الطلبات</div>
            <div className="text-gray-400 text-sm">عرض وإدارة جميع الطلبات</div>
          </button>
          <button
            onClick={() => navigate("/admin/events")}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-right hover:shadow-md transition-all border border-white/10 hover:border-amber-500/30 group"
          >
            <Calendar className="w-8 h-8 mb-3 text-emerald-500 group-hover:scale-110 transition-transform" />
            <div className="font-bold text-lg text-gray-900 mb-1" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الفعاليات</div>
            <div className="text-gray-400 text-sm">إدارة الفعاليات والتذاكر</div>
          </button>
        </div>

        {/* Recent stats */}
        {stats && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="font-bold text-gray-900 text-lg mb-4" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              إحصائيات سريعة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-amber-600">{stats.totalUsers ?? 0}</div>
                <div className="text-gray-400 text-xs mt-1">المستخدمون</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{stats.pendingOrders ?? 0}</div>
                <div className="text-gray-400 text-xs mt-1">طلبات معلقة</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">{stats.totalTicketsSold ?? 0}</div>
                <div className="text-gray-400 text-xs mt-1">تذاكر مباعة</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stats.publishedEvents ?? 0}</div>
                <div className="text-gray-400 text-xs mt-1">فعاليات منشورة</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
