import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu, X, ChevronDown, LogOut, LayoutDashboard,
  Flower, Package, Home, CalendarDays, Info, Search, Crown
} from "lucide-react";
import SocialTopBar from "@/components/SocialTopBar";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية", icon: <Home className="w-3.5 h-3.5" /> },
  { href: "/events", label: "الفعاليات", icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { href: "/flowers", label: "متجر الزهور", icon: <Flower className="w-3.5 h-3.5" /> },
  { href: "/rentals", label: "تأجير اللوازم", icon: <Package className="w-3.5 h-3.5" /> },
  { href: "/about", label: "من نحن", icon: <Info className="w-3.5 h-3.5" /> },
  { href: "/track", label: "تتبع الطلب", icon: <Search className="w-3.5 h-3.5" /> },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 30);
      // Calculate scroll progress percentage
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Social Top Bar */}
      <SocialTopBar />

      {/* Main Navbar */}
      <nav
        className="transition-all duration-500 relative"
        style={{
          background: isScrolled
            ? "rgba(6,14,26,0.97)"
            : "rgba(6,14,26,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: isScrolled
            ? "1px solid rgba(212,175,55,0.35)"
            : "1px solid rgba(212,175,55,0.12)",
          boxShadow: isScrolled
            ? "0 8px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,107,0,0.15)"
            : "none",
        }}
      >
        {/* Top golden accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: isScrolled
              ? "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.8) 20%, rgba(255,107,0,1) 50%, rgba(212,175,55,0.8) 80%, transparent 100%)"
              : "linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.3) 50%, transparent 100%)",
            transition: "all 0.5s ease",
          }}
        />

        <div className="container">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── LOGO ── */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                {/* Logo emblem */}
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(255,107,0,0.1) 100%)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      boxShadow: "0 0 20px rgba(212,175,55,0.1), inset 0 1px 0 rgba(212,175,55,0.2)",
                    }}
                  >
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/logo-expert-plan-Kun6mTWULhFdcwiu9EC9fo.webp"
                      alt="Expert Plan"
                      className="w-8 h-8 object-contain drop-shadow-lg"
                    />
                  </div>
                  {/* Crown badge */}
                  <div
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #D4AF37, #FF6B00)", boxShadow: "0 2px 8px rgba(212,175,55,0.5)" }}
                  >
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                {/* Brand text */}
                <div className="hidden sm:block">
                  <div
                    className="font-black text-base leading-tight tracking-wide"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      background: "linear-gradient(135deg, #f0e8d8 0%, #D4AF37 50%, #FF9A3C 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Expert Plan
                  </div>
                  <div
                    className="text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "rgba(255,107,0,0.75)", letterSpacing: "0.12em" }}
                  >
                    by MUSTAFA ALJAZAEERI
                  </div>
                </div>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <div className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-300 rounded-xl group/link"
                      style={{
                        color: isActive ? "#FF9A3C" : "rgba(240,232,216,0.75)",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(212,175,55,0.08) 100%)"
                          : "transparent",
                        border: isActive
                          ? "1px solid rgba(255,107,0,0.3)"
                          : "1px solid transparent",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLSpanElement).style.color = "rgba(240,232,216,1)";
                          (e.currentTarget as HTMLSpanElement).style.background = "rgba(255,255,255,0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLSpanElement).style.color = "rgba(240,232,216,0.75)";
                          (e.currentTarget as HTMLSpanElement).style.background = "transparent";
                        }
                      }}
                    >
                      {/* Active indicator dot */}
                      {isActive && (
                        <span
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: "#FF6B00", boxShadow: "0 0 6px #FF6B00" }}
                        />
                      )}
                      <span style={{ color: isActive ? "#FF9A3C" : "rgba(212,175,55,0.6)" }}>
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* ── RIGHT SIDE ── */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Decorative divider */}
              <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.4), transparent)" }} />

              {isAuthenticated && isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300"
                      style={{
                        background: "linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(255,107,0,0.08) 100%)",
                        border: "1px solid rgba(212,175,55,0.25)",
                        color: "rgba(240,232,216,0.9)",
                      }}
                    >
                      <Avatar className="w-7 h-7">
                        <AvatarFallback
                          className="text-xs font-black"
                          style={{
                            background: "linear-gradient(135deg, #D4AF37, #FF6B00)",
                            color: "white",
                          }}
                        >
                          {user?.name?.charAt(0)?.toUpperCase() ?? "M"}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="text-sm font-semibold max-w-28 truncate"
                        style={{ fontFamily: "'Cairo', sans-serif", color: "rgba(240,232,216,0.9)" }}
                      >
                        {user?.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(212,175,55,0.7)" }} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 rounded-2xl overflow-hidden"
                    style={{
                      background: "rgba(6,14,26,0.98)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,107,0,0.1)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                      <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.6)" }}>
                        لوحة الإدارة
                      </p>
                    </div>
                    <DropdownMenuItem asChild className="mt-1 mx-1 rounded-xl cursor-pointer">
                      <Link href="/admin">
                        <div className="flex items-center gap-2.5 py-1">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,107,0,0.15)" }}>
                            <LayoutDashboard className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
                          </div>
                          <span style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>لوحة التحكم</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-2 my-1" style={{ background: "rgba(212,175,55,0.15)" }} />
                    <DropdownMenuItem
                      onClick={logout}
                      className="mx-1 mb-1 rounded-xl cursor-pointer"
                      style={{ color: "#f87171" }}
                    >
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(248,113,113,0.1)" }}>
                          <LogOut className="w-3.5 h-3.5" />
                        </div>
                        <span style={{ fontFamily: "'Cairo', sans-serif" }}>تسجيل الخروج</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* CTA Button for non-admin */
                <Link href="/events">
                  <Button
                    size="sm"
                    className="font-bold rounded-xl px-5 transition-all duration-300 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #FF6B00 0%, #D4AF37 100%)",
                      color: "white",
                      boxShadow: "0 4px 20px rgba(255,107,0,0.35)",
                      border: "none",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    احجز الآن
                  </Button>
                </Link>
              )}
            </div>

            {/* ── MOBILE MENU BUTTON ── */}
            <button
              className="lg:hidden p-2.5 rounded-xl transition-all duration-300"
              style={{
                background: mobileOpen
                  ? "linear-gradient(135deg, rgba(255,107,0,0.2), rgba(212,175,55,0.1))"
                  : "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "rgba(240,232,216,0.9)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── SCROLL PROGRESS BAR ── */}
        <div
          className="absolute bottom-0 left-0 h-[2.5px] transition-all duration-100"
          style={{
            width: `${scrollProgress}%`,
            background: scrollProgress > 0
              ? "linear-gradient(90deg, #D4AF37 0%, #FF9A3C 40%, #FF6B00 70%, #FF3D00 100%)"
              : "transparent",
            boxShadow: scrollProgress > 0
              ? "0 0 8px rgba(255,107,0,0.8), 0 0 20px rgba(212,175,55,0.4)"
              : "none",
            borderRadius: "0 2px 2px 0",
          }}
        />
        {/* Glow dot at the tip */}
        {scrollProgress > 1 && scrollProgress < 99.5 && (
          <div
            className="absolute bottom-0 h-[2.5px] w-3 transition-all duration-100"
            style={{
              left: `calc(${scrollProgress}% - 6px)`,
              background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,107,0,0.6) 60%, transparent 100%)",
              filter: "blur(1px)",
            }}
          />
        )}

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div
            className="lg:hidden"
            style={{
              background: "rgba(6,14,26,0.99)",
              borderTop: "1px solid rgba(212,175,55,0.2)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Golden top line */}
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), rgba(255,107,0,0.7), rgba(212,175,55,0.5), transparent)" }} />

            <div className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className="flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 cursor-pointer"
                      style={{
                        color: isActive ? "#FF9A3C" : "rgba(240,232,216,0.8)",
                        background: isActive
                          ? "linear-gradient(135deg, rgba(255,107,0,0.15), rgba(212,175,55,0.08))"
                          : "transparent",
                        border: isActive ? "1px solid rgba(255,107,0,0.25)" : "1px solid transparent",
                        fontFamily: "'Cairo', sans-serif",
                        fontWeight: 600,
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span style={{ color: isActive ? "#FF9A3C" : "rgba(212,175,55,0.5)" }}>
                        {item.icon}
                      </span>
                      {item.label}
                      {isActive && (
                        <span
                          className="mr-auto w-1.5 h-1.5 rounded-full"
                          style={{ background: "#FF6B00", boxShadow: "0 0 6px #FF6B00" }}
                        />
                      )}
                    </span>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-2 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />

              {isAuthenticated && isAdmin ? (
                <>
                  <Link href="/admin">
                    <span
                      className="flex items-center gap-3 py-3 px-4 rounded-xl cursor-pointer font-bold"
                      style={{
                        color: "#FF9A3C",
                        background: "linear-gradient(135deg, rgba(255,107,0,0.12), rgba(212,175,55,0.06))",
                        border: "1px solid rgba(255,107,0,0.2)",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      لوحة التحكم
                    </span>
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="text-right py-3 px-4 rounded-xl transition-colors flex items-center gap-3"
                    style={{ color: "#f87171", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link href="/events">
                  <span
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl cursor-pointer font-bold text-center"
                    style={{
                      background: "linear-gradient(135deg, #FF6B00 0%, #D4AF37 100%)",
                      color: "white",
                      fontFamily: "'Cairo', sans-serif",
                      boxShadow: "0 4px 20px rgba(255,107,0,0.3)",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    احجز الآن
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
