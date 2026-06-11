import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Star, Calendar, Users, TrendingUp } from "lucide-react";
import AdminLayout from "./AdminLayout";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700", draft: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700",
};
const STATUS_LABELS: Record<string, string> = {
  published: "منشور", draft: "مسودة", cancelled: "ملغي", completed: "مكتمل",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminEvents() {
  const [, navigate] = useLocation();
  const { data: events, isLoading, refetch } = trpc.events.adminList.useQuery();
  const updateEvent = trpc.events.update.useMutation({ onSuccess: () => { toast.success("تم التحديث"); refetch(); } });
  const deleteEvent = trpc.events.delete.useMutation({ onSuccess: () => { toast.success("تم الحذف"); refetch(); } });
  const seedEvents = trpc.admin.seedDemoEvents.useMutation({ onSuccess: () => { toast.success("تم إضافة الفعاليات التجريبية"); refetch(); } });

  const handleToggleStatus = (id: number, status: string) => {
    const newStatus = status === "published" ? "draft" : "published";
    updateEvent.mutate({ id, status: newStatus as any });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`هل أنت متأكد من حذف "${title}"؟`)) deleteEvent.mutate({ id });
  };

  return (
    <AdminLayout>
      <div className="p-6" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إدارة الفعاليات</h1>
            <p className="text-gray-500 text-sm mt-1">{events?.length ?? 0} فعالية</p>
          </div>
          <div className="flex gap-2">
            {(!events || events.length === 0) && (
              <Button onClick={() => seedEvents.mutate()} variant="outline" className="border-amber-300 text-amber-700" disabled={seedEvents.isPending}>
                {seedEvents.isPending ? "جاري الإضافة..." : "إضافة فعاليات تجريبية"}
              </Button>
            )}
            <Button onClick={() => navigate("/admin/events/create")} className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 ml-2" />
              فعالية جديدة
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : events && events.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الفعالية</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">التاريخ</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الحالة</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الطاقة</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={event.coverImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&q=60"}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                            {event.titleAr || event.title}
                          </div>
                          <div className="text-gray-400 text-xs mt-0.5">{event.venueAr || event.venue}</div>
                          {event.isFeatured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 mt-0.5" />}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{formatDate(event.startDate)}</td>
                    <td className="py-4 px-4">
                      <Badge className={`${STATUS_COLORS[event.status] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>
                        {STATUS_LABELS[event.status] ?? event.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{event.totalCapacity}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/events/${event.slug}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="معاينة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(event.id, event.status)}
                          className={`p-1.5 rounded-lg transition-colors text-xs font-medium px-2 ${
                            event.status === "published" ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {event.status === "published" ? "إخفاء" : "نشر"}
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.title)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-500 mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>لا توجد فعاليات</h3>
            <p className="text-gray-400 mb-6">ابدأ بإنشاء فعاليتك الأولى أو أضف فعاليات تجريبية</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => seedEvents.mutate()} variant="outline" className="border-amber-300 text-amber-700" disabled={seedEvents.isPending}>
                {seedEvents.isPending ? "جاري الإضافة..." : "إضافة فعاليات تجريبية"}
              </Button>
              <Button onClick={() => navigate("/admin/events/create")} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Plus className="w-4 h-4 ml-2" />
                فعالية جديدة
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
