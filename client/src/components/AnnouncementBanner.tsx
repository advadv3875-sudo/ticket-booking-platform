import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { X, Info, CheckCircle, AlertTriangle, Megaphone, ChevronLeft } from "lucide-react";

const TYPE_CONFIG = {
  info: {
    bg: "bg-[#0d1e35]",
    border: "border-[rgba(255,107,0,0.3)]",
    text: "text-[#f0e8d8]",
    icon: <Info size={15} className="text-[#FF9A3C] shrink-0" />,
    btnBg: "bg-[rgba(255,107,0,0.15)] hover:bg-[rgba(255,107,0,0.25)] text-[#FF9A3C]",
  },
  success: {
    bg: "bg-[#0a1e15]",
    border: "border-green-500/30",
    text: "text-green-100",
    icon: <CheckCircle size={15} className="text-green-400 shrink-0" />,
    btnBg: "bg-green-500/20 hover:bg-green-500/30 text-green-300",
  },
  warning: {
    bg: "bg-[#1a1000]",
    border: "border-[rgba(255,107,0,0.4)]",
    text: "text-[#FFB347]",
    icon: <AlertTriangle size={15} className="text-[#FF6B00] shrink-0" />,
    btnBg: "bg-[rgba(255,107,0,0.2)] hover:bg-[rgba(255,107,0,0.3)] text-[#FF9A3C]",
  },
  promo: {
    bg: "bg-gradient-to-r from-[#0a1628] to-[#1a0a00]",
    border: "border-[rgba(255,107,0,0.4)]",
    text: "text-[#FF9A3C]",
    icon: <Megaphone size={15} className="text-[#FF6B00] shrink-0" />,
    btnBg: "bg-[rgba(255,107,0,0.15)] hover:bg-[rgba(255,107,0,0.25)] text-[#FF6B00]",
  },
};

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  const { data: banners } = trpc.notifications.activeBanners.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });

  const visibleBanners = (banners ?? []).filter((b: any) => !dismissed.includes(b.id));

  if (!visibleBanners.length) return null;

  // Show only the first banner at a time
  const banner = visibleBanners[0] as any;
  const cfg = TYPE_CONFIG[banner.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.info;

  // Detect Arabic locale
  const isAr = document.documentElement.lang === "ar" || navigator.language.startsWith("ar");
  const message = isAr && banner.messageAr ? banner.messageAr : banner.message;

  return (
    <div
      className={`w-full ${cfg.bg} border-b ${cfg.border} py-2.5 px-4`}
      role="banner"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {cfg.icon}
          <p className={`text-sm ${cfg.text} truncate`}>{message}</p>
          {visibleBanners.length > 1 && (
            <span className="text-xs text-white/40 shrink-0">
              +{visibleBanners.length - 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {banner.ctaText && banner.ctaUrl && (
            <a
              href={banner.ctaUrl}
              className={`text-xs px-3 py-1 rounded-full ${cfg.btnBg} transition-colors flex items-center gap-1`}
            >
              {banner.ctaText}
              <ChevronLeft size={12} />
            </a>
          )}
          <button
            onClick={() => setDismissed((prev) => [...prev, banner.id])}
            className="text-white/40 hover:text-white/80 transition-colors p-0.5"
            aria-label="إغلاق الإعلان"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
