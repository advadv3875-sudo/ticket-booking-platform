import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle, Ticket, Home, Star, Heart, Mail,
  Calendar, MapPin, Users, CreditCard, Download,
  MessageCircle, Phone, ArrowRight, Clock, QrCode,
  PartyPopper, Shield, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";

export default function PaymentSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");
  const sessionId = params.get("session_id");
  const orderIdNum = orderId ? parseInt(orderId) : null;

  const [animationStep, setAnimationStep] = useState(0);

  // جلب تفاصيل الطلب
  const { data: orderData, isLoading } = trpc.orders.getById.useQuery(
    { id: orderIdNum! },
    { enabled: !!orderIdNum, retry: 3, retryDelay: 1000 }
  );

  useEffect(() => {
    // تسلسل الأنيميشن
    const t1 = setTimeout(() => setAnimationStep(1), 100);
    const t2 = setTimeout(() => setAnimationStep(2), 600);
    const t3 = setTimeout(() => setAnimationStep(3), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const order = orderData?.order;
  const items = orderData?.items ?? [];
  const tickets = orderData?.tickets ?? [];
  const invoice = orderData?.invoice;

  // تنسيق العملة
  const formatCurrency = (amount: number | string, currency: string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `${num.toLocaleString("ar-JO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency?.toUpperCase() ?? "USD"}`;
  };

  // تنسيق التاريخ
  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-JO", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // اسم طريقة الدفع
  const getPaymentMethodName = (method: string) => {
    const map: Record<string, string> = {
      stripe: "بطاقة ائتمانية (Stripe)",
      paypal: "PayPal",
      sepa: "SEPA تحويل بنكي أوروبي",
      bank_transfer_uk: "تحويل بنكي - Clear Bank UK",
      bank_transfer_us: "تحويل بنكي - Lead Bank USA",
      hyperpay: "HyperPay",
      applepay: "Apple Pay",
      googlepay: "Google Pay",
      alipay: "Alipay",
      wechatpay: "WeChat Pay",
      telr: "Telr",
      amex: "American Express",
      payomentic: "Payomentic",
      "2checkout": "2Checkout",
    };
    return map[method] ?? method;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ===== بطاقة النجاح الرئيسية ===== */}
        <Card
          className={`bg-gray-900/95 border-yellow-700/30 shadow-2xl overflow-hidden transition-all duration-700 ${
            animationStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* شريط ذهبي علوي */}
          <div className="h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600" />

          <CardContent className="p-8">
            {/* أيقونة النجاح المتحركة */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                {/* دوائر متحركة خلفية */}
                <div className={`absolute inset-0 rounded-full bg-yellow-500/10 transition-all duration-1000 ${
                  animationStep >= 1 ? "scale-150 opacity-0" : "scale-100 opacity-100"
                }`} />
                <div className={`absolute inset-0 rounded-full bg-green-500/10 transition-all duration-700 delay-300 ${
                  animationStep >= 2 ? "scale-125 opacity-0" : "scale-100 opacity-100"
                }`} />

                {/* الأيقونة الرئيسية */}
                <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  animationStep >= 1
                    ? "border-green-500/60 bg-green-500/10 scale-100"
                    : "border-gray-700 bg-gray-800 scale-75"
                }`}>
                  <CheckCircle className={`transition-all duration-500 ${
                    animationStep >= 1 ? "w-16 h-16 text-green-400" : "w-10 h-10 text-gray-600"
                  }`} />
                </div>

                {/* نجمة ذهبية */}
                <div className={`absolute -top-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 delay-300 ${
                  animationStep >= 2 ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}>
                  <Star className="w-4 h-4 text-gray-900 fill-gray-900" />
                </div>

                {/* أيقونة احتفال */}
                <div className={`absolute -top-2 -left-2 transition-all duration-500 delay-500 ${
                  animationStep >= 3 ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}>
                  <PartyPopper className="w-7 h-7 text-yellow-400" />
                </div>
              </div>

              {/* العنوان الرئيسي */}
              <div className={`text-center transition-all duration-500 delay-200 ${
                animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}>
                <h1 className="text-3xl font-bold text-white mb-1">
                  🎉 تم الدفع بنجاح!
                </h1>
                <p className="text-green-400 font-semibold text-base">
                  تم تأكيد حجزك وإصدار تذاكرك
                </p>
              </div>
            </div>

            {/* إشعار البريد الإلكتروني */}
            <div className={`flex items-center gap-3 bg-blue-900/20 border border-blue-700/30 rounded-2xl p-4 mb-6 transition-all duration-500 delay-300 ${
              animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-blue-300 font-semibold text-sm">تم إرسال تذاكرك!</p>
                <p className="text-blue-400/70 text-xs mt-0.5">
                  تحقق من بريدك الإلكتروني — ستجد تذاكرك مع رمز QR لكل تذكرة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== ملخص الطلب ===== */}
        {isLoading ? (
          <Card className="bg-gray-900/95 border-yellow-700/30">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ) : order ? (
          <Card className={`bg-gray-900/95 border-yellow-700/30 shadow-xl overflow-hidden transition-all duration-700 delay-200 ${
            animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
            <CardContent className="p-6">

              {/* رأس الملخص */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h2 className="text-white font-bold text-lg">ملخص الطلب</h2>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-mono text-xs">
                  #{order.orderNumber}
                </Badge>
              </div>

              {/* تفاصيل الفعالية */}
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">الفعالية</p>
                    <p className="text-white font-semibold text-sm leading-snug">
                      {(order as any).eventTitle ?? `طلب #${order.orderNumber}`}
                    </p>
                  </div>
                </div>

                {order.paidAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">تاريخ الدفع</p>
                      <p className="text-white text-sm">{formatDate(order.paidAt)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">طريقة الدفع</p>
                    <p className="text-white text-sm">{getPaymentMethodName(order.paymentMethod ?? "")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">اسم العميل</p>
                    <p className="text-white text-sm">{order.customerFullName}</p>
                  </div>
                </div>
              </div>

              {/* التذاكر المحجوزة */}
              {items.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    التذاكر المحجوزة
                  </h3>
                  <div className="space-y-2">
                    {items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <span className="text-yellow-400 text-xs font-bold">{item.quantity}</span>
                          </div>
                          <span className="text-white text-sm">{item.ticketTypeName ?? `نوع التذكرة #${item.ticketTypeId}`}</span>
                        </div>
                        <span className="text-yellow-400 font-semibold text-sm">
                          {formatCurrency(parseFloat(item.unitPrice) * item.quantity, order.currency ?? "USD")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أرقام التذاكر */}
              {tickets.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                    أرقام التذاكر
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tickets.map((ticket: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-gray-800/40 rounded-lg px-3 py-2">
                        <QrCode className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-300 font-mono text-xs truncate">{ticket.ticketNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-gray-700/50 my-4" />

              {/* الإجمالي */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-medium">المبلغ الإجمالي المدفوع</span>
                <div className="text-left">
                  <span className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(order.totalAmount, order.currency ?? "USD")}
                  </span>
{(order as any).discountAmount && parseFloat((order as any).discountAmount) > 0 && (
                <p className="text-green-400 text-xs text-left mt-0.5">
                  وفّرت {formatCurrency((order as any).discountAmount, order.currency ?? "USD")}
                </p>
              )}
                </div>
              </div>

              {/* حالة الدفع */}
              <div className="mt-4 flex items-center gap-2 bg-green-900/20 border border-green-700/30 rounded-xl p-3">
                <Shield className="w-4 h-4 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-300 text-xs font-semibold">الدفع مؤكد ومحمي</p>
                  {sessionId && (
                    <p className="text-green-500/60 text-xs mt-0.5 font-mono">
                      {sessionId.substring(0, 30)}...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : orderId ? (
          /* عرض بسيط إذا لم تتوفر تفاصيل */
          <Card className="bg-gray-900/95 border-yellow-700/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Ticket className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-xs">رقم الطلب</p>
                  <p className="text-white font-bold font-mono text-lg">#{orderId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* ===== الخطوات التالية ===== */}
        <Card className={`bg-gray-900/95 border-yellow-700/30 shadow-xl transition-all duration-700 delay-300 ${
          animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <CardContent className="p-6">
            <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-yellow-400" />
              الخطوات التالية
            </h2>
            <div className="space-y-3">
              {[
                {
                  step: "1",
                  icon: <Mail className="w-4 h-4 text-blue-400" />,
                  bg: "bg-blue-500/10 border-blue-700/20",
                  title: "تحقق من بريدك الإلكتروني",
                  desc: "ستصلك رسالة تأكيد تحتوي على تذاكرك ورمز QR لكل تذكرة"
                },
                {
                  step: "2",
                  icon: <QrCode className="w-4 h-4 text-yellow-400" />,
                  bg: "bg-yellow-500/10 border-yellow-700/20",
                  title: "احتفظ بتذكرتك",
                  desc: "احفظ رمز QR على هاتفك أو اطبعه — ستحتاجه عند الدخول للفعالية"
                },
                {
                  step: "3",
                  icon: <Calendar className="w-4 h-4 text-green-400" />,
                  bg: "bg-green-500/10 border-green-700/20",
                  title: "احضر في الموعد المحدد",
                  desc: "تأكد من الحضور قبل 15 دقيقة من بدء الفعالية لتسجيل الدخول بسلاسة"
                },
                {
                  step: "4",
                  icon: <MessageCircle className="w-4 h-4 text-purple-400" />,
                  bg: "bg-purple-500/10 border-purple-700/20",
                  title: "تواصل معنا إذا احتجت مساعدة",
                  desc: "فريقنا متاح على مدار الساعة عبر واتساب أو البريد الإلكتروني"
                }
              ].map(({ step, icon, bg, title, desc }) => (
                <div key={step} className={`flex items-start gap-3 rounded-xl p-3 border ${bg}`}>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-300 text-xs font-bold">{step}</span>
                    </div>
                    {icon}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ===== رسالة مصطفى الجزائري ===== */}
        <Card className={`bg-gradient-to-br from-yellow-950/40 to-gray-900/95 border-yellow-700/30 shadow-xl transition-all duration-700 delay-400 ${
          animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400/30" />
              <span className="text-yellow-300 font-semibold text-sm">رسالة شخصية</span>
            </div>
            <p className="text-gray-200 leading-relaxed text-sm">
              شكراً جزيلاً لثقتك بنا وباختيارك{" "}
              <span className="text-yellow-400 font-semibold">Expert Plan</span>.
              يسعدنا أن نكون جزءاً من تجربتك المميزة، وسنبذل كل جهدنا لضمان أن تكون هذه الفعالية
              من أجمل اللحظات التي تعيشها.
            </p>
            <p className="text-gray-500 text-xs mt-3 font-medium">
              — مصطفى الجزائري، المؤسس والمدير التنفيذي
            </p>
          </CardContent>
        </Card>

        {/* ===== أزرار الإجراءات ===== */}
        <div className={`space-y-3 transition-all duration-700 delay-500 ${
          animationStep >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {/* زر تتبع الطلب */}
          <Link href={orderId ? `/track?order=${orderId}` : "/track"}>
            <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 font-bold gap-2 h-12 text-base shadow-lg shadow-yellow-900/30">
              <Ticket className="w-5 h-5" />
              تتبع طلبي ومشاهدة التذاكر
              <ArrowRight className="w-4 h-4 mr-auto" />
            </Button>
          </Link>

          {/* زر واتساب */}
          <a
            href="https://wa.me/447537867459?text=مرحباً، أريد الاستفسار عن حجزي"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="w-full border-green-700/50 text-green-400 hover:bg-green-900/20 hover:border-green-600 gap-2 h-11"
            >
              <MessageCircle className="w-4 h-4" />
              تواصل معنا عبر واتساب
            </Button>
          </a>

          {/* زر الرئيسية */}
          <Link href="/">
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 gap-2 h-11"
            >
              <Home className="w-4 h-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>

        {/* ===== معلومات التواصل ===== */}
        <div className="text-center space-y-1 pb-4">
          <p className="text-gray-500 text-xs">
            هل تحتاج مساعدة؟ نحن هنا من الأحد إلى الخميس 9ص – 6م
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:maljazaeeri@gmail.com" className="text-yellow-500 hover:text-yellow-400 text-xs flex items-center gap-1 transition-colors">
              <Mail className="w-3 h-3" />
              maljazaeeri@gmail.com
            </a>
            <a href="tel:+962790460211" className="text-yellow-500 hover:text-yellow-400 text-xs flex items-center gap-1 transition-colors">
              <Phone className="w-3 h-3" />
              +962 79 046 0211
            </a>
            <a href="tel:+962790759982" className="text-yellow-500 hover:text-yellow-400 text-xs flex items-center gap-1 transition-colors">
              <Phone className="w-3 h-3" />
              +962 79 075 9982
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
