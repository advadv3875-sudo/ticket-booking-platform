import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "./AdminLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Megaphone,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";



// ─── Banner Type Config ───────────────────────────────────────────────────────

const BANNER_TYPE_CONFIG = {
  info: { label: "معلومات", color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: <Info size={14} /> },
  success: { label: "نجاح", color: "bg-green-500/20 text-green-300 border-green-500/30", icon: <CheckCircle size={14} /> },
  warning: { label: "تحذير", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: <AlertTriangle size={14} /> },
  promo: { label: "عرض", color: "bg-[#c9a84c22] text-[#c9a84c] border-[#c9a84c44]", icon: <Megaphone size={14} /> },
};

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  booking_confirmed: "✅ تأكيد حجز",
  payment_success: "💳 دفع ناجح",
  payment_failed: "❌ فشل دفع",
  event_reminder_1day: "🔔 تذكير (يوم)",
  event_reminder_1week: "🔔 تذكير (أسبوع)",
  low_stock: "⚠️ مخزون منخفض",
  sold_out: "🚫 نفد المخزون",
  new_booking_admin: "🎫 حجز جديد",
  custom: "📢 مخصص",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminNotifications() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    message: "",
    messageAr: "",
    type: "info" as "info" | "success" | "warning" | "promo",
    ctaText: "",
    ctaUrl: "",
    isActive: true,
  });

  const utils = trpc.useUtils();

  const { data: banners, isLoading: bannersLoading } = trpc.notifications.activeBanners.useQuery();
  const { data: adminNotifs, isLoading: notifsLoading } = trpc.notifications.adminList.useQuery({ limit: 100 });

  const createBanner = trpc.notifications.createBanner.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الإعلان بنجاح");
      utils.notifications.activeBanners.invalidate();
      setCreateOpen(false);
      setForm({ message: "", messageAr: "", type: "info", ctaText: "", ctaUrl: "", isActive: true });
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const updateBanner = trpc.notifications.updateBanner.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الإعلان");
      utils.notifications.activeBanners.invalidate();
    },
  });

  const deleteBanner = trpc.notifications.deleteBanner.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الإعلان");
      utils.notifications.activeBanners.invalidate();
    },
  });

  const sendReminders = trpc.notifications.sendReminders.useMutation({
    onSuccess: () => toast.success("تم إرسال التذكيرات بنجاح"),
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const handleCreate = () => {
    if (!form.message.trim()) return toast.error("نص الإعلان مطلوب");
    createBanner.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 p-8">
        <h1 className="text-2xl font-bold text-gray-900">الإشعارات والإعلانات</h1>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111] border border-[#c9a84c22] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Megaphone className="text-[#c9a84c]" size={20} />
              <span className="text-gray-400 text-sm">الإعلانات النشطة</span>
            </div>
            <div className="text-3xl font-bold text-white">{banners?.length ?? 0}</div>
          </div>
          <div className="bg-[#111] border border-[#c9a84c22] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="text-[#c9a84c]" size={20} />
              <span className="text-gray-400 text-sm">إجمالي الإشعارات</span>
            </div>
            <div className="text-3xl font-bold text-white">{adminNotifs?.length ?? 0}</div>
          </div>
          <div className="bg-[#111] border border-[#c9a84c22] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-400" size={20} />
              <span className="text-gray-400 text-sm">إشعارات مُرسلة</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {adminNotifs?.filter((n: any) => n.status === "sent").length ?? 0}
            </div>
          </div>
        </div>

        {/* ─── Announcement Banners ─── */}
        <div className="bg-[#111] border border-[#c9a84c22] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Megaphone className="text-[#c9a84c]" size={22} />
              <h2 className="text-lg font-bold text-white">شرائط الإعلانات</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => sendReminders.mutate()}
                disabled={sendReminders.isPending}
                variant="outline"
                size="sm"
                className="border-[#c9a84c44] text-[#c9a84c] hover:bg-[#c9a84c22] bg-transparent"
              >
                <Send size={14} className="ml-1" />
                {sendReminders.isPending ? "جاري الإرسال..." : "إرسال تذكيرات الفعاليات"}
              </Button>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#c9a84c] text-black hover:bg-[#e8c96d]">
                    <Plus size={14} className="ml-1" />
                    إعلان جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111] border-[#c9a84c33] text-white max-w-lg" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-[#c9a84c]">إنشاء إعلان جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">النص بالعربية *</label>
                      <Textarea
                        value={form.messageAr}
                        onChange={(e) => setForm({ ...form, messageAr: e.target.value })}
                        placeholder="نص الإعلان بالعربية..."
                        className="bg-[#1a1a1a] border-[#c9a84c33] text-white resize-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">النص بالإنجليزية *</label>
                      <Textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Announcement text in English..."
                        className="bg-[#1a1a1a] border-[#c9a84c33] text-white resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">النوع</label>
                        <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                          <SelectTrigger className="bg-[#1a1a1a] border-[#c9a84c33] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#c9a84c33]">
                            {Object.entries(BANNER_TYPE_CONFIG).map(([key, cfg]) => (
                              <SelectItem key={key} value={key} className="text-white">
                                {cfg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-1 block">نص الزر (اختياري)</label>
                        <Input
                          value={form.ctaText}
                          onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                          placeholder="احجز الآن"
                          className="bg-[#1a1a1a] border-[#c9a84c33] text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">رابط الزر (اختياري)</label>
                      <Input
                        value={form.ctaUrl}
                        onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                        placeholder="https://..."
                        className="bg-[#1a1a1a] border-[#c9a84c33] text-white"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={handleCreate}
                        disabled={createBanner.isPending}
                        className="flex-1 bg-[#c9a84c] text-black hover:bg-[#e8c96d]"
                      >
                        {createBanner.isPending ? "جاري الإنشاء..." : "إنشاء الإعلان"}
                      </Button>
                      <Button
                        onClick={() => setCreateOpen(false)}
                        variant="outline"
                        className="border-[#c9a84c33] text-gray-400 bg-transparent"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {bannersLoading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : !banners?.length ? (
            <div className="text-center py-12">
              <Megaphone className="mx-auto text-gray-600 mb-3" size={40} />
              <p className="text-gray-400">لا توجد إعلانات نشطة</p>
              <p className="text-gray-400 text-sm mt-1">أنشئ إعلاناً ليظهر في أعلى الموقع</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner: any) => {
                const cfg = BANNER_TYPE_CONFIG[banner.type as keyof typeof BANNER_TYPE_CONFIG];
                return (
                  <div
                    key={banner.id}
                    className="flex items-start gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#ffffff08]"
                  >
                    <Badge className={`${cfg.color} border flex items-center gap-1 shrink-0 mt-0.5`}>
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      {banner.messageAr && (
                        <p className="text-white text-sm font-medium">{banner.messageAr}</p>
                      )}
                      <p className="text-gray-400 text-sm">{banner.message}</p>
                      {banner.ctaText && (
                        <span className="text-[#c9a84c] text-xs mt-1 inline-block">
                          زر: {banner.ctaText} → {banner.ctaUrl}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateBanner.mutate({ id: banner.id, isActive: !banner.isActive })}
                        className="text-gray-400 hover:text-white h-8 w-8 p-0"
                        title={banner.isActive ? "إخفاء" : "إظهار"}
                      >
                        {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBanner.mutate({ id: banner.id })}
                        className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Notification Log ─── */}
        <div className="bg-[#111] border border-[#c9a84c22] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="text-[#c9a84c]" size={22} />
            <h2 className="text-lg font-bold text-white">سجل الإشعارات</h2>
          </div>

          {notifsLoading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : !adminNotifs?.length ? (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-600 mb-3" size={40} />
              <p className="text-gray-400">لا توجد إشعارات بعد</p>
              <p className="text-gray-400 text-sm mt-1">ستظهر الإشعارات هنا عند إتمام الحجوزات</p>
            </div>
          ) : (
            <div className="space-y-2">
              {adminNotifs.map((notif: any) => (
                <div
                  key={notif.id}
                  className="flex items-center gap-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#ffffff08] hover:border-[#c9a84c22] transition-colors"
                >
                  <div className="shrink-0">
                    {notif.status === "sent" ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : notif.status === "failed" ? (
                      <XCircle size={16} className="text-red-400" />
                    ) : (
                      <Clock size={16} className="text-yellow-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium truncate">{notif.title}</span>
                      <Badge className="bg-[#c9a84c11] text-[#c9a84c] border-[#c9a84c33] text-xs border shrink-0">
                        {NOTIFICATION_TYPE_LABELS[notif.type] ?? notif.type}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 truncate">{notif.message}</p>
                  </div>
                  <div className="text-gray-400 text-xs shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString("ar-JO", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Email Notification Info ─── */}
        <div className="bg-[#111] border border-[#c9a84c22] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Send className="text-[#c9a84c]" size={22} />
            <h2 className="text-lg font-bold text-white">إشعارات البريد الإلكتروني</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "✅", title: "تأكيد الحجز", desc: "يُرسل تلقائياً عند إتمام الدفع بنجاح مع تفاصيل الحجز" },
              { icon: "❌", title: "فشل الدفع", desc: "يُرسل عند فشل عملية الدفع مع رابط للمحاولة مجدداً" },
              { icon: "🔔", title: "تذكير (يوم قبل)", desc: "يُرسل قبل 24 ساعة من موعد الفعالية" },
              { icon: "📅", title: "تذكير (أسبوع قبل)", desc: "يُرسل قبل 7 أيام من موعد الفعالية" },
            ].map((item) => (
              <div key={item.title} className="bg-[#1a1a1a] rounded-lg p-4 border border-[#ffffff08]">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white font-medium text-sm mb-1">{item.title}</div>
                <div className="text-gray-400 text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[#c9a84c11] border border-[#c9a84c33] rounded-lg">
            <p className="text-[#c9a84c] text-sm">
              💡 التذكيرات التلقائية تُرسل يومياً. يمكنك إرسالها يدوياً الآن بالضغط على زر "إرسال تذكيرات الفعاليات" أعلاه.
            </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
