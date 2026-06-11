import { useState } from "react";
import {
  Instagram, Facebook, Linkedin, MessageCircle, Send,
  Mail, Phone, Globe, MapPin, Copy, Check, ExternalLink,
  Star, Award, Users, Calendar
} from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    handle: "@expert_plan387",
    href: "https://www.instagram.com/expert_plan387?igsh=N3l1czQ4ZjZkeWN1&utm_source=qr",
    icon: <Instagram className="w-5 h-5" />,
    bg: "from-pink-500 via-rose-500 to-orange-400",
    textColor: "text-white",
  },
  {
    label: "Facebook",
    handle: "Expert Plan",
    href: "https://www.facebook.com/share/1DFR63nZJL/?mibextid=wwXIfr",
    icon: <Facebook className="w-5 h-5" />,
    bg: "from-blue-600 to-blue-700",
    textColor: "text-white",
  },
  {
    label: "Threads",
    handle: "@mustafa_ja387",
    href: "https://www.threads.com/@mustafa_ja387?igshid=NTc4MTIwNjQ2YQ==",
    icon: <Send className="w-5 h-5" />,
    bg: "from-gray-700 to-gray-800",
    textColor: "text-white",
  },
  {
    label: "TikTok",
    handle: "@mustafa_sj7",
    href: "https://www.tiktok.com/@mustafa_sj7?_r=1&_t=ZS-94S2jxKvdKy",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
      </svg>
    ),
    bg: "from-gray-900 to-black",
    textColor: "text-white",
  },
  {
    label: "LinkedIn",
    handle: "Expert Plan",
    href: "https://www.linkedin.com/in/expert-plan-a337863b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    icon: <Linkedin className="w-5 h-5" />,
    bg: "from-blue-500 to-blue-600",
    textColor: "text-white",
  },
  {
    label: "Snapchat",
    handle: "Expert Plan",
    href: "https://snapchat.com/t/kHefBkVa",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.166.006C9.813-.109 7.226.77 5.6 2.37 4.12 3.82 3.39 5.86 3.39 7.88v.87c0 .55-.07 1.1-.2 1.63-.3.08-.62.12-.94.12-.43 0-.86-.08-1.27-.23-.1-.04-.21-.06-.31-.06-.43 0-.8.3-.88.72-.09.47.18.93.64 1.06.96.28 1.88.82 2.55 1.6.12.14.19.32.19.5 0 .1-.02.2-.07.3-.27.55-.84.9-1.46.9-.24 0-.48-.05-.7-.16-.1-.05-.21-.07-.32-.07-.48 0-.88.39-.88.88 0 .39.25.73.62.84 1.08.33 2.08.88 2.92 1.6.31.27.5.65.5 1.06 0 .12-.02.24-.05.35-.12.43-.52.73-.97.73h-.05c-.37 0-.74.15-1 .42-.26.27-.4.63-.38 1 .03.72.63 1.28 1.35 1.28.04 0 .08 0 .12-.01.43-.04.86-.06 1.29-.06.58 0 1.16.04 1.73.13.97.15 1.88.55 2.67 1.15.58.44 1.27.66 1.97.66s1.39-.22 1.97-.66c.79-.6 1.7-1 2.67-1.15.57-.09 1.15-.13 1.73-.13.43 0 .86.02 1.29.06.04.01.08.01.12.01.72 0 1.32-.56 1.35-1.28.02-.37-.12-.73-.38-1-.26-.27-.63-.42-1-.42h-.05c-.45 0-.85-.3-.97-.73-.03-.11-.05-.23-.05-.35 0-.41.19-.79.5-1.06.84-.72 1.84-1.27 2.92-1.6.37-.11.62-.45.62-.84 0-.49-.4-.88-.88-.88-.11 0-.22.02-.32.07-.22.11-.46.16-.7.16-.62 0-1.19-.35-1.46-.9-.05-.1-.07-.2-.07-.3 0-.18.07-.36.19-.5.67-.78 1.59-1.32 2.55-1.6.46-.13.73-.59.64-1.06-.08-.42-.45-.72-.88-.72-.1 0-.21.02-.31.06-.41.15-.84.23-1.27.23-.32 0-.64-.04-.94-.12-.13-.53-.2-1.08-.2-1.63v-.87c0-2.02-.73-4.06-2.22-5.51C16.77.77 14.5-.1 12.17.01z"/>
      </svg>
    ),
    bg: "from-yellow-400 to-yellow-500",
    textColor: "text-gray-900",
  },
  {
    label: "واتساب",
    handle: "تواصل مباشر",
    href: "https://wa.me/447537867459",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    bg: "from-green-500 to-green-600",
    textColor: "text-white",
  },
];

