import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Ticket, Search } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  paid: { label: "مدفوع ✓", color: "text-emerald-600 bg-emerald-50" },
  pending_payment: { label: "في انتظار الدفع", color: "text-amber-600 bg-amber-50" },
  pending_settlement: { label: "في انتظار التسوية", color: "text-blue-600 bg-blue-50" },
  failed: { label: "فشل", color: "text-red-600 bg-red-50" },
  cancelled: { label: "ملغي", color: "text-gray-600 bg-gray-50" },
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" });
}

export default function MyOrdersPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <Navbar />
        <div className="container pt-32 pb-16 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-amber-400" />
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            تتبع طلبك
          </h2>
          <p className="text-gray-400 mb-6">أدخل رقم طلبك لعرض تفاصيل حجزك</p>
          <Button onClick={() => navigate("/track")} className="bg-amber-500 hover:bg-amber-600 text-white px-8">
            تتبع الطلب
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      <Navbar />
      <div className="container pt-28 pb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>طلباتي</h1>
            <p className="text-gray-400 text-sm">مرحباً {user?.name}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white/10 rounded-2xl animate-pulse" />)}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending_payment;
              return (
                <div
                  key={order.id}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer"
                  onClick={() => navigate(`/order/${order.orderNumber}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-gray-900 font-mono text-sm" dir="ltr">{order.orderNumber}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{formatDate(order.createdAt)}</div>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm capitalize">{order.paymentMethod}</span>
                    <span className="font-bold text-amber-600">{parseFloat(String(order.totalAmount)).toFixed(2)} {order.currency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-500 mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد طلبات بعد</h3>
            <p className="text-gray-400 mb-6">ابدأ بحجز تذاكر الفعاليات المفضلة لديك</p>
            <Button onClick={() => navigate("/events")} className="bg-amber-500 hover:bg-amber-600 text-white">
              استعرض الفعاليات
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
