import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Package, CheckCircle, Clock, AlertCircle, Ticket } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  paid: { label: "مدفوع ✓", color: "text-emerald-600 bg-emerald-50" },
  pending_payment: { label: "في انتظار الدفع", color: "text-amber-600 bg-amber-50" },
  pending_settlement: { label: "في انتظار التسوية", color: "text-blue-600 bg-blue-50" },
  failed: { label: "فشل", color: "text-red-600 bg-red-50" },
  cancelled: { label: "ملغي", color: "text-gray-600 bg-gray-50" },
  expired: { label: "منتهي الصلاحية", color: "text-gray-600 bg-gray-50" },
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" });
}

export default function TrackOrderPage() {
  const [, navigate] = useLocation();
  const [searchType, setSearchType] = useState<"number" | "email">("number");
  const [searchValue, setSearchValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const byNumber = trpc.orders.getByNumber.useQuery(
    { orderNumber: searchValue },
    { enabled: submitted && searchType === "number" && !!searchValue }
  );
  const byEmail = trpc.orders.trackByEmail.useQuery(
    { email: searchValue },
    { enabled: submitted && searchType === "email" && !!searchValue }
  );

  const handleSearch = () => {
    if (!searchValue.trim()) return;
    setSubmitted(true);
  };

  const orders = searchType === "email"
    ? byEmail.data
    : byNumber.data ? [byNumber.data.order] : undefined;

  const isLoading = byNumber.isLoading || byEmail.isLoading;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      <Navbar />
      <div className="container pt-28 pb-16 max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            تتبع طلبك
          </h1>
          <p className="text-gray-400">أدخل رقم الطلب أو بريدك الإلكتروني للاستعلام عن حالة طلبك</p>
        </div>

        {/* Search */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
          <div className="flex gap-2 mb-4">
            {[{ id: "number", label: "رقم الطلب" }, { id: "email", label: "البريد الإلكتروني" }].map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setSearchType(opt.id as any); setSubmitted(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${searchType === opt.id ? "bg-amber-500 text-white" : "bg-white/5 text-gray-400 hover:bg-amber-500/20"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); setSubmitted(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={searchType === "number" ? "EP-1234567890-ABCD" : "example@email.com"}
              dir={searchType === "email" ? "ltr" : "rtl"}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-amber-500 hover:bg-amber-600 text-white px-6">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {submitted && !isLoading && (!orders || orders.length === 0) && (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">لم يتم العثور على طلبات</p>
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order: any) => {
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
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{order.customerFullName}</span>
                    <span className="font-bold text-amber-600">{parseFloat(String(order.totalAmount)).toFixed(2)} {order.currency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
