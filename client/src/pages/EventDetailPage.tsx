import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Users, Ticket, ArrowRight, Star, CheckCircle } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  conference: "مؤتمر", exhibition: "معرض", wedding: "زفاف",
  concert: "حفل", corporate: "مؤسسي", cultural: "ثقافي",
  sports: "رياضي", other: "أخرى",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit" });
}

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const { data: event, isLoading: eventLoading } = trpc.events.getBySlug.useQuery({ slug: params.slug });
  const { data: ticketTypes, isLoading: ttLoading } = trpc.events.getTicketTypes.useQuery(
    { eventId: event?.id ?? 0 },
    { enabled: !!event?.id }
  );

  if (eventLoading) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <Navbar />
        <div className="container pt-32 pb-16">
          <div className="animate-pulse space-y-6">
            <div className="h-80 bg-white/10 rounded-2xl" />
            <div className="h-8 bg-white/10 rounded w-2/3" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
        <div className="text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">الفعالية غير موجودة</h2>
          <Button onClick={() => navigate("/events")} className="bg-amber-500 text-white mt-4">
            العودة للفعاليات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }} dir="rtl">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={event.coverImage || "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/events-fallback-VYXKeUYy5PQikieuXABwAb.png"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container pb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className="bg-amber-500 text-white border-0">
              {CATEGORY_LABELS[event.category] ?? event.category}
            </Badge>
            {event.isFeatured && (
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                <Star className="w-3 h-3 ml-1 fill-white" />مميز
              </Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            {event.titleAr || event.title}
          </h1>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="font-bold text-gray-900 text-xl mb-5" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                تفاصيل الفعالية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">تاريخ البدء</p>
                    <p className="font-semibold text-gray-800 text-sm">{formatDate(event.startDate)}</p>
                    <p className="text-gray-400 text-xs">{formatTime(event.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">تاريخ الانتهاء</p>
                    <p className="font-semibold text-gray-800 text-sm">{formatDate(event.endDate)}</p>
                    <p className="text-gray-400 text-xs">{formatTime(event.endDate)}</p>
                  </div>
                </div>
                {event.venue && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">المكان</p>
                      <p className="font-semibold text-gray-800 text-sm">{event.venueAr || event.venue}</p>
                      <p className="text-gray-400 text-xs">{event.city}, {event.country}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {(event.descriptionAr || event.description) && (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h2 className="font-bold text-gray-900 text-xl mb-4" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  عن الفعالية
                </h2>
                <p className="text-gray-400 leading-relaxed" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                  {event.descriptionAr || event.description}
                </p>
              </div>
            )}
          </div>

          {/* Ticket Types Sidebar */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-28">
              <h2 className="font-bold text-gray-900 text-xl mb-5 flex items-center gap-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                <Ticket className="w-5 h-5 text-amber-500" />
                التذاكر المتاحة
              </h2>

              {ttLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : ticketTypes && ticketTypes.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {ticketTypes.map((tt) => {
                    const available = tt.totalQuantity - tt.soldQuantity - tt.heldQuantity;
                    const isSoldOut = available <= 0;
                    return (
                      <div
                        key={tt.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSoldOut ? "border-white/10 bg-white/5 opacity-60" : "border-amber-500/30 bg-amber-500/10"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                              {tt.nameAr || tt.name}
                            </h3>
                            {tt.description && <p className="text-gray-400 text-xs mt-0.5">{tt.description}</p>}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-600">{parseFloat(String(tt.price)).toFixed(0)}</div>
                            <div className="text-xs text-gray-400">{tt.currency}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          {isSoldOut ? (
                            <span className="text-red-500 text-xs font-medium">نفدت التذاكر</span>
                          ) : (
                            <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {available} متاح
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm mb-4">
                  <Ticket className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  لا توجد تذاكر متاحة
                </div>
              )}

              <Button
                onClick={() => navigate(`/booking/${event.id}`)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-6 rounded-xl text-base font-bold shadow-lg hover:shadow-amber-200 transition-all"
                disabled={!ticketTypes || ticketTypes.length === 0}
              >
                <Ticket className="w-5 h-5 ml-2" />
                احجز تذكرتك الآن
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                دفع آمن ومشفر
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
