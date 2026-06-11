import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

export default function TermsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      <Navbar />

      <div className="container pt-28 pb-16 max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-amber-400 transition-colors">الرئيسية</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-amber-400 font-medium">الشروط والأحكام</span>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            الشروط والأحكام
          </h1>
          <p className="text-gray-400 text-sm mb-8">آخر تحديث: مارس 2026 | Expert Plan by MUSTAFA ALJAZAEERI</p>

          <div className="space-y-8 text-gray-300 leading-relaxed">

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                1. قبول الشروط
              </h2>
              <p>
                باستخدامك لمنصة Expert Plan لحجز التذاكر، فإنك توافق على الالتزام بهذه الشروط والأحكام بالكامل.
                إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام المنصة.
              </p>
            </section>

            {/* Section 2 - NO REFUND - Most Important */}
            <section className="bg-red-950/30 border border-red-500/40 rounded-xl p-6">
              <h2 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                ⚠️ 2. سياسة عدم الاسترداد (لا رجعة في الدفع)
              </h2>
              <div className="space-y-3 text-red-200">
                <p className="font-semibold text-red-300 text-base">
                  جميع المبالغ المدفوعة عبر منصة Expert Plan غير قابلة للاسترداد في أي حال من الأحوال.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>بمجرد إتمام عملية الدفع وتأكيد الطلب، لا يمكن استرداد المبلغ المدفوع.</li>
                  <li>لا يُقبل الإلغاء من قِبل العميل بعد إتمام الدفع.</li>
                  <li>في حال إلغاء الفعالية من قِبل المنظم، تُبلَّغ العملاء ويُنظر في كل حالة على حدة.</li>
                  <li>لا تتحمل المنصة أي مسؤولية عن قرارات العميل في الإلغاء أو التغيير.</li>
                  <li>تذاكر الفعاليات المحجوزة غير قابلة للتحويل لشخص آخر إلا بموافقة المنظم.</li>
                </ul>
                <p className="text-xs text-red-300/70 mt-2">
                  هذه السياسة سارية على جميع طرق الدفع: Stripe، PayPal، التحويل البنكي، SEPA، وغيرها.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                3. طرق الدفع والأمان
              </h2>
              <p className="mb-3">
                تدعم المنصة طرق دفع متعددة وآمنة بالكامل:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li><strong className="text-white">Stripe</strong> — بطاقات Visa، Mastercard، Amex. الدفع فوري ومباشر.</li>
                <li><strong className="text-white">PayPal</strong> — الدفع عبر حساب PayPal الشخصي.</li>
                <li><strong className="text-white">SEPA Transfer</strong> — تحويل بنكي أوروبي عبر Clear Bank (المملكة المتحدة). مدة التسوية 48 ساعة.</li>
                <li><strong className="text-white">تحويل بنكي (USD)</strong> — تحويل مباشر لحساب Lead Bank الأمريكي. مدة التسوية 1-3 أيام عمل.</li>
              </ul>
              <p className="mt-3 text-sm">
                جميع المعاملات المالية مشفرة بتقنية SSL 256-bit. لا نقوم بتخزين بيانات البطاقات الائتمانية.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                4. التذاكر والحجوزات
              </h2>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>يتم إصدار التذاكر إلكترونياً فور تأكيد الدفع.</li>
                <li>يجب تقديم التذكرة الرقمية (QR Code) عند الدخول للفعالية.</li>
                <li>المنصة غير مسؤولة عن فقدان التذاكر الرقمية بعد إرسالها للعميل.</li>
                <li>يحق للمنظم رفض الدخول في حال وجود شك في صحة التذكرة.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                5. مسؤولية المنظم
              </h2>
              <p>
                Expert Plan هي منصة وسيطة بين المنظمين والعملاء. المنظم هو المسؤول الكامل عن محتوى الفعالية وتنفيذها.
                في حال إلغاء الفعالية أو تأجيلها، يتحمل المنظم المسؤولية الكاملة تجاه العملاء.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                6. الخصوصية وحماية البيانات
              </h2>
              <p>
                نلتزم بحماية بياناتك الشخصية وفق أعلى المعايير. لا نبيع أو نشارك بياناتك مع أطراف ثالثة.
                البيانات المجمعة تُستخدم فقط لإتمام عمليات الحجز والدفع وإرسال التذاكر.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                7. التعديلات على الشروط
              </h2>
              <p>
                تحتفظ Expert Plan بحق تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية.
                استمرارك في استخدام المنصة بعد التعديلات يعني موافقتك على الشروط الجديدة.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-amber-400 mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                8. التواصل والدعم
              </h2>
              <p>
                للاستفسارات والشكاوى، يمكنك التواصل معنا عبر البريد الإلكتروني أو من خلال صفحة{" "}
                <a href="/about" className="text-amber-400 hover:underline">من نحن</a>.
                نلتزم بالرد خلال 48 ساعة عمل.
              </p>
            </section>

            {/* Footer note */}
            <div className="pt-6 border-t border-white/10 text-center">
              <p className="text-gray-500 text-xs">
                © 2026 Expert Plan by MUSTAFA ALJAZAEERI. جميع الحقوق محفوظة.
                <br />
                المنصة مسجلة وتعمل وفق القوانين المعمول بها.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
