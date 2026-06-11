import { useLocation } from "wouter";
import React from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import {
  Calendar, MapPin, ArrowLeft, Star, Shield, Award, Users,
  Ticket, ChevronRight, Sparkles, Globe, Zap, Phone, Mail,
  MessageCircle, Instagram, Twitter, Facebook, Send, Linkedin, Flower
} from "lucide-react";

/* ── Professional Images ── */
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/hero-bg-f8Lqa6LZSEypwscoTdNbJS.png";
const FLOWERS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flowers-hero-jTj6UiGAdoNF9ietmPRzna.png";
const EVENTS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/events-hero-AKmSSZWdG4nAGXvT8AQpYC.png";
const CONFERENCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/service-conference-JTjofvKh4FEgpmPE99oyjU.png";
const WEDDING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/service-wedding-TBXNzXKf4KjSm5FokaZMhn.png";
const FLOWER_SHOP_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/service-flowers-GP3EYab4NfA2FvcFHSvwhv.webp";
const LOGISTICS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/service-logistics-9k3dkGVz9N5eLR8r7kfF5M.png";
/* ── Service Card Images (Royal Luxury AI-Generated) ── */
const SVC_CONFERENCES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/svc-conferences-DhbDXU2rwK5tumJ4bbuuZD.png";
const SVC_WEDDING = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/svc-wedding-Pk3R8c2BhNWUwWvhG22wpH.png";
const SVC_FLOWERS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/svc-flowers-n3ypa2zVaMdF7ZWNjikxWa.png";
const SVC_RENTALS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/svc-rentals-U7qezfd2nF8zwWAAjwwKFf.png";
const SVC_IMPORT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/svc-import-mCAmuF3WDU7STUXeKrWCyr.png";
const EVENTS_FALLBACK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/events-fallback-VYXKeUYy5PQikieuXABwAb.png";
/* ── New Section Images ── */
const STATS_IMG = "/manus-storage/section-stats_c632e080.jpg";
const STAT_EXPERIENCE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/stat-experience-cvuXaJfWqKGH6FXJYTtiKi.png";
const STAT_PAYMENT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/stat-payment-oSTTgQs9g2nDJjF6Xr9kaa.png";
const STAT_TICKETS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/stat-tickets-cQPxZTz4mexiyr6PpAFVFi.png";
const STAT_EVENTS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/stat-events-o5MuYfPHjDyoxbWdMkFHv9.png";
const SERVICES_COLLAGE_IMG = "/manus-storage/section-services_fb525cbc.jpg";
const PAYMENT_IMG = "/manus-storage/section-payment_4e547712.jpg";
const RENTALS_FEATURED_IMG = "/manus-storage/section-rentals-featured_fe2151de.jpg";
const CTA_BG_IMG = "/manus-storage/section-cta-bg_779af865.jpg";
const COMPANY_ROYAL_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/company-hero-bg-NX7ygN6JkvBsGci8nGpeb3.png";

const CATEGORY_LABELS: Record<string, string> = {
  conference: "مؤتمر", exhibition: "معرض", wedding: "زفاف",
  concert: "حفل", corporate: "مؤسسي", cultural: "ثقافي",
  sports: "رياضي", other: "أخرى",
};

