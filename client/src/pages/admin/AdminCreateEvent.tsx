import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Calendar, MapPin, Ticket, Globe } from "lucide-react";
import AdminLayout from "./AdminLayout";

const CATEGORIES = [
  { value: "conference", label: "مؤتمر" }, { value: "exhibition", label: "معرض" },
  { value: "wedding", label: "حفل زفاف" }, { value: "concert", label: "حفلة موسيقية" },
  { value: "corporate", label: "مؤسسي" }, { value: "cultural", label: "ثقافي" },
  { value: "sports", label: "رياضي" }, { value: "other", label: "أخرى" },
];
const CURRENCIES = ["JOD", "EUR", "USD", "AED", "SAR", "GBP"];

interface TicketTypeForm { name: string; nameAr: string; price: string; totalQuantity: string; maxPerOrder: string; }

export default function AdminCreateEvent() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [category, setCategory] = useState("conference");
  const [venue, setVenue] = useState("");
  const [venueAr, setVenueAr] = useState("");
  const [city, setCity] = useState("Amman");
  const [country, setCountry] = useState("Jordan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState("JOD");
  const [coverImage, setCoverImage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("draft");
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: "Standard", nameAr: "عادي", price: "50", totalQuantity: "100", maxPerOrder: "10" },
  ]);

  const createEvent = trpc.events.create.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء الفعالية بنجاح!");
      navigate("/admin/events");
    },
    onError: (e) => toast.error(e.message || "حدث خطأ"),
  });

  const addTicketType = () => setTicketTypes((prev) => [...prev, { name: "", nameAr: "", price: "", totalQuantity: "", maxPerOrder: "10" }]);
  const removeTicketType = (i: number) => setTicketTypes((prev) => prev.filter((_, idx) => idx !== i));
  const updateTicketType = (i: number, field: keyof TicketTypeForm, value: string) => {
    setTicketTypes((prev) => prev.map((tt, idx) => idx === i ? { ...tt, [field]: value } : tt));
  };

  const handleSubmit = () => {
    if (!title || !startDate || !endDate) { toast.error("يرجى ملء الحقول المطلوبة"); return; }
    createEvent.mutate({
      title, titleAr: titleAr || undefined,
      description: description || undefined, descriptionAr: descriptionAr || undefined,
      category: category as any, venue: venue || undefined, venueAr: venueAr || undefined,
      city, country, startDate: new Date(startDate).getTime(), endDate: new Date(endDate).getTime(),
      currency: currency as any, coverImage: coverImage || undefined,
      isFeatured, status: status as any,
      ticketTypes: ticketTypes.filter((tt) => tt.name && tt.price).map((tt) => ({
        name: tt.name, nameAr: tt.nameAr || undefined,
        price: parseFloat(tt.price), totalQuantity: parseInt(tt.totalQuantity) || 100,
        maxPerOrder: parseInt(tt.maxPerOrder) || 10,
      })),
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>إنشاء فعالية جديدة</h1>
          <p className="text-gray-400 text-sm mt-1">أضف فعالية جديدة للمنصة</p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              <Globe className="w-5 h-5 text-amber-500" />
              المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-gray-700">العنوان (إنجليزي) *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" dir="ltr" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">العنوان (عربي)</Label>
                <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="عنوان الفعالية" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block text-gray-700">الوصف (إنجليزي)</Label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description..." dir="ltr" rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block text-gray-700">الوصف (عربي)</Label>
                <textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} placeholder="وصف الفعالية..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">الفئة *</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-white/20 rounded-lg px-3 py-2 text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">العملة</Label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border border-white/20 rounded-lg px-3 py-2 text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">صورة الغلاف (URL)</Label>
                <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." dir="ltr" />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input type="checkbox" id="featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                <Label htmlFor="featured" className="text-gray-300 cursor-pointer">فعالية مميزة</Label>
              </div>
            </div>
          </div>

          {/* Date & Venue */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              <Calendar className="w-5 h-5 text-amber-500" />
              التاريخ والمكان
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-gray-700">تاريخ البدء *</Label>
                <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} dir="ltr" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">تاريخ الانتهاء *</Label>
                <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} dir="ltr" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">المكان (إنجليزي)</Label>
                <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Venue name" dir="ltr" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">المكان (عربي)</Label>
                <Input value={venueAr} onChange={(e) => setVenueAr(e.target.value)} placeholder="اسم المكان" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">المدينة</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Amman" dir="ltr" />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">الدولة</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Jordan" dir="ltr" />
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                <Ticket className="w-5 h-5 text-amber-500" />
                فئات التذاكر
              </h2>
              <Button onClick={addTicketType} size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                <Plus className="w-4 h-4 ml-1" />
                إضافة فئة
              </Button>
            </div>
            <div className="space-y-4">
              {ticketTypes.map((tt, i) => (
                <div key={i} className="p-4 border-2 border-gray-100 rounded-xl hover:border-amber-200 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">فئة {i + 1}</span>
                    {ticketTypes.length > 1 && (
                      <button onClick={() => removeTicketType(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">الاسم (إنجليزي)</Label>
                      <Input value={tt.name} onChange={(e) => updateTicketType(i, "name", e.target.value)} placeholder="VIP" dir="ltr" className="h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">الاسم (عربي)</Label>
                      <Input value={tt.nameAr} onChange={(e) => updateTicketType(i, "nameAr", e.target.value)} placeholder="VIP" className="h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">السعر</Label>
                      <Input value={tt.price} onChange={(e) => updateTicketType(i, "price", e.target.value)} placeholder="100" type="number" dir="ltr" className="h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">الكمية الإجمالية</Label>
                      <Input value={tt.totalQuantity} onChange={(e) => updateTicketType(i, "totalQuantity", e.target.value)} placeholder="100" type="number" dir="ltr" className="h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">الحد الأقصى/طلب</Label>
                      <Input value={tt.maxPerOrder} onChange={(e) => updateTicketType(i, "maxPerOrder", e.target.value)} placeholder="10" type="number" dir="ltr" className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status & Submit */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <Label className="mb-2 block text-gray-700">حالة الفعالية</Label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-white/20 rounded-lg px-3 py-2 text-white bg-white/5 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/admin/events")} variant="outline" className="border-gray-200">
                  إلغاء
                </Button>
                <Button onClick={handleSubmit} disabled={createEvent.isPending} className="bg-amber-500 hover:bg-amber-600 text-white px-8">
                  {createEvent.isPending ? "جاري الإنشاء..." : "إنشاء الفعالية"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
