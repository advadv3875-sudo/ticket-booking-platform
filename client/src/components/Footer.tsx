import { Link } from "wouter";
import { MapPin, Phone, Mail, Globe, Instagram, Facebook, Twitter, Send, MessageCircle, Linkedin, Flower } from "lucide-react";

export default function Footer() {
  return (
    <footer dir="rtl" style={{ backgroundColor: "#060f1e", color: "#f0e8d8" }}>
      {/* Fire orange top border */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #FF6B00, #FFB347, #FF6B00, transparent)" }} />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/logo-expert-plan-Kun6mTWULhFdcwiu9EC9fo.webp"
                alt="Expert Plan Logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <div className="font-black text-xl" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
                  Expert Plan
                </div>
                <div className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>by MUSTAFA ALJAZAEERI</div>
              </div>
            </div>
            <p className="leading-relaxed mb-6 max-w-sm" style={{ color: "rgba(240,232,216,0.6)", fontFamily: "'Cairo', sans-serif", fontSize: "0.9rem" }}>
              أول منظمة أردنية إقليمية رائدة في مجال تنظيم الفعاليات والمؤتمرات والمعارض وحفلات الزفاف وتجارة الزهور الفاخرة، نقدم خدمات متكاملة بأعلى معايير الجودة والاحتراف.
            </p>

            {/* Contact Info */}
            <div className="flex flex-col gap-3 text-sm mb-6">
              {[
                { icon: <Phone className="w-4 h-4" />, text: "+962 79 046 0211 (أردن)", href: "tel:+962790460211" },
                { icon: <Phone className="w-4 h-4" />, text: "+962 79 075 9982 (أردن)", href: "tel:+962790759982" },
                { icon: <MessageCircle className="w-4 h-4" />, text: "واتساب +447537867459 (بريطانيا)", href: "https://wa.me/447537867459" },
                { icon: <MessageCircle className="w-4 h-4" />, text: "واتساب +966598416557 (سعودية)", href: "https://wa.me/966598416557" },
                { icon: <Mail className="w-4 h-4" />, text: "maljazaeeri@gmail.com", href: "mailto:maljazaeeri@gmail.com" },
                { icon: <Mail className="w-4 h-4" />, text: "mustafaaljazaeeri@gmail.com", href: "mailto:mustafaaljazaeeri@gmail.com" },
              ].map((item) => (
                <a key={item.text} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors"
                  style={{ color: "rgba(240,232,216,0.6)" }}>
                  <span style={{ color: "#FF6B00" }}>{item.icon}</span>
                  <span>{item.text}</span>
                </a>
              ))}
              <div className="flex items-center gap-2" style={{ color: "rgba(240,232,216,0.6)" }}>
                <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#FF6B00" }} />
                <span>عمان، المملكة الأردنية الهاشمية</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "rgba(240,232,216,0.6)" }}>
                <Globe className="w-4 h-4 flex-shrink-0" style={{ color: "#FF6B00" }} />
                <a href="https://aljazaeeri.site.expertplan.vip" style={{ color: "rgba(240,232,216,0.6)" }}>
                  aljazaeeri.site.expertplan.vip
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3 flex-wrap">
              {[
                { icon: <Instagram className="w-4 h-4" />, href: "https://www.instagram.com/expert_plan387?igsh=N3l1czQ4ZjZkeWN1&utm_source=qr", label: "Instagram" },
                { icon: <Facebook className="w-4 h-4" />, href: "https://www.facebook.com/share/1DFR63nZJL/?mibextid=wwXIfr", label: "Facebook" },
                { icon: <Send className="w-4 h-4" />, href: "https://www.threads.com/@mustafa_ja387?igshid=NTc4MTIwNjQ2YQ==", label: "Threads" },
                { icon: <Twitter className="w-4 h-4" />, href: "https://www.tiktok.com/@mustafa_sj7?_r=1&_t=ZS-94S2jxKvdKy", label: "TikTok" },
                { icon: <Linkedin className="w-4 h-4" />, href: "https://www.linkedin.com/in/expert-plan-a337863b5", label: "LinkedIn" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)", color: "rgba(240,232,216,0.7)" }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Services ── */}
          <div>
            <h3 className="font-bold mb-5 text-sm uppercase tracking-wider" style={{ color: "#FF9A3C" }}>
              خدماتنا
            </h3>
            <ul className="space-y-3 text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {[
                { label: "تنظيم المؤتمرات والمعارض", href: "/events" },
                { label: "تنسيق حفلات الزفاف", href: "/events" },
                { label: "الأحداث والفعاليات", href: "/events" },
                { label: "متجر الزهور الفاخر", href: "/flowers" },
                { label: "خدمات الاستيراد والتصدير", href: "/events" },
              ].map((s) => (
                <li key={s.label}>
                  <Link href={s.href}>
                    <span className="flex items-center gap-2 transition-colors cursor-pointer"
                      style={{ color: "rgba(240,232,216,0.6)" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FF6B00" }} />
                      {s.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Working Hours */}
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(240,232,216,0.4)" }}>ساعات العمل</h4>
              <div className="space-y-2 text-sm">
                {[
                  { day: "الأحد – الخميس", hours: "9ص – 6م", closed: false },
                  { day: "الجمعة", hours: "10ص – 2م", closed: false },
                  { day: "السبت", hours: "مغلق", closed: true },
                ].map((item) => (
                  <div key={item.day} className="flex justify-between">
                    <span style={{ color: "rgba(240,232,216,0.55)" }}>{item.day}</span>
                    <span style={{ color: item.closed ? "#ef4444" : "#FF9A3C" }}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="font-bold mb-5 text-sm uppercase tracking-wider" style={{ color: "#FF9A3C" }}>
              روابط سريعة
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/events", label: "الفعاليات القادمة" },
                { href: "/flowers", label: "متجر الزهور", icon: <Flower className="w-3 h-3" /> },
                { href: "/track", label: "تتبع الطلب" },
                { href: "/my-orders", label: "طلباتي" },
                { href: "/terms", label: "الشروط والأحكام" },
                { href: "/about", label: "من نحن" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <span className="flex items-center gap-2 transition-colors cursor-pointer"
                      style={{ color: "rgba(240,232,216,0.6)" }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#FF6B00" }} />
                      {item.icon}
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Payment Methods */}
            <div className="mt-8">
              <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: "rgba(240,232,216,0.4)" }}>طرق الدفع المقبولة</h4>
              <div className="flex flex-wrap gap-2">
                {["VISA", "MC", "AMEX", "PayPal", "SEPA", "Apple Pay", "Stripe"].map((p) => (
                  <span key={p} className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)", color: "rgba(240,232,216,0.7)" }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,107,0,0.15)" }}>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm" style={{ color: "rgba(240,232,216,0.4)", fontFamily: "'Cairo', sans-serif" }}>
              © {new Date().getFullYear()} Expert Plan by MUSTAFA ALJAZAEERI. جميع الحقوق محفوظة.
            </p>
            <span style={{ color: "rgba(255,107,0,0.3)" }}>|</span>
            <a href="/terms" className="text-sm transition-colors" style={{ color: "rgba(240,232,216,0.4)" }}>الشروط والأحكام</a>
            <span style={{ color: "rgba(255,107,0,0.3)" }}>|</span>
            <span className="text-xs" style={{ color: "rgba(239,68,68,0.6)" }}>لا استرداد بعد الدفع</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs" style={{ color: "rgba(240,232,216,0.4)" }}>جميع المدفوعات آمنة ومشفرة</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
