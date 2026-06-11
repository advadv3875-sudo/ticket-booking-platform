import { Instagram, Facebook, Linkedin, Send, Phone } from "lucide-react";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/expert_plan387?igsh=N3l1czQ4ZjZkeWN1&utm_source=qr",
    icon: <Instagram className="w-3.5 h-3.5" />,
    hoverColor: "#E1306C",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1DFR63nZJL/?mibextid=wwXIfr",
    icon: <Facebook className="w-3.5 h-3.5" />,
    hoverColor: "#1877F2",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@mustafa_ja387?igshid=NTc4MTIwNjQ2YQ==",
    icon: <Send className="w-3.5 h-3.5" />,
    hoverColor: "#AAAAAA",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@mustafa_sj7?_r=1&_t=ZS-94S2jxKvdKy",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
      </svg>
    ),
    hoverColor: "#FFFFFF",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/expert-plan-a337863b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    icon: <Linkedin className="w-3.5 h-3.5" />,
    hoverColor: "#0A66C2",
  },
  {
    label: "Snapchat",
    href: "https://snapchat.com/t/kHefBkVa",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.166.006C9.813-.109 7.226.77 5.6 2.37 4.12 3.82 3.39 5.86 3.39 7.88v.87c0 .55-.07 1.1-.2 1.63-.3.08-.62.12-.94.12-.43 0-.86-.08-1.27-.23-.1-.04-.21-.06-.31-.06-.43 0-.8.3-.88.72-.09.47.18.93.64 1.06.96.28 1.88.82 2.55 1.6.12.14.19.32.19.5 0 .1-.02.2-.07.3-.27.55-.84.9-1.46.9-.24 0-.48-.05-.7-.16-.1-.05-.21-.07-.32-.07-.48 0-.88.39-.88.88 0 .39.25.73.62.84 1.08.33 2.08.88 2.92 1.6.31.27.5.65.5 1.06 0 .12-.02.24-.05.35-.12.43-.52.73-.97.73h-.05c-.37 0-.74.15-1 .42-.26.27-.4.63-.38 1 .03.72.63 1.28 1.35 1.28.04 0 .08 0 .12-.01.43-.04.86-.06 1.29-.06.58 0 1.16.04 1.73.13.97.15 1.88.55 2.67 1.15.58.44 1.27.66 1.97.66s1.39-.22 1.97-.66c.79-.6 1.7-1 2.67-1.15.57-.09 1.15-.13 1.73-.13.43 0 .86.02 1.29.06.04.01.08.01.12.01.72 0 1.32-.56 1.35-1.28.02-.37-.12-.73-.38-1-.26-.27-.63-.42-1-.42h-.05c-.45 0-.85-.3-.97-.73-.03-.11-.05-.23-.05-.35 0-.41.19-.79.5-1.06.84-.72 1.84-1.27 2.92-1.6.37-.11.62-.45.62-.84 0-.49-.4-.88-.88-.88-.11 0-.22.02-.32.07-.22.11-.46.16-.7.16-.62 0-1.19-.35-1.46-.9-.05-.1-.07-.2-.07-.3 0-.18.07-.36.19-.5.67-.78 1.59-1.32 2.55-1.6.46-.13.73-.59.64-1.06-.08-.42-.45-.72-.88-.72-.1 0-.21.02-.31.06-.41.15-.84.23-1.27.23-.32 0-.64-.04-.94-.12-.13-.53-.2-1.08-.2-1.63v-.87c0-2.02-.73-4.06-2.22-5.51C16.77.77 14.5-.1 12.17.01z"/>
      </svg>
    ),
    hoverColor: "#FFFC00",
  },
  {
    label: "واتساب",
    href: "https://wa.me/447537867459",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    hoverColor: "#25D366",
  },
];

export default function SocialTopBar() {
  return (
    <div
      className="w-full py-2 px-4 relative overflow-hidden"
      dir="ltr"
      style={{
        background: "linear-gradient(90deg, #060e1a 0%, #0d1e35 40%, #0a1628 60%, #060e1a 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.3)",
      }}
    >
      {/* Subtle golden shimmer line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 30%, rgba(255,107,0,0.8) 50%, rgba(212,175,55,0.6) 70%, transparent 100%)" }}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Phone + tagline */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+962790460211"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200"
            style={{ color: "rgba(212,175,55,0.8)", fontFamily: "'Cairo', sans-serif" }}
          >
            <Phone className="w-3 h-3" style={{ color: "#FF9A3C" }} />
            <span dir="ltr">+962 79 046 0211</span>
          </a>
          <span
            className="hidden md:block text-xs"
            style={{ color: "rgba(240,232,216,0.35)", fontFamily: "'Cairo', sans-serif" }}
            dir="rtl"
          >
            Expert Plan by MUSTAFA ALJAZAEERI — المنظمة الأردنية الرائدة في تنظيم الفعاليات
          </span>
        </div>

        {/* Right: Social icons */}
        <div className="flex items-center gap-3.5 mr-auto">
          {/* Divider label */}
          <span className="hidden sm:block text-xs font-bold tracking-widest uppercase"
            style={{ color: "rgba(212,175,55,0.45)", letterSpacing: "0.15em" }}>
            Follow Us
          </span>
          <div className="hidden sm:block w-px h-3" style={{ background: "rgba(212,175,55,0.3)" }} />

          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className="transition-all duration-200 hover:scale-125"
              style={{ color: "rgba(212,175,55,0.55)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = s.hoverColor; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(212,175,55,0.55)"; }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