const CONTACT_INFO = [
  { icon: <Phone className="w-4 h-4" />, label: "هاتف أردن", value: "+962 79 046 0211", href: "tel:+962790460211" },
  { icon: <Phone className="w-4 h-4" />, label: "هاتف أردن", value: "+962 79 075 9982", href: "tel:+962790759982" },
  { icon: <Mail className="w-4 h-4" />, label: "البريد الإلكتروني", value: "maljazaeeri@gmail.com", href: "mailto:maljazaeeri@gmail.com" },
  { icon: <Globe className="w-4 h-4" />, label: "الموقع الإلكتروني", value: "aljazaeeri.site.expertplan.vip", href: "https://aljazaeeri.site.expertplan.vip" },
  { icon: <MapPin className="w-4 h-4" />, label: "الموقع", value: "عمان، المملكة الأردنية الهاشمية", href: "#" },
];

const STATS = [
  { icon: <Calendar className="w-5 h-5" />, value: "500+", label: "فعالية ناجحة" },
  { icon: <Users className="w-5 h-5" />, value: "50K+", label: "عميل راضٍ" },
  { icon: <Award className="w-5 h-5" />, value: "15+", label: "سنة خبرة" },
  { icon: <Star className="w-5 h-5" />, value: "20+", label: "دولة" },
];

export default function DigitalCardPage() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0f172a 50%, #1a0a2e 100%)" }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #d97706, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(217,119,6,0.3)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header gradient */}
          <div
            className="relative h-36 flex items-end justify-center pb-0"
            style={{ background: "linear-gradient(135deg, #92400e 0%, #d97706 50%, #f59e0b 100%)" }}
          >
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "30px 30px"
            }} />

            {/* Avatar */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div
                className="w-24 h-24 rounded-full overflow-hidden shadow-2xl"
                style={{ border: "4px solid #d97706" }}
              >
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/mustafa-aljazaeeri-profile_1f2675f6.jpeg"
                  alt="مصطفى الجزائري"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-6 px-6 text-center">
            <h1
              className="text-2xl font-black text-white mb-1"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              مصطفى الجزائري
            </h1>
            <p className="text-amber-400 font-semibold text-sm mb-1">MUSTAFA ALJAZAEERI</p>
            <p className="text-gray-400 text-xs mb-4" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              المؤسس والرئيس التنفيذي — Expert Plan
            </p>
            <p className="text-gray-300 text-sm leading-relaxed" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              المنظمة الأردنية الرائدة في تنظيم الفعاليات والمؤتمرات الدولية والمعارض وحفلات الزفاف
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-1 px-4 mb-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)" }}>
                <div className="text-amber-400 flex justify-center mb-1">{s.icon}</div>
                <div className="text-white font-black text-sm">{s.value}</div>
                <div className="text-gray-500 text-xs" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="px-4 mb-5 space-y-2" dir="rtl">
            {CONTACT_INFO.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="text-amber-400 flex-shrink-0">{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-500 text-xs">{c.label}</div>
                  <div className="text-gray-200 text-sm truncate">{c.value}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* Social Links */}
          <div className="px-4 mb-6 space-y-2.5">
            <p className="text-gray-500 text-xs text-center mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              تواصل معي عبر
            </p>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r ${s.bg} ${s.textColor} font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg`}
              >
                <span className="flex-shrink-0">{s.icon}</span>
                <span className="flex-1">{s.label}</span>
                <span className="text-xs opacity-70">{s.handle}</span>
              </a>
            ))}
          </div>

          {/* Footer actions */}
          <div className="px-4 pb-6 flex gap-3">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.4)", color: "#f59e0b" }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "تم النسخ!" : "نسخ الرابط"}
            </button>
            <a
              href="https://aljazaeeri.site.expertplan.vip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}
            >
              <Globe className="w-4 h-4" />
              زيارة الموقع
            </a>
          </div>

          {/* Branding footer */}
          <div
            className="py-3 text-center text-xs text-gray-600 border-t"
            style={{ borderColor: "rgba(255,255,255,0.05)", fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          >
            Expert Plan by MUSTAFA ALJAZAEERI © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
