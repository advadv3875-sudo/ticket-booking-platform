import { useState, useMemo, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ticket, Minus, Plus, Shield, ChevronRight, AlertCircle, Tag, X } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "stripe", label: "Stripe", icon: "💳", desc: "Visa, Mastercard, Amex", instant: true, badge: "موصى به" },
  { id: "paypal", label: "PayPal", icon: "🅿️", instant: true },
  { id: "applepay", label: "Apple Pay", icon: "", instant: true },
  { id: "googlepay", label: "Google Pay", icon: "G", instant: true },
  { id: "sepa", label: "SEPA Transfer", icon: "🏦", desc: "تحويل بنكي أوروبي - 48 ساعة", instant: false },
  { id: "bank_transfer", label: "تحويل بنكي (USD)", icon: "🏛️", desc: "Lead Bank - USA", instant: false },
  { id: "alipay", label: "Alipay", icon: "🔵", instant: true },
  { id: "wechatpay", label: "WeChat Pay", icon: "💚", instant: true },
  { id: "hyperpaywallet", label: "HyperPay", icon: "⚡", instant: true },
  { id: "telr", label: "Telr", icon: "🔷", instant: true },
  { id: "2checkout", label: "2Checkout", icon: "2️⃣", instant: true },
  { id: "amex", label: "American Express", icon: "💙", instant: true },
];

const CURRENCIES = ["JOD", "EUR", "USD", "AED", "SAR", "GBP"] as const;

