import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Calendar, MapPin, Search, Filter, Star, Ticket } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "الكل" },
  { value: "conference", label: "مؤتمرات" },
  { value: "exhibition", label: "معارض" },
  { value: "wedding", label: "زفاف" },
  { value: "concert", label: "حفلات" },
  { value: "corporate", label: "مؤسسي" },
  { value: "cultural", label: "ثقافي" },
  { value: "sports", label: "رياضي" },
  { value: "other", label: "أخرى" },
];

const CATEGORY_COLORS: Record<string, string> = {
  conference: "bg-blue-100 text-blue-700", exhibition: "bg-purple-100 text-purple-700",
  wedding: "bg-pink-100 text-pink-700", concert: "bg-orange-100 text-orange-700",
  corporate: "bg-gray-100 text-gray-700", cultural: "bg-teal-100 text-teal-700",
  sports: "bg-green-100 text-green-700", other: "bg-amber-100 text-amber-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  conference: "مؤتمر", exhibition: "معرض", wedding: "زفاف",
  concert: "حفل", corporate: "مؤسسي", cultural: "ثقافي",
  sports: "رياضي", other: "أخرى",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-JO", { year: "numeric", month: "long", day: "numeric" });
}

export default function EventsPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");

  const { data: events, isLoading } = trpc.events.list.useQuery({
    category: category === "all" ? undefined : category,
    search: search || undefined,
    limit: 24,
  });

  const handleSearch = () => setSearch(searchInput);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #111827 100%)' }} dir="rtl">
      <AnnouncementBanner />
      <Navbar />

      {/* Header */}
      <div className="bg-gray-950 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent" />
        <div className="container relative text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
            الفعاليات والمناسبات
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
            اكتشف أفخم الفعاليات واحجز تذكرتك بكل سهولة
          </p>
          {/* Search */}
          <div className="max-w-xl mx-auto flex gap-2">
            <Input
              placeholder="ابحث عن فعالية..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-right"
            />
            <Button onClick={handleSearch} className="bg-amber-500 hover:bg-amber-600 text-white px-6">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/10 sticky top-20 z-40">
        <div className="container py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat.value
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-white/5 text-gray-400 hover:bg-amber-500/20 hover:text-amber-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container py-12" style={{ background: 'transparent' }}>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/10 animate-pulse h-72" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <>
            <p className="text-gray-400 text-sm mb-6">{events.length} فعالية</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-amber-500/40 cursor-pointer"
                  onClick={() => navigate(`/events/${event.slug}`)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.coverImage || "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/events-fallback-VYXKeUYy5PQikieuXABwAb.png"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {event.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500 text-white border-0 text-xs">
                          <Star className="w-3 h-3 ml-1 fill-white" />مميز
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className={`${CATEGORY_COLORS[event.category] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}>
                        {CATEGORY_LABELS[event.category] ?? event.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors text-sm" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                      {event.titleAr || event.title}
                    </h3>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{event.venueAr || event.venue}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-amber-400 font-bold text-sm">{event.currency}</span>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3 rounded-lg">
                        احجز
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-300 mb-2" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
              لا توجد فعاليات
            </h3>
            <p className="text-gray-400 mb-6">لم يتم العثور على فعاليات تطابق بحثك</p>
            {search && (
              <Button onClick={() => { setSearch(""); setSearchInput(""); }} variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-500/20 bg-transparent">
                مسح البحث
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
