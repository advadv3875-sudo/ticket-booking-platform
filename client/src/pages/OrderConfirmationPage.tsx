import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Clock, Ticket, Calendar, MapPin, Copy, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "long", day: "numeric" });
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  paid: { label: "مدفوع", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle className="w-5 h-5 text-emerald-600" /> },
  pending_payment: { label: "في انتظار الدفع", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Clock className="w-5 h-5 text-amber-600" /> },
  pending_settlement: { label: "في انتظار التسوية", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Clock className="w-5 h-5 text-blue-600" /> },
  failed: { label: "فشل", color: "text-red-600 bg-red-50 border-red-200", icon: <AlertCircle className="w-5 h-5 text-red-600" /> },
  cancelled: { label: "ملغي", color: "text-gray-600 bg-gray-50 border-gray-200", icon: <AlertCircle className="w-5 h-5 text-gray-600" /> },
};

export default function OrderConfirmationPage() {
  const params = useParams<{ orderNumber: string }>();
  const [, navigate] = useLocation();
  const { data, isLoading } = trpc.orders.getByNumber.useQuery({ orderNumber: params.orderNumber });

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(params.orderNumber);
    toast.success("تم نسخ رقم الطلب");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">الطلب غير موجود</h2>
          <Button onClick={() => navigate("/events")} className="bg-amber-500 text-white mt-4">العودة للفعاليات</Button>
        </div>
      </div>
    );
  }

  const { order, items, tickets } = data;
  const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.pending_payment;
  const isSepa = order.paymentMethod === "sepa";
  const isBankTransfer = order.paymentMethod === "bank_transfer";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      <Navbar />
      <div className="container pt-28 pb-16 max-w-3xl">

        {/* Status Header */}
        <div className={`rounded-2xl p-8 mb-8 border-2 text-center ${statusInfo.color}`}>
          <div className="flex justify-center mb-4">{statusInfo.icon}</div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            {order.status === "paid" ? "تم تأكيد طلبك بنجاح!" :
             order.status === "pending_settlement" ? "تم استلام طلبك - في انتظار التسوية" :
             "طلبك في انتظار الدفع"}
          </h1>
          <p className="text-sm opacity-80">
            {order.status === "paid" ? "تذاكرك جاهزة. تحقق من بريدك الإلكتروني." :
             isSepa || isBankTransfer ? "يرجى إتمام التحويل البنكي خلال 48 ساعة." :
             "أكمل عملية الدفع لتأكيد حجزك."}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-xl" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>تفاصيل الطلب</h2>
            <button onClick={copyOrderNumber} className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
              <Copy className="w-4 h-4" />
              {order.orderNumber}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">العميل</span>
              <p className="font-medium text-gray-800 mt-0.5">{order.customerFullName}</p>
            </div>
            <div>
              <span className="text-gray-400">البريد الإلكتروني</span>
              <p className="font-medium text-gray-800 mt-0.5">{order.customerEmail}</p>
            </div>
            <div>
              <span className="text-gray-400">طريقة الدفع</span>
              <p className="font-medium text-gray-800 mt-0.5 capitalize">{order.paymentMethod}</p>
            </div>
            <div>
              <span className="text-gray-400">الإجمالي</span>
              <p className="font-bold text-amber-600 text-lg mt-0.5">{parseFloat(String(order.totalAmount)).toFixed(2)} {order.currency}</p>
            </div>
            <div>
              <span className="text-gray-400">تاريخ الطلب</span>
              <p className="font-medium text-gray-800 mt-0.5">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-gray-400">الحالة</span>
              <p className={`font-medium mt-0.5 ${statusInfo.color.split(" ")[0]}`}>{statusInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Bank Transfer Info */}
        {(isSepa || isBankTransfer) && order.status !== "paid" && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-amber-900 text-lg mb-4 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              🏦 تفاصيل التحويل البنكي
            </h3>
            {isSepa ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">اسم المستفيد</span>
                    <p className="font-bold text-gray-900 mt-0.5">MUSTAFA SALAH MOOHMAD ALJAZAEERI</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">البنك</span>
                    <p className="font-bold text-gray-900 mt-0.5">Clear Bank - UK</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">IBAN</span>
                    <p className="font-bold text-gray-900 mt-0.5 text-xs" dir="ltr">GB69CLRB04281229838921</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">BIC/SWIFT</span>
                    <p className="font-bold text-gray-900 mt-0.5" dir="ltr">CLRBGB22XXX</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-200 col-span-2">
                    <span className="text-gray-400 text-xs">المرجع (مطلوب)</span>
                    <p className="font-bold text-amber-700 mt-0.5">{order.orderNumber}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">اسم الحساب</span>
                    <p className="font-bold text-gray-900 mt-0.5">MUSTAFA SALAH MOOHMAD ALJAZAEERI</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">البنك</span>
                    <p className="font-bold text-gray-900 mt-0.5">Lead Bank - USA</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">رقم الحساب</span>
                    <p className="font-bold text-gray-900 mt-0.5" dir="ltr">215602758261</p>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <span className="text-gray-400 text-xs">Routing Number</span>
                    <p className="font-bold text-gray-900 mt-0.5" dir="ltr">101019644</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-200 col-span-2">
                    <span className="text-gray-400 text-xs">المرجع (مطلوب)</span>
                    <p className="font-bold text-amber-700 mt-0.5">{order.orderNumber}</p>
                  </div>
                </div>
              </div>
            )}
            <p className="text-amber-700 text-xs mt-4 font-medium">
              ⚠️ يرجى ذكر رقم الطلب كمرجع للتحويل. مدة التسوية: 48 ساعة عمل.
            </p>
          </div>
        )}

        {/* Tickets */}
        {tickets && tickets.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
            <h2 className="font-bold text-gray-900 text-xl mb-5" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              تذاكرك ({tickets.length})
            </h2>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-amber-400 text-xs font-medium mb-1">Expert Plan</div>
                      <div className="text-white font-bold text-lg" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                        {ticket.holderName}
                      </div>
                      <div className="text-gray-300 text-sm mt-1">{ticket.holderEmail}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-400 text-xs mb-1">رقم التذكرة</div>
                      <div className="text-white font-mono font-bold text-sm" dir="ltr">{ticket.ticketNumber}</div>
                    </div>
                  </div>
                  {ticket.qrCodeData && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-gray-400 text-xs text-center">QR: {ticket.qrCodeData}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => navigate("/events")} className="bg-amber-500 hover:bg-amber-600 text-white flex-1">
            <Ticket className="w-4 h-4 ml-2" />
            استعرض المزيد من الفعاليات
          </Button>
          <Button onClick={() => navigate("/my-orders")} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 flex-1">
            طلباتي
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