export default function BookingPage() {
  const params = useParams<{ eventId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const eventId = parseInt(params.eventId);
  const lastOrderRef = useRef<{ orderId: number; orderNumber: string } | null>(null);

  const { data: event } = trpc.events.getById.useQuery({ id: eventId });
  const { data: ticketTypes } = trpc.events.getTicketTypes.useQuery({ eventId }, { enabled: !!eventId });

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [selectedPayment, setSelectedPayment] = useState("stripe");
  const [currency, setCurrency] = useState<typeof CURRENCIES[number]>("JOD");
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? "");
  const [customerName, setCustomerName] = useState(user?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ couponId: number; code: string; discountAmount: number; description: string } | null>(null);

  const validateCoupon = trpc.coupons.validate.useMutation({
    onSuccess: (data) => {
      setAppliedCoupon({ couponId: data.couponId, code: data.code, discountAmount: data.discountAmount, description: data.description });
      toast.success(`تم تطبيق كود الخصم! وفّرت ${data.discountAmount.toFixed(2)} ${currency}`);
    },
    onError: (err) => toast.error(err.message || "كود الخصم غير صحيح"),
  });

  // Stripe checkout mutation
  const createStripeCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data?.checkoutUrl) {
        toast.success("جاري التوجيه إلى Stripe...");
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في إنشاء جلسة Stripe"),
  });

  const confirmPayment = trpc.orders.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("تم الدفع بنجاح!");
      if (lastOrderRef.current) {
        navigate(`/order/${lastOrderRef.current.orderNumber}`);
      }
    },
    onError: () => toast.error("حدث خطأ في تأكيد الدفع"),
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      lastOrderRef.current = { orderId: data.orderId, orderNumber: data.orderNumber };
      if (data.paymentMethod === "sepa" || data.paymentMethod === "bank_transfer") {
        navigate(`/order/${data.orderNumber}`);
      } else if (data.paymentMethod === "paypal") {
        navigate(`/order/${data.orderNumber}`);
      } else if (selectedPayment === "stripe") {
        // Stripe: create checkout session and redirect
        createStripeCheckout.mutate({
          orderId: data.orderId,
          origin: window.location.origin,
        });
      } else {
        // For instant digital payments - confirm immediately
        confirmPayment.mutate({ orderId: data.orderId });
      }
    },
    onError: (err) => toast.error(err.message || "حدث خطأ في إنشاء الطلب"),
  });

  const totalItems = useMemo(() =>
    Object.values(quantities).reduce((a, b) => a + b, 0), [quantities]);

  const subtotal = useMemo(() => {
    if (!ticketTypes) return 0;
    return ticketTypes.reduce((sum, tt) => {
      const qty = quantities[tt.id] ?? 0;
      return sum + parseFloat(String(tt.price)) * qty;
    }, 0);
  }, [ticketTypes, quantities]);

  const finalTotal = useMemo(() => {
    if (!appliedCoupon) return subtotal;
    return Math.max(0, subtotal - appliedCoupon.discountAmount);
  }, [subtotal, appliedCoupon]);

  const handleQuantityChange = (ttId: number, delta: number, max: number) => {
    setQuantities((prev) => {
      const current = prev[ttId] ?? 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [ttId]: next };
    });
  };

  const handleSubmit = () => {
    if (!customerEmail || !customerName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (totalItems === 0) {
      toast.error("يرجى اختيار تذكرة واحدة على الأقل");
      return;
    }
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, quantity]) => ({ ticketTypeId: parseInt(id), quantity }));

    // For Stripe: first create order then redirect to Stripe Checkout
    if (selectedPayment === "stripe") {
      // Create order first, then in onSuccess we'll redirect to Stripe
      createOrder.mutate({
        eventId,
        customerEmail,
        customerFullName: customerName,
        customerPhone: customerPhone || undefined,
        currency,
        paymentMethod: "card",
        items,
      });
      return;
    }

    createOrder.mutate({
      eventId, customerEmail, customerFullName: customerName, customerPhone: customerPhone || undefined,
      currency, paymentMethod: selectedPayment as any, items,
    });
  };

  const isPending = createOrder.isPending || confirmPayment.isPending;

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      <Navbar />

      <div className="container pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate("/events")} className="hover:text-amber-600 transition-colors">الفعاليات</button>
          <ChevronRight className="w-4 h-4" />
          <button onClick={() => navigate(`/events/${event.slug}`)} className="hover:text-amber-600 transition-colors truncate max-w-48">
            {event.titleAr || event.title}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-amber-500 font-medium">الحجز</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Booking Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1: Ticket Selection */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                اختر التذاكر
              </h2>
              {ticketTypes && ticketTypes.length > 0 ? (
                <div className="space-y-4">
                  {ticketTypes.map((tt) => {
                    const available = tt.totalQuantity - tt.soldQuantity - tt.heldQuantity;
                    const qty = quantities[tt.id] ?? 0;
                    const isSoldOut = available <= 0;
                    return (
                      <div key={tt.id} className={`p-4 rounded-xl border-2 transition-all ${qty > 0 ? "border-amber-400 bg-amber-500/10" : "border-white/10 bg-white/5"} ${isSoldOut ? "opacity-50" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                              {tt.nameAr || tt.name}
                            </h3>
                            {tt.description && <p className="text-gray-400 text-sm mt-0.5">{tt.description}</p>}
                            <div className="flex items-center gap-3 mt-2">
                              <span className="font-bold text-amber-400 text-lg">{parseFloat(String(tt.price)).toFixed(0)} {tt.currency}</span>
                              {!isSoldOut && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{available} متاح</span>}
                              {isSoldOut && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">نفدت</span>}
                            </div>
                          </div>
                          {!isSoldOut && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleQuantityChange(tt.id, -1, Math.min(available, tt.maxPerOrder ?? 10))}
                                disabled={qty === 0}
                                className="w-9 h-9 rounded-full border-2 border-white/20 text-white flex items-center justify-center hover:border-amber-400 disabled:opacity-30 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-bold text-lg text-white">{qty}</span>
                              <button
                                onClick={() => handleQuantityChange(tt.id, 1, Math.min(available, tt.maxPerOrder ?? 10))}
                                disabled={qty >= Math.min(available, tt.maxPerOrder ?? 10)}
                                className="w-9 h-9 rounded-full border-2 border-white/20 text-white flex items-center justify-center hover:border-amber-400 disabled:opacity-30 transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Ticket className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد تذاكر متاحة</p>
                </div>
              )}
            </div>

            {/* Step 2: Customer Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                معلومات العميل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 font-medium mb-2 block">الاسم الكامل *</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="أدخل اسمك الكامل" className="text-right bg-white/5 border-white/20 text-white placeholder:text-gray-500" />
                </div>
                <div>
                  <Label className="text-gray-300 font-medium mb-2 block">البريد الإلكتروني *</Label>
                  <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="example@email.com" type="email" dir="ltr" className="bg-white/5 border-white/20 text-white placeholder:text-gray-500" />
                </div>
                <div>
                  <Label className="text-gray-300 font-medium mb-2 block">رقم الهاتف</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+962 7X XXX XXXX" dir="ltr" className="bg-white/5 border-white/20 text-white placeholder:text-gray-500" />
                </div>
                <div>
                  <Label className="text-gray-300 font-medium mb-2 block">العملة</Label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full border border-white/20 rounded-lg px-3 py-2 text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                طريقة الدفع
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedPayment(pm.id)}
                    className={`relative p-4 rounded-xl border-2 text-right transition-all ${
                      selectedPayment === pm.id
                        ? "border-amber-400 bg-amber-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    {pm.badge && (
                      <span className="absolute top-2 left-2 text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                        {pm.badge}
                      </span>
                    )}
                    <div className="text-2xl mb-2">{pm.icon}</div>
                    <div className="font-medium text-white text-sm">{pm.label}</div>
                    {pm.desc && <div className="text-xs text-gray-400 mt-0.5">{pm.desc}</div>}
                    {!pm.instant && (
                      <div className="text-xs text-amber-400 mt-1 font-medium">⏱ تسوية مؤجلة</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Stripe info */}
              {selectedPayment === "stripe" && (
                <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-indigo-300 text-sm mb-1">دفع آمن عبر Stripe</p>
                      <p className="text-indigo-200/70 text-xs leading-relaxed">
                        ستُوجَّه إلى صفحة Stripe الآمنة لإتمام الدفع. لا حاجة لأي رمز تحقق إضافي.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal info */}
              {selectedPayment === "paypal" && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-300 text-sm mb-1">دفع عبر PayPal</p>
                      <p className="text-blue-200/70 text-xs leading-relaxed">
                        ستُوجَّه إلى PayPal لإتمام الدفع بأمان. لا حاجة لأي رمز تحقق إضافي.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SEPA/Bank info */}
              {(selectedPayment === "sepa" || selectedPayment === "bank_transfer") && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-300 text-sm mb-1">
                        {selectedPayment === "sepa" ? "تحويل SEPA البنكي" : "تحويل بنكي (USD)"}
                      </p>
                      <p className="text-amber-200/70 text-xs leading-relaxed">
                        {selectedPayment === "sepa"
                          ? "ستظهر تفاصيل الحساب البنكي الأوروبي (Clear Bank - UK) بعد تأكيد الطلب. مدة التسوية 48 ساعة عمل."
                          : "ستظهر تفاصيل حساب Lead Bank الأمريكي بعد تأكيد الطلب. التحويل مباشرة لحساب MUSTAFA ALJAZAEERI."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-28">
              <h2 className="font-bold text-white text-xl mb-5" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                ملخص الطلب
              </h2>

              {/* Event */}
              <div className="flex gap-3 mb-5 pb-5 border-b border-white/10">
                <img
                  src={event.coverImage || "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/events-fallback-VYXKeUYy5PQikieuXABwAb.png"}
                  alt={event.title}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    {event.titleAr || event.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">{event.venueAr || event.venue}</p>
                </div>
              </div>

              {/* Items */}
              {ticketTypes && Object.entries(quantities).filter(([, q]) => q > 0).map(([id, qty]) => {
                const tt = ticketTypes.find((t) => t.id === parseInt(id));
                if (!tt) return null;
                return (
                  <div key={id} className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-gray-400">{tt.nameAr || tt.name} × {qty}</span>
                    <span className="font-medium text-white">{(parseFloat(String(tt.price)) * qty).toFixed(0)} {currency}</span>
                  </div>
                );
              })}

              {totalItems === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">لم تختر أي تذاكر بعد</p>
              )}

              {/* Coupon Code */}
              <div className="border-t border-white/10 pt-4 mt-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="كود الخصم"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-400"
                        onKeyDown={(e) => e.key === 'Enter' && couponCode && validateCoupon.mutate({ code: couponCode, orderAmount: subtotal })}
                      />
                    </div>
                    <button
                      onClick={() => couponCode && validateCoupon.mutate({ code: couponCode, orderAmount: subtotal })}
                      disabled={!couponCode || validateCoupon.isPending}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition-colors"
                    >
                      {validateCoupon.isPending ? '...' : 'تطبيق'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-emerald-400 text-sm font-bold">{appliedCoupon.code}</p>
                        <p className="text-gray-400 text-xs">{appliedCoupon.description || 'خصم مطبّق'}</p>
                      </div>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-gray-400 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">المجموع الفرعي</span>
                  <span className="font-medium text-white">{subtotal.toFixed(2)} {currency}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">الخصم</span>
                    <span className="font-medium text-emerald-400">- {appliedCoupon.discountAmount.toFixed(2)} {currency}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 text-sm">الرسوم</span>
                  <span className="font-medium text-emerald-400">مجاناً</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">الإجمالي</span>
                  <span className="text-amber-400">{finalTotal.toFixed(2)} {currency}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={totalItems === 0 || !customerEmail || !customerName || isPending}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 rounded-xl text-base font-bold shadow-lg disabled:opacity-50"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري المعالجة...
                  </div>
                ) : (
                  <>
                    <Shield className="w-5 h-5 ml-2" />
                    {selectedPayment === "stripe" ? "الدفع عبر Stripe" :
                     selectedPayment === "paypal" ? "الدفع عبر PayPal" :
                     (selectedPayment === "sepa" || selectedPayment === "bank_transfer") ? "تأكيد الطلب والتحويل" :
                     "تأكيد الطلب والدفع"}
                  </>
                )}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                دفع آمن ومشفر بـ SSL 256-bit · بدون رمز تحقق
              </div>
              {/* No-Refund Policy Notice */}
              <div className="mt-4 p-4 bg-red-950/40 border border-red-500/30 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-xs leading-relaxed">
                    <strong>⚠️ سياسة عدم الاسترداد:</strong> جميع المبالغ المدفوعة غير قابلة للاسترداد بعد إتمام عملية الدفع بغض النظر عن السبب.
                    بالمتابعة في عملية الدفع، أنت توافق على{" "}
                    <a href="/terms" className="underline text-red-200 hover:text-red-100">الشروط والأحكام</a>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
