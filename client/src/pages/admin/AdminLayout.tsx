import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Calendar, ShoppingBag, Users,
  LogOut, Menu, X, ChevronLeft, Star, Bell, Tag, TrendingUp
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/admin/analytics", label: "تحليلات المدفوعات", icon: TrendingUp },
  { path: "/admin/events", label: "الفعاليات", icon: Calendar },
  { path: "/admin/events/create", label: "فعالية جديدة", icon: Star },
  { path: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { path: "/admin/users", label: "المستخدمون", icon: Users },
  { path: "/admin/notifications", label: "الإشعارات", icon: Bell },
  { path: "/admin/coupons", label: "الكوبونات", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // توجيه غير المسجلين إلى صفحة تسجيل دخول المسؤول الخاصة
    navigate("/admin/login");
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== "admin" && user?.role !== "organizer") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            غير مصرح لك بالوصول
          </h2>
          <Button onClick={() => navigate("/")} className="bg-amber-500 hover:bg-amber-600 text-white mt-4">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-gray-950 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/logo-expert-plan-Kun6mTWULhFdcwiu9EC9fo.webp"
                  alt="Expert Plan Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <div className="text-amber-400 font-bold text-lg" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                    Expert Plan
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">لوحة التحكم</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-right ${
                    isActive
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{user?.name}</div>
                <div className="text-gray-500 text-xs capitalize">{user?.role}</div>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm py-2 px-3 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>Expert Plan</span>
          <button onClick={() => navigate("/")} className="text-gray-400 hover:text-amber-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