function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "long", day: "numeric" });
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [, navigate] = useLocation();
  const { data: featuredEvents, isLoading } = trpc.events.featured.useQuery();

  const stats = [
    { value: "500+", label: "فعالية ناجحة", img: STAT_EVENTS_IMG },
    { value: "50K+", label: "تذكرة محجوزة", img: STAT_TICKETS_IMG },
    { value: "11+", label: "طريقة دفع", img: STAT_PAYMENT_IMG },
    { value: "10+", label: "سنوات خبرة", img: STAT_EXPERIENCE_IMG },
  ];

  const paymentMethods = [
    "VISA / Mastercard", "PayPal", "Apple Pay", "Google Pay",
    "SEPA Transfer", "Alipay", "WeChat Pay", "American Express",
    "HyperPay", "Telr", "2Checkout",
  ];

  const contactInfo = [
    { icon: <Phone className="w-5 h-5" />, label: "الهاتف (أردن)", value: "+962 79 046 0211", href: "tel:+962790460211" },
    { icon: <Phone className="w-5 h-5" />, label: "الهاتف (أردن)", value: "+962 79 075 9982", href: "tel:+962790759982" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "واتسآب (بريطانيا)", value: "+44 7537 867459", href: "https://wa.me/447537867459" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "واتسآب (سعودية)", value: "+966 59 841 6557", href: "https://wa.me/966598416557" },
    { icon: <Mail className="w-5 h-5" />, label: "البريد الإلكتروني", value: "maljazaeeri@gmail.com", href: "mailto:maljazaeeri@gmail.com" },
    { icon: <Mail className="w-5 h-5" />, label: "بريد بديل", value: "mustafaaljazaeeri@gmail.com", href: "mailto:mustafaaljazaeeri@gmail.com" },
    { icon: <MapPin className="w-5 h-5" />, label: "العنوان", value: "عمان، المملكة الأردنية الهاشمية", href: "#" },
  ];

  const socialLinks = [
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", href: "https://www.instagram.com/expert_plan387?igsh=N3l1czQ4ZjZkeWN1&utm_source=qr" },
    { icon: <Facebook className="w-5 h-5" />, label: "Facebook", href: "https://www.facebook.com/share/1DFR63nZJL/?mibextid=wwXIfr" },
    { icon: <Send className="w-5 h-5" />, label: "Threads", href: "https://www.threads.com/@mustafa_ja387?igshid=NTc4MTIwNjQ2YQ==" },
    { icon: <Twitter className="w-5 h-5" />, label: "TikTok", href: "https://www.tiktok.com/@mustafa_sj7?_r=1&_t=ZS-94S2jxKvdKy" },
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", href: "https://www.linkedin.com/in/expert-plan-a337863b5" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Snapchat", href: "https://snapchat.com/t/kHefBkVa" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a1628", color: "#f0e8d8" }} dir="rtl">
      <AnnouncementBanner />
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Expert Plan Hero" className="w-full h-full object-cover" style={{ filter: "brightness(0.5)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.72) 55%, rgba(10,22,40,0.40) 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to top, #0a1628, transparent)" }} />
        </div>

        <div className="relative z-10 container pt-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)" }}>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>Expert Plan by MUSTAFA ALJAZAEERI</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
              <span style={{ color: "#f0e8d8" }}>احجز تذكرتك</span>
              <br />
              <span className="text-fire-gradient">لأفخم الفعاليات</span>
            </h1>

            <p className="text-xl mb-10 leading-relaxed max-w-2xl" style={{ color: "rgba(240,232,216,0.78)", fontFamily: "'Cairo', sans-serif" }}>
              Expert Plan by MUSTAFA ALJAZAEERI — رائدة في تنظيم المؤتمرات والمعارض وحفلات الزفاف وتجارة الزهور الفاخرة.
              احجز تذكرتك الآن بأكثر من 11 طريقة دفع آمنة.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate("/events")} size="lg"
                className="text-white font-bold px-8 py-6 text-lg rounded-xl"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)", border: "none", boxShadow: "0 4px 25px rgba(255,107,0,0.5)" }}>
                <Ticket className="w-5 h-5 ml-2" />
                استعرض الفعاليات
              </Button>
              <Button onClick={() => navigate("/flowers")} variant="outline" size="lg"
                className="font-bold px-8 py-6 text-lg rounded-xl"
                style={{ borderColor: "rgba(255,107,0,0.5)", color: "#FF9A3C", background: "rgba(255,107,0,0.08)" }}>
                <Flower className="w-5 h-5 ml-2" />
                متجر الزهور
              </Button>
              <Button onClick={() => navigate("/track")} variant="outline" size="lg"
                className="font-bold px-8 py-6 text-lg rounded-xl"
                style={{ borderColor: "rgba(240,232,216,0.3)", color: "#f0e8d8", background: "rgba(240,232,216,0.06)" }}>
                تتبع طلبك
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: "rgba(240,232,216,0.4)" }}>
          <span className="text-xs">مرر للأسفل</span>
          <div className="w-px h-8 animate-pulse" style={{ background: "linear-gradient(to bottom, rgba(255,107,0,0.6), transparent)" }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS
      ══════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,107,0,0.15)", borderBottom: "1px solid rgba(255,107,0,0.15)" }}>
        {/* Cinematic background image */}
        <div className="absolute inset-0">
          <img src={STATS_IMG} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.18) saturate(1.4)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(10,22,40,0.85) 50%, rgba(13,30,53,0.97) 100%)" }} />
        </div>
        <div className="container relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3"
              style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#FF6B00" }} />
              <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>أرقامنا تتحدث</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
              ثقتنا مبنية على <span className="text-fire-gradient">سنوات من الخبرة</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group p-6 rounded-2xl relative overflow-hidden"
                style={{ background: "rgba(10,22,40,0.7)", border: "1px solid rgba(212,175,55,0.25)", backdropFilter: "blur(12px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.15)" }}>
                {/* golden top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
                <div className="w-20 h-20 mx-auto mb-4 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_16px_rgba(212,175,55,0.6)]">
                  <img src={stat.img} alt={stat.label} className="w-full h-full object-contain" />
                </div>
                <div className="text-4xl font-black mb-1" style={{ background: "linear-gradient(135deg, #D4AF37, #FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
                <div className="text-sm font-semibold tracking-wide" style={{ color: "rgba(212,175,55,0.85)", fontFamily: "'Cairo', sans-serif" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SERVICES SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
        {/* Subtle services collage background */}
        <div className="absolute inset-0 opacity-8">
          <img src={SERVICES_COLLAGE_IMG} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.12) saturate(1.2)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0a1628 0%, rgba(10,22,40,0.7) 50%, #0a1628 100%)" }} />
        </div>
        <div className="container relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
              <Zap className="w-4 h-4" style={{ color: "#FF6B00" }} />
              <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>خدماتنا المتميزة</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
              كل ما تحتاجه في <span className="text-fire-gradient">مكان واحد</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(240,232,216,0.65)", fontFamily: "'Cairo', sans-serif" }}>
              من تنظيم الفعاليات الكبرى إلى أجمل باقات الزهور الفاخرة وخدمات الاستيراد العالمية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[
              { img: SVC_CONFERENCES, title: "المؤتمرات والمعارض", desc: "تنظيم احترافي للمؤتمرات الدولية والمعارض التجارية الكبرى", badge: "الأكثر طلباً", badgeColor: "#FF6B00", link: "/events" },
              { img: SVC_WEDDING, title: "حفلات الزفاف", desc: "أفراح لا تُنسى بلمسة ملكية فاخرة وتنظيم متكامل", badge: "مميز", badgeColor: "#D4A843", link: "/events" },
              { img: SVC_FLOWERS, title: "متجر الزهور الفاخر", desc: "ورد طبيعي وصناعي فاخر — باقات، تنسيقات، هدايا ملكية", badge: "جديد", badgeColor: "#FF6B00", link: "/flowers" },
              { img: SVC_RENTALS, title: "تأجير لوازم المناسبات", desc: "أثاث، إضاءة، خيام وديكور فاخر بأسعار تنافسية", badge: "جديد", badgeColor: "#22c55e", link: "/rentals" },
              { img: SVC_IMPORT, title: "الاستيراد والتصدير", desc: "خدمات لوجستية عالمية موثوقة للأسواق الدولية", badge: "عالمي", badgeColor: "#4A90D9", link: "/events" },
            ].map((service) => (
              <div key={service.title} className="group relative overflow-hidden rounded-2xl cursor-pointer"
                style={{ border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minHeight: "380px" }}
                onClick={() => navigate(service.link)}>

                {/* صورة الخدمة الملكية كاملة */}
                <div className="absolute inset-0">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* طبقة تدرج سفلية لضمان قراءة النص */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,12,25,0.97) 0%, rgba(5,12,25,0.75) 45%, rgba(5,12,25,0.15) 75%, transparent 100%)" }} />
                  {/* تأثير توهج ذهبي عند التحويم */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to top, rgba(212,175,55,0.25) 0%, transparent 60%)" }} />
                </div>

                {/* خط ذهبي علوي */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, #FF6B00, transparent)" }} />

                {/* Badge علوي */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg" style={{ background: service.badgeColor, fontSize: "10px" }}>
                    {service.badge}
                  </span>
                </div>

                {/* المحتوى السفلي */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  {/* خط فاصل ذهبي */}
                  <div className="w-10 h-px mb-3" style={{ background: "linear-gradient(90deg, #D4AF37, #FF6B00)" }} />
                  <h3 className="text-base font-black mb-2" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{service.title}</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(240,232,216,0.75)", fontFamily: "'Cairo', sans-serif" }}>{service.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-bold transition-all group-hover:gap-2" style={{ color: "#FFB347" }}>
                    اكتشف المزيد <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMPANY ROYAL SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "600px" }}>
        {/* الصورة الملكية كخلفية كاملة */}
        <div className="absolute inset-0">
          <img
            src={COMPANY_ROYAL_BG}
            alt="Expert Plan - قاعة فعاليات ملكية"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.55) saturate(1.2)" }}
          />
          {/* تدرج علوي وسفلي للاندماج مع الموقع */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, #0a1628 0%, transparent 18%, transparent 80%, #0a1628 100%)" }} />
          {/* طبقة تعتيم مركزية خفيفة */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.6) 0%, rgba(10,22,40,0.2) 50%, rgba(10,22,40,0.6) 100%)" }} />
        </div>

        {/* خط ذهبي علوي */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #D4AF37 30%, #FF6B00 50%, #D4AF37 70%, transparent)" }} />
        {/* خط ذهبي سفلي */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #D4AF37 30%, #FF6B00 50%, #D4AF37 70%, transparent)" }} />

        {/* المحتوى المركزي */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4" style={{ minHeight: "600px" }}>
          {/* شارة الشركة */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-8"
            style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.5)", backdropFilter: "blur(12px)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#D4AF37" }} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: "#D4AF37", fontFamily: "'Cairo', sans-serif", letterSpacing: "0.15em" }}>Expert Plan by MUSTAFA ALJAZAEERI</span>
            <span className="w-2 h-2 rounded-full" style={{ background: "#D4AF37" }} />
          </div>

          {/* العنوان الرئيسي */}
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "'Cairo', sans-serif", textShadow: "0 4px 30px rgba(0,0,0,0.8)" }}>
            <span style={{ color: "#f0e8d8" }}>نصنع</span>{" "}
            <span style={{ background: "linear-gradient(135deg, #D4AF37, #FF6B00, #FFB347)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>لحظات لا تُنسى</span>
          </h2>

          {/* الوصف */}
          <p className="text-xl md:text-2xl max-w-3xl mb-10 leading-relaxed" style={{ color: "rgba(240,232,216,0.85)", fontFamily: "'Cairo', sans-serif", textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
            من قاعات الأفراح الملكية إلى المؤتمرات الدولية الكبرى — نجمع بين الفخامة والاحترافية
            لنقدم لك تجربة فعاليات استثنائية لا مثيل لها
          </p>

          {/* إحصائيات مضغوطة */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {[
              { value: "500+", label: "فعالية ناجحة" },
              { value: "10+", label: "سنوات خبرة" },
              { value: "50K+", label: "عميل سعيد" },
              { value: "11+", label: "طريقة دفع" },
            ].map((s) => (
              <div key={s.label} className="text-center px-6 py-3 rounded-2xl"
                style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(212,175,55,0.35)", backdropFilter: "blur(8px)" }}>
                <div className="text-3xl font-black" style={{ background: "linear-gradient(135deg, #D4AF37, #FF6B00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontFamily: "'Cairo', sans-serif" }}>{s.value}</div>
                <div className="text-sm mt-1" style={{ color: "rgba(240,232,216,0.75)", fontFamily: "'Cairo', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* أزرار الدعوة */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate("/events")} size="lg"
              className="text-white font-bold px-10 py-6 text-lg rounded-xl"
              style={{ background: "linear-gradient(135deg, #D4AF37, #B8962E)", boxShadow: "0 4px 30px rgba(212,175,55,0.5)", border: "none" }}>
              <Award className="w-5 h-5 ml-2" />
              استعرض فعالياتنا
            </Button>
            <Button onClick={() => navigate("/about")} variant="outline" size="lg"
              className="font-bold px-10 py-6 text-lg rounded-xl"
              style={{ borderColor: "rgba(212,175,55,0.6)", color: "#D4AF37", background: "rgba(212,175,55,0.1)", backdropFilter: "blur(8px)" }}>
              <Users className="w-5 h-5 ml-2" />
              تعرّف علينا
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FLOWERS SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#0d1e35" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FF6B00, transparent)", filter: "blur(80px)" }} />
        <div className="container relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
                <Flower className="w-4 h-4" style={{ color: "#FF6B00" }} />
                <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>متجر الزهور الملكي</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
                زهور طبيعية وصناعية
                <br />
                <span className="text-fire-gradient">بجودة ملكية</span>
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: "rgba(240,232,216,0.7)", fontFamily: "'Cairo', sans-serif" }}>
                اكتشف مجموعتنا الحصرية من الورد الطبيعي الطازج والزهور الصناعية الفاخرة.
                باقات مصممة بأيدي خبراء لكل مناسبة — من الأفراح إلى الاحتفالات الرسمية.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "ورد طبيعي طازج", desc: "مستورد يومياً", img: "/manus-storage/home-flower-natural_0d266642.jpg" },
                  { label: "زهور صناعية فاخرة", desc: "تدوم للأبد", img: "/manus-storage/home-flower-artificial_c5b83cc4.jpg" },
                  { label: "باقات مخصصة", desc: "حسب طلبك", img: "/manus-storage/home-flower-custom_441ad28b.jpg" },
                  { label: "توصيل سريع", desc: "لجميع المناطق", img: "/manus-storage/home-flower-delivery_4f82c72c.jpg" },
                ].map((item) => (
                  <div key={item.label} className="relative overflow-hidden rounded-xl group" style={{ minHeight: "110px" }}>
                    <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.2) 100%)" }} />
                    <div className="relative z-10 flex flex-col justify-end h-full p-3" style={{ minHeight: "110px" }}>
                      <div className="font-bold text-sm mb-0.5 drop-shadow" style={{ color: "#FF9A3C", fontFamily: "'Cairo', sans-serif" }}>{item.label}</div>
                      <div className="text-xs drop-shadow" style={{ color: "rgba(240,232,216,0.8)", fontFamily: "'Cairo', sans-serif" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate("/flowers")} size="lg"
                className="font-bold px-8 py-6 text-lg rounded-xl text-white"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)", boxShadow: "0 4px 25px rgba(255,107,0,0.4)" }}>
                <Flower className="w-5 h-5 ml-2" />
                تسوّق الآن
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl opacity-30"
                style={{ background: "radial-gradient(circle at center, #FF6B00, transparent)", filter: "blur(40px)" }} />
              <img src={FLOWERS_IMG} alt="متجر الزهور الملكي"
                className="relative z-10 w-full rounded-3xl object-cover"
                style={{ height: "500px", border: "1px solid rgba(255,107,0,0.3)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED EVENTS
      ══════════════════════════════════════════ */}
      <section className="py-24" style={{ backgroundColor: "#0a1628" }}>
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
                <Star className="w-4 h-4" style={{ color: "#FF6B00" }} />
                <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>الفعاليات المميزة</span>
              </div>
              <h2 className="text-4xl font-black" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
                أبرز الفعاليات <span className="text-fire-gradient">القادمة</span>
              </h2>
            </div>
            <Button onClick={() => navigate("/events")} variant="outline" className="font-semibold rounded-xl"
              style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF9A3C", background: "rgba(255,107,0,0.08)" }}>
              عرض الكل
              <ChevronRight className="w-4 h-4 mr-2" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl animate-pulse h-80"
                  style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.1)" }} />
              ))}
            </div>
          ) : featuredEvents && featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => <EventCard key={event.id} event={event} navigate={navigate} />)}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)" }}>
                <Ticket className="w-10 h-10" style={{ color: "#FF6B00" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#f0e8d8" }}>لا توجد فعاليات مميزة حالياً</h3>
              <p style={{ color: "rgba(240,232,216,0.55)" }}>تابعنا لمعرفة أحدث الفعاليات القادمة</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button onClick={() => navigate("/events")} variant="outline" size="lg"
              className="font-bold px-8 rounded-xl"
              style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF9A3C", background: "rgba(255,107,0,0.08)" }}>
              عرض جميع الفعاليات
              <ChevronRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EVENTS VISUAL BANNER
      ══════════════════════════════════════════ */}
      <section className="relative py-32 overflow-hidden">
        <img src={EVENTS_IMG} alt="قاعة الفعاليات الملكية"
          className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(0.38)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.6) 100%)" }} />
        <div className="relative z-10 container text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
            نظّم فعاليتك معنا
            <br />
            <span className="text-fire-gradient">بأعلى معايير الاحتراف</span>
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "rgba(240,232,216,0.75)", fontFamily: "'Cairo', sans-serif" }}>
            من المؤتمرات الدولية إلى حفلات الزفاف الأسطورية — نحن شريكك في كل لحظة استثنائية
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={() => navigate("/events")} size="lg"
              className="font-bold px-10 py-6 text-xl rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)", boxShadow: "0 6px 30px rgba(255,107,0,0.5)" }}>
              استعرض الفعاليات
            </Button>
            <Button onClick={() => navigate("/track")} variant="outline" size="lg"
              className="font-bold px-10 py-6 text-xl rounded-xl"
              style={{ borderColor: "rgba(240,232,216,0.4)", color: "#f0e8d8", background: "rgba(240,232,216,0.08)" }}>
              تتبع طلبك
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PAYMENT METHODS
      ══════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "#0d1e35" }}>
        {/* Payment background image */}
        <div className="absolute inset-0">
          <img src={PAYMENT_IMG} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.15) saturate(1.3)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0d1e35 0%, rgba(13,30,53,0.75) 50%, #0d1e35 100%)" }} />
        </div>
        <div className="container relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
              <Shield className="w-4 h-4" style={{ color: "#FF6B00" }} />
              <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>طرق الدفع</span>
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
              11+ طريقة دفع <span className="text-fire-gradient">آمنة</span>
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: "rgba(240,232,216,0.6)", fontFamily: "'Cairo', sans-serif" }}>
              ندعم جميع طرق الدفع الأوروبية والعالمية بدون رمز تحقق إضافي
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {paymentMethods.map((pm, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all"
                style={{ background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.2)", color: "rgba(240,232,216,0.85)" }}>
                <span className="text-sm font-medium">{pm}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { icon: <Shield className="w-5 h-5" />, text: "SSL مشفر 256-bit" },
              { icon: <Globe className="w-5 h-5" />, text: "دفع دولي آمن" },
              { icon: <Zap className="w-5 h-5" />, text: "معالجة فورية" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "rgba(240,232,216,0.55)" }}>
                <span style={{ color: "#FF6B00" }}>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED RENTALS SECTION
      ══════════════════════════════════════════ */}
      <FeaturedRentalsSection navigate={navigate} />

      {/* ══════════════════════════════════════════
          TESTIMONIALS SECTION
      ══════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #FF6B00, transparent)", filter: "blur(60px)", transform: "translate(-50%, -50%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #4A90D9, transparent)", filter: "blur(60px)", transform: "translate(50%, 50%)" }} />

        <div className="container relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
              <Phone className="w-4 h-4" style={{ color: "#FF6B00" }} />
              <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>تواصل معنا</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
              نحن هنا <span className="text-fire-gradient">لمساعدتك</span>
            </h2>
            <p className="max-w-xl mx-auto text-lg" style={{ color: "rgba(240,232,216,0.65)", fontFamily: "'Cairo', sans-serif" }}>
              هل لديك استفسار أو تريد تنظيم فعالية خاصة؟ تواصل معنا وسيرد عليك فريقنا في أقرب وقت
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="grid grid-cols-1 gap-4">
              {contactInfo.map((item, i) => (
                <a key={i} href={item.href}
                  className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 block"
                  style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                    style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", color: "#FF6B00" }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: "rgba(240,232,216,0.45)" }}>{item.label}</div>
                    <div className="font-semibold transition-colors group-hover:text-orange-400"
                      style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
                      {item.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="space-y-6">
              <div className="p-8 rounded-2xl" style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)" }}>
                <h3 className="font-bold text-xl mb-6" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
                  تابعنا على وسائل التواصل
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, i) => (
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all group"
                      style={{ background: "rgba(255,107,0,0.07)", border: "1px solid rgba(255,107,0,0.15)" }}>
                      <span className="transition-transform group-hover:scale-110" style={{ color: "#FF6B00" }}>{social.icon}</span>
                      <span className="text-sm font-medium" style={{ color: "rgba(240,232,216,0.8)" }}>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-2xl" style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)" }}>
                <h3 className="font-bold text-xl mb-6" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>ساعات العمل</h3>
                <div className="space-y-3">
                  {[
                    { day: "الأحد – الخميس", hours: "9:00 ص – 6:00 م" },
                    { day: "الجمعة", hours: "10:00 ص – 2:00 م" },
                    { day: "السبت", hours: "مغلق" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(255,107,0,0.1)" }}>
                      <span className="text-sm" style={{ color: "rgba(240,232,216,0.6)", fontFamily: "'Cairo', sans-serif" }}>{item.day}</span>
                      <span className="text-sm font-semibold" style={{ color: item.hours === "مغلق" ? "#ef4444" : "#FF9A3C" }}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden" style={{ borderTop: "1px solid rgba(255,107,0,0.2)" }}>
        <div className="absolute inset-0">
          <img src={CTA_BG_IMG} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.28) saturate(1.3)" }} />
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.7) 50%, rgba(13,30,53,0.95) 100%)" }} />
        <div className="relative container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#FF6B00" }} />
            <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>ابدأ الآن</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
            هل أنت مستعد لتنظيم <span className="text-fire-gradient">فعاليتك؟</span>
          </h2>
          <p className="mb-8 leading-relaxed text-lg max-w-xl mx-auto"
            style={{ color: "rgba(240,232,216,0.65)", fontFamily: "'Cairo', sans-serif" }}>
            تواصل معنا اليوم وسنساعدك في تنظيم فعالية لا تُنسى بأعلى معايير الاحتراف
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate("/events")} size="lg"
              className="text-white font-bold px-8 py-6 rounded-xl"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)", boxShadow: "0 4px 25px rgba(255,107,0,0.5)" }}>
              <Ticket className="w-5 h-5 ml-2" />
              استعرض الفعاليات
            </Button>
            <Button onClick={() => navigate("/flowers")} variant="outline" size="lg"
              className="font-bold px-8 py-6 rounded-xl"
              style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF9A3C", background: "rgba(255,107,0,0.08)" }}>
              <Flower className="w-5 h-5 ml-2" />
              متجر الزهور
            </Button>
            <Button onClick={() => navigate("/rentals")} variant="outline" size="lg"
              className="font-bold px-8 py-6 rounded-xl"
              style={{ borderColor: "rgba(34,197,94,0.4)", color: "#4ade80", background: "rgba(34,197,94,0.08)" }}>
              <Sparkles className="w-5 h-5 ml-2" />
              تأجير اللوازم
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVENT CARD COMPONENT
═══════════════════════════════════════════════════════════ */
function EventCard({ event, navigate }: { event: any; navigate: (path: string) => void }) {
  return (
    <div className="group rounded-2xl overflow-hidden cursor-pointer luxury-card"
      style={{ background: "#0f1e35", border: "1px solid rgba(255,107,0,0.2)" }}
      onClick={() => navigate(`/events/${event.slug}`)}>
      <div className="relative h-52 overflow-hidden">
        <img
          src={event.coverImage || EVENTS_FALLBACK_IMG}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.85) 0%, transparent 60%)" }} />
        {event.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="text-white border-0 shadow-lg" style={{ background: "#FF6B00" }}>
              <Star className="w-3 h-3 ml-1 fill-white" /> مميز
            </Badge>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="border-0 backdrop-blur-sm text-white" style={{ background: "rgba(10,22,40,0.7)" }}>
            {CATEGORY_LABELS[event.category] ?? event.category}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-3 line-clamp-2 transition-colors group-hover:text-orange-400"
          style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
          {event.titleAr || event.title}
        </h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(240,232,216,0.6)" }}>
            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#FF6B00" }} />
            <span>{formatDate(event.startDate)}</span>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(240,232,216,0.6)" }}>
              <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "#FF6B00" }} />
              <span className="truncate">{event.venueAr || event.venue}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,107,0,0.15)" }}>
          <div>
            <span className="text-xs" style={{ color: "rgba(240,232,216,0.4)" }}>العملة</span>
            <div className="font-bold text-fire-gradient">{event.currency}</div>
          </div>
          <Button size="sm" className="text-white rounded-lg shadow-lg font-bold"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}
            onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.slug}`); }}>
            احجز الآن
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FEATURED RENTALS SECTION COMPONENT
═══════════════════════════════════════════════════════════ */
function FeaturedRentalsSection({ navigate }: { navigate: (path: string) => void }) {
  const { data: items, isLoading } = trpc.rentals.listItems.useQuery({ featuredOnly: true });

  const categoryIcons: Record<string, string> = {
    furniture: "🪑", lighting: "💡", tents: "⛺", decor: "🎨",
    audiovisual: "🎬", catering: "🍽️", transport: "🚐", other: "📦",
  };
  const categoryLabels: Record<string, string> = {
    furniture: "أثاث", lighting: "إضاءة", tents: "خيام وأغطية",
    decor: "ديكور", audiovisual: "صوت وصورة", catering: "تقديم طعام",
    transport: "نقل وشحن", other: "أخرى",
  };

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#0a1628" }}>
      {/* Decorative background */}
      <div className="absolute inset-0">
        <img src={RENTALS_FEATURED_IMG} alt="" className="w-full h-full object-cover"
          style={{ filter: "brightness(0.12) saturate(1.2)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #0a1628 0%, rgba(10,22,40,0.6) 50%, #0a1628 100%)" }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,107,0,0.25), transparent)", filter: "blur(50px)" }} />
      <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.15), transparent)", filter: "blur(50px)" }} />

      <div className="container relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#4ade80" }} />
              <span className="text-sm font-semibold" style={{ color: "#86efac" }}>تأجير لوازم المناسبات</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
              أبرز <span style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>لوازمنا المميزة</span>
            </h2>
            <p className="text-lg max-w-xl" style={{ color: "rgba(240,232,216,0.6)", fontFamily: "'Cairo', sans-serif" }}>
              أثاث فاخر، إضاءة سحرية، خيام ملكية وديكور استثنائي — كل ما تحتاجه لمناسبتك في مكان واحد
            </p>
          </div>
          <button
            onClick={() => navigate("/rentals")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all flex-shrink-0"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
            استعرض الكتالوج كاملاً
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.1)", height: "320px" }} />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any) => (
              <div key={item.id}
                className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{ background: "#0f1e35", border: "1px solid rgba(34,197,94,0.15)" }}
                onClick={() => navigate("/rentals")}>
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br"
                  style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(10,22,40,0.9))" }}>
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.nameAr || item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl opacity-60">
                        {categoryIcons[item.category] || "📦"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0"
                    style={{ background: "linear-gradient(to top, rgba(15,30,53,0.9) 0%, transparent 55%)" }} />
                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>
                  {/* Availability badge */}
                  {item.availableQuantity > 0 && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{ background: "rgba(10,22,40,0.85)", color: "rgba(240,232,216,0.7)" }}>
                        {item.availableQuantity} متاح
                      </span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1 line-clamp-1 transition-colors group-hover:text-green-400"
                    style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
                    {item.nameAr || item.name}
                  </h3>
                  {item.descriptionAr && (
                    <p className="text-sm line-clamp-2 mb-3"
                      style={{ color: "rgba(240,232,216,0.55)", fontFamily: "'Cairo', sans-serif" }}>
                      {item.descriptionAr}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid rgba(34,197,94,0.12)" }}>
                    <div>
                      <span className="text-xs" style={{ color: "rgba(240,232,216,0.4)" }}>السعر / يوم</span>
                      <div className="font-black text-lg"
                        style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {item.pricePerDay} {item.currency}
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
                      احجز الآن
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Placeholder cards when no data yet */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🪑", name: "كراسي ملكية فاخرة", nameAr: "كراسي ملكية فاخرة", category: "furniture", price: "5", currency: "JOD", qty: 200 },
              { icon: "💡", name: "إضاءة كريستال LED", nameAr: "إضاءة كريستال LED", category: "lighting", price: "15", currency: "JOD", qty: 50 },
              { icon: "⛺", name: "خيمة ملكية كبيرة", nameAr: "خيمة ملكية كبيرة", category: "tents", price: "150", currency: "JOD", qty: 10 },
              { icon: "🎨", name: "ديكور زهور وشموع", nameAr: "ديكور زهور وشموع", category: "decor", price: "25", currency: "JOD", qty: 30 },
              { icon: "🎬", name: "شاشة LED عملاقة", nameAr: "شاشة LED عملاقة", category: "audiovisual", price: "80", currency: "JOD", qty: 5 },
              { icon: "🍽️", name: "طاولات بوفيه فاخرة", nameAr: "طاولات بوفيه فاخرة", category: "catering", price: "20", currency: "JOD", qty: 40 },
            ].map((item, i) => (
              <div key={i}
                className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{ background: "#0f1e35", border: "1px solid rgba(34,197,94,0.15)" }}
                onClick={() => navigate("/rentals")}>
                <div className="relative h-48 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(10,22,40,0.95))" }}>
                  <span className="text-7xl opacity-70 transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
                      {categoryLabels[item.category]}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(10,22,40,0.85)", color: "rgba(240,232,216,0.7)" }}>
                      {item.qty} متاح
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1 transition-colors group-hover:text-green-400"
                    style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
                    {item.nameAr}
                  </h3>
                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid rgba(34,197,94,0.12)" }}>
                    <div>
                      <span className="text-xs" style={{ color: "rgba(240,232,216,0.4)" }}>السعر / يوم</span>
                      <div className="font-black text-lg"
                        style={{ background: "linear-gradient(135deg, #4ade80, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {item.price} {item.currency}
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
                      احجز الآن
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-6 p-6 rounded-2xl"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <div className="text-right">
              <div className="font-bold text-lg" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
                هل تحتاج لوازم خاصة؟
              </div>
              <div className="text-sm" style={{ color: "rgba(240,232,216,0.55)" }}>
                تواصل معنا لطلب مخصص يناسب مناسبتك
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/rentals")}
                className="px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}>
                استعرض الكتالوج
              </button>
              <a href="https://wa.me/447537867459" target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl font-bold text-sm"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#4ade80" }}>
                واتساب
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TESTIMONIALS SECTION COMPONENT
═══════════════════════════════════════════════════════════ */
const TESTIMONIALS_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/testimonials-bg-6mx7pPgfhgM7HTLFsRqnnq.png";
const AVATAR_1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/avatar-1-TNLPspaUqQaKLGxCaRk3UJ.png";
const AVATAR_2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/avatar-2-oUr2SPon6ATAFsoTAi6QWF.png";
const AVATAR_3 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/avatar-3-jiZhuEcHo7Q8PgcACZ57ZT.png";
const AVATAR_4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/avatar-4-c9vunY2HQCear6wi2aUdxr.png";

const TESTIMONIALS = [
  {
    id: 1,
    name: "م. خالد العمري",
    title: "مدير تنفيذي — شركة الأفق للاستثمار",
    avatar: AVATAR_1,
    rating: 5,
    text: "تجربة استثنائية بكل المقاييس. نظّمنا مؤتمرنا السنوي الكبير عبر Expert Plan وكان كل شيء مثالياً من حجز التذاكر حتى تأجير قاعات العرض. الاحترافية والدقة في التنفيذ لا مثيل لهما.",
    service: "تنظيم مؤتمرات",
    date: "مارس 2025",
  },
  {
    id: 2,
    name: "سارة المحمود",
    title: "مديرة فعاليات — مجموعة النخبة",
    avatar: AVATAR_2,
    rating: 5,
    text: "استأجرنا لوازم حفل الزفاف الفاخر من متجر التأجير وكانت الجودة تفوق التوقعات. الزهور الطبيعية والإضاءة الذهبية أضافت لمسة ملكية لا تُنسى. سنتعامل معهم دائماً.",
    service: "تأجير لوازم + زهور",
    date: "يناير 2025",
  },
  {
    id: 3,
    name: "أحمد البشير",
    title: "رجل أعمال — الرياض",
    avatar: AVATAR_3,
    rating: 5,
    text: "حجزت تذاكر لفعالية كبيرة لفريقي كاملاً. العملية كانت سلسة جداً، طرق الدفع متعددة ومريحة، وخدمة العملاء متجاوبة على مدار الساعة. أنصح بها بشدة.",
    service: "حجز تذاكر",
    date: "فبراير 2025",
  },
  {
    id: 4,
    name: "نورة الزهراني",
    title: "مديرة تسويق — مؤسسة الإبداع",
    avatar: AVATAR_4,
    rating: 5,
    text: "طلبنا تنسيق زهور لمعرضنا السنوي وكانت النتيجة مبهرة. الزهور الطبيعية والصناعية مزجت بأسلوب فني راقٍ. الموقع سهل الاستخدام والتوصيل في الموعد تماماً.",
    service: "متجر الزهور",
    date: "أبريل 2025",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-4 h-4" fill={i < rating ? "#FF6B00" : "none"}
          style={{ color: i < rating ? "#FF6B00" : "rgba(255,107,0,0.3)" }} />
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const goTo = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  const prev = () => goTo((activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => goTo((activeIndex + 1) % TESTIMONIALS.length);

  // Auto-advance every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      goTo((activeIndex + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const current = TESTIMONIALS[activeIndex];

  return (
    <section className="py-24 relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={TESTIMONIALS_BG} alt="" className="w-full h-full object-cover" style={{ opacity: 0.85 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(10,22,40,0.75) 50%, rgba(10,22,40,0.92) 100%)" }} />
      </div>

      {/* Golden top divider */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #FF6B00, #D4AF37, #FF6B00, transparent)" }} />
      {/* Golden bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #FF6B00, #D4AF37, #FF6B00, transparent)" }} />

      <div className="container relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
            style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.4)" }}>
            <Star className="w-4 h-4" style={{ color: "#D4AF37" }} fill="#D4AF37" />
            <span className="text-sm font-bold tracking-widest" style={{ color: "#D4AF37", fontFamily: "'Cairo', sans-serif" }}>آراء عملائنا</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
            ثقة <span style={{ background: "linear-gradient(135deg, #FF6B00, #D4AF37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>آلاف العملاء</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(240,232,216,0.65)", fontFamily: "'Cairo', sans-serif" }}>
            تجارب حقيقية من عملاء وثقوا بنا لتنظيم أبرز مناسباتهم
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-1"
            style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.5), rgba(255,107,0,0.3), rgba(212,175,55,0.5))" }}>
            <div className="rounded-3xl p-8 md:p-12 relative"
              style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.97), rgba(15,30,55,0.97))" }}>

              {/* Quote mark */}
              <div className="absolute top-6 right-8 text-8xl font-serif leading-none select-none"
                style={{ color: "rgba(212,175,55,0.15)", fontFamily: "Georgia, serif" }}>"</div>

              {/* Content */}
              <div className={`transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar + Info */}
                  <div className="flex-shrink-0 text-center md:text-right">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto"
                        style={{ border: "2px solid rgba(212,175,55,0.5)", boxShadow: "0 0 30px rgba(255,107,0,0.2)" }}>
                        <img src={current.avatar} alt={current.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #FF6B00, #D4AF37)" }}>
                        <Star className="w-4 h-4 text-white" fill="white" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-black text-lg" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>{current.name}</p>
                      <p className="text-sm mt-1" style={{ color: "rgba(240,232,216,0.55)", fontFamily: "'Cairo', sans-serif" }}>{current.title}</p>
                      <div className="flex justify-center md:justify-start mt-2">
                        <StarRating rating={current.rating} />
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                        style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", color: "#FF9A3C", fontFamily: "'Cairo', sans-serif" }}>
                        {current.service}
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p className="text-xl md:text-2xl leading-relaxed font-medium"
                      style={{ color: "rgba(240,232,216,0.9)", fontFamily: "'Cairo', sans-serif", lineHeight: "1.8" }}>
                      {current.text}
                    </p>
                    <p className="mt-6 text-sm" style={{ color: "rgba(212,175,55,0.6)", fontFamily: "'Cairo', sans-serif" }}>
                      — {current.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button onClick={prev}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)", color: "#FF9A3C" }}>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-3">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? "32px" : "10px",
                    height: "10px",
                    background: i === activeIndex
                      ? "linear-gradient(90deg, #FF6B00, #D4AF37)"
                      : "rgba(240,232,216,0.2)",
                  }} />
              ))}
            </div>

            <button onClick={next}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)", color: "#FF9A3C" }}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Mini Testimonial Previews */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            {TESTIMONIALS.map((t, i) => (
              <button key={t.id} onClick={() => goTo(i)}
                className="rounded-2xl p-4 text-right transition-all duration-200 hover:scale-105"
                style={{
                  background: i === activeIndex ? "rgba(255,107,0,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${i === activeIndex ? "rgba(255,107,0,0.5)" : "rgba(255,255,255,0.08)"}`,
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover"
                    style={{ border: "1px solid rgba(212,175,55,0.4)" }} />
                  <span className="text-xs font-bold truncate" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>{t.name.split(" ")[0]} {t.name.split(" ")[1]}</span>
                </div>
                <StarRating rating={t.rating} />
                <p className="text-xs mt-2 line-clamp-2" style={{ color: "rgba(240,232,216,0.5)", fontFamily: "'Cairo', sans-serif" }}>{t.text.slice(0, 60)}...</p>
              </button>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-16">
          {[
            { icon: "⭐", label: "4.9/5 تقييم متوسط" },
            { icon: "✅", label: "+500 تقييم موثّق" },
            { icon: "🏆", label: "أفضل منصة 2024" },
            { icon: "🔒", label: "بيانات محمية 100%" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 px-5 py-3 rounded-full"
              style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)" }}>
              <span className="text-lg">{badge.icon}</span>
              <span className="text-sm font-bold" style={{ color: "rgba(212,175,55,0.85)", fontFamily: "'Cairo', sans-serif" }}>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
