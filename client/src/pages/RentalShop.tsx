import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sofa, Lightbulb, Tent, Flower2, Tv, UtensilsCrossed,
  Star, ChevronRight, Package, Truck, Shield, Phone,
  Search, ShoppingCart, X, Plus, Minus, Calendar,
  MapPin, CheckCircle, Loader2, Crown, Sparkles, ArrowLeft,
  SlidersHorizontal, ArrowUpDown, ChevronDown, Filter, RotateCcw
} from "lucide-react";
import { toast } from "sonner";

/* ── CDN Images ── */
const HERO_IMG = "/manus-storage/rental-hero_e1b38250.jpg";
const CHAIRS_IMG = "/manus-storage/rental-chairs_e0180494.jpg";
const LIGHTING_IMG = "/manus-storage/rental-lighting_f37e67cc.jpg";
const TENTS_IMG = "/manus-storage/rental-tents_74ba7c8d.jpg";
const DECOR_IMG = "/manus-storage/rental-decor_612c15ce.jpg";
const AUDIOVISUAL_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-audiovisual-7X8cFi9UCrk8XvgSC8Nrmc.png";
const CATERING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-catering-8MGQXCoXvY3RquDTWEpoAt.png";

/* ── Stats & Features Royal Images ── */
const STAT_INVENTORY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-stat-inventory-XfEvum6hWHfGjykj7AWSRr.png";
const STAT_DELIVERY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-stat-delivery-oT6oJotVQkw6pbMurTQXL9.png";
const STAT_SUPPORT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-stat-support-AKHXHTBLxYoHGJN3sLmZXC.png";
const STAT_RATING = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-stat-rating-BziNypf3WzzPGTzqos5KMT.png";
const FEAT_QUALITY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-feat-quality-6NY7sdpwXmXjbonwzHJH5S.png";
const FEAT_DELIVERY_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-feat-delivery-LNsK4ykUXGACo2XZbt4rfo.png";
const FEAT_GUARANTEE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-feat-guarantee-PpkiPzZrGJZMobrFdpshRj.png";
const FEAT_DECOR = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-feat-decor-P2RdfBAVfy4xQi6nFpvKfC.png";
const FEAT_FLEXIBLE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-feat-flexible-B8SpkoPEE2xXoG4eRKNVPA.png";
const FEAT_SUPPORT24 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/rental-feat-support24-F3DwWipy3yXGsa7jDhq7kK.png";

/* ── Category Config ── */
const CATEGORIES = [
  { key: "all",         label: "الكل",           icon: <Crown className="w-4 h-4" />,         img: HERO_IMG },
  { key: "furniture",   label: "أثاث وكراسي",     icon: <Sofa className="w-4 h-4" />,          img: CHAIRS_IMG },
  { key: "lighting",    label: "إضاءة",           icon: <Lightbulb className="w-4 h-4" />,     img: LIGHTING_IMG },
  { key: "tents",       label: "خيام وقاعات",     icon: <Tent className="w-4 h-4" />,          img: TENTS_IMG },
  { key: "decor",       label: "ديكور وتزيين",    icon: <Flower2 className="w-4 h-4" />,       img: DECOR_IMG },
  { key: "audio_visual",label: "صوت وصورة",       icon: <Tv className="w-4 h-4" />,            img: AUDIOVISUAL_IMG },
  { key: "catering",    label: "تقديم طعام",      icon: <UtensilsCrossed className="w-4 h-4" />, img: CATERING_IMG },
  { key: "other",       label: "أخرى",            icon: <Package className="w-4 h-4" />,       img: HERO_IMG },
];

/* ── Demo items (shown when DB is empty) ── */
const DEMO_ITEMS = [
  {
    id: 1, nameAr: "كراسي شيفاري ذهبية", name: "Gold Chiavari Chairs",
    descriptionAr: "كراسي شيفاري ذهبية فاخرة مثالية للأعراس والمناسبات الراقية",
    category: "furniture", pricePerDay: "5.00", depositAmount: "20.00",
    stockQuantity: 200, coverImage: CHAIRS_IMG, isFeatured: true,
    deliveryIncluded: false, setupIncluded: false,
    features: ["ذهبي لامع", "حمل حتى 150 كغ", "متوفر بكميات كبيرة"],
  },
  {
    id: 2, nameAr: "ثريا كريستال ملكية", name: "Royal Crystal Chandelier",
    descriptionAr: "ثريا كريستال ملكية فاخرة تضيف لمسة من الفخامة لأي مناسبة",
    category: "lighting", pricePerDay: "85.00", depositAmount: "200.00",
    stockQuantity: 10, coverImage: LIGHTING_IMG, isFeatured: true,
    deliveryIncluded: true, setupIncluded: true,
    features: ["كريستال أصلي", "يشمل التركيب", "مناسب للقاعات الكبيرة"],
  },
  {
    id: 3, nameAr: "خيمة ستريتش بيضاء", name: "White Stretch Tent",
    descriptionAr: "خيمة ستريتش بيضاء أنيقة تتسع لـ 200 شخص مع إضاءة داخلية",
    category: "tents", pricePerDay: "350.00", depositAmount: "500.00",
    stockQuantity: 5, coverImage: TENTS_IMG, isFeatured: true,
    deliveryIncluded: true, setupIncluded: true,
    features: ["تتسع لـ 200 شخص", "مقاومة للرياح", "يشمل التركيب والفك"],
  },
  {
    id: 4, nameAr: "جدار زهور ملكي", name: "Royal Flower Wall",
    descriptionAr: "جدار زهور ملكي فاخر مثالي لتصوير العروسين وخلفيات المناسبات",
    category: "decor", pricePerDay: "120.00", depositAmount: "150.00",
    stockQuantity: 8, coverImage: DECOR_IMG, isFeatured: true,
    deliveryIncluded: true, setupIncluded: true,
    features: ["زهور طبيعية وصناعية", "2×2 متر", "يشمل الإضاءة"],
  },
  {
    id: 5, nameAr: "نظام صوت احترافي", name: "Professional Sound System",
    descriptionAr: "نظام صوت احترافي كامل مع مكبرات ومكسر وميكروفونات لاسلكية",
    category: "audio_visual", pricePerDay: "200.00", depositAmount: "300.00",
    stockQuantity: 6, coverImage: AUDIOVISUAL_IMG, isFeatured: false,
    deliveryIncluded: true, setupIncluded: true,
    features: ["مكبرات JBL", "ميكروفونات لاسلكية", "مكسر احترافي"],
  },
  {
    id: 6, nameAr: "طاولات بوفيه فاخرة", name: "Luxury Buffet Tables",
    descriptionAr: "طاولات بوفيه فاخرة بغطاء أبيض مع تنسيق زهوري للمناسبات",
    category: "catering", pricePerDay: "25.00", depositAmount: "50.00",
    stockQuantity: 50, coverImage: CATERING_IMG, isFeatured: false,
    deliveryIncluded: false, setupIncluded: false,
    features: ["طول 180 سم", "غطاء أبيض فاخر", "متوفر بكميات"],
  },
];

type CartItem = { id: number; nameAr: string; pricePerDay: string; quantity: number; coverImage?: string | null };

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function RentalShop() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", eventType: "", address: "", notes: "" });

  const { data: dbItems } = trpc.rentals.listItems.useQuery({ category: activeCategory as any, search });
  const createOrder = trpc.rentals.createOrder.useMutation();

  // Use DB items if available, otherwise show demo items
  const items = useMemo(() => {
    if (dbItems && dbItems.length > 0) return dbItems;
    const filtered = DEMO_ITEMS.filter(item =>
      (activeCategory === "all" || item.category === activeCategory) &&
      (!search || item.nameAr.includes(search) || item.name.toLowerCase().includes(search.toLowerCase()))
    );
    return filtered;
  }, [dbItems, activeCategory, search]);

  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [startDate, endDate]);

  const cartTotal = useMemo(() =>
    cart.reduce((sum, item) => sum + Number(item.pricePerDay) * item.quantity * rentalDays, 0),
    [cart, rentalDays]
  );

  function addToCart(item: typeof DEMO_ITEMS[0] | any) {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, nameAr: item.nameAr, pricePerDay: item.pricePerDay, quantity: 1, coverImage: item.coverImage }];
    });
    toast.success(`تمت إضافة "${item.nameAr}" إلى السلة`);
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(c => c.id !== id));
  }

  function updateQty(id: number, delta: number) {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(1, c.quantity + delta) } : c));
  }

  async function handleSubmitOrder() {
    if (!form.name || !form.email || !form.phone || !startDate || !endDate) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createOrder.mutateAsync({
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        eventType: form.eventType,
        eventAddress: form.address,
        startDate,
        endDate,
        notes: form.notes,
        items: cart.map(c => ({ rentalItemId: c.id, quantity: c.quantity })),
      });
      setOrderSuccess(result.orderNumber);
      setCart([]);
      setShowOrderForm(false);
    } catch {
      // Fallback: WhatsApp
      const msg = encodeURIComponent(
        `*طلب تأجير جديد*\n\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالبريد: ${form.email}\n\nالمنتجات:\n${cart.map(c => `- ${c.nameAr} × ${c.quantity}`).join("\n")}\n\nمن: ${startDate}\nإلى: ${endDate}\nالمجموع: ${cartTotal.toFixed(2)} JOD`
      );
      window.open(`https://wa.me/447537867459?text=${msg}`, "_blank");
      toast.success("سيتم التواصل معك عبر واتساب لتأكيد الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--navy-950)" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="تأجير لوازم المناسبات" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.7) 50%, rgba(255,107,0,0.15) 100%)" }} />
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: "var(--fire-500)" }} />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: "var(--fire-400)" }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border" style={{ background: "rgba(255,107,0,0.1)", borderColor: "rgba(255,107,0,0.3)" }}>
            <Crown className="w-4 h-4" style={{ color: "var(--fire-400)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--fire-400)" }}>خدمة تأجير لوازم المناسبات الملكية</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "'Cairo', sans-serif", color: "white" }}>
            اجعل مناسبتك
            <br />
            <span className="text-fire-gradient">لا تُنسى</span>
          </h1>

          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            أجّر أفخم لوازم المناسبات من كراسي وخيام وإضاءة وديكور بأسعار تنافسية مع خدمة توصيل وتركيب احترافية
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="fire-btn text-white font-bold px-8 py-4 text-lg rounded-xl"
              onClick={() => document.getElementById("rental-catalog")?.scrollIntoView({ behavior: "smooth" })}>
              <Package className="w-5 h-5 ml-2" />
              استعرض الكتالوج
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg rounded-xl font-bold"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "white", background: "rgba(255,255,255,0.05)" }}
              onClick={() => window.open("https://wa.me/962790759982", "_blank")}>
              <Phone className="w-5 h-5 ml-2" />
              استشارة مجانية
            </Button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 border-y" style={{ borderColor: "rgba(212,175,55,0.2)", background: "rgba(5,12,25,0.8)" }}>
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "500+", label: "قطعة للتأجير", img: STAT_INVENTORY },
              { value: "100%", label: "توصيل وتركيب", img: STAT_DELIVERY },
              { value: "24/7", label: "دعم فني", img: STAT_SUPPORT },
              { value: "5★", label: "تقييم العملاء", img: STAT_RATING },
            ].map((stat) => (
              <div key={stat.label} className="group relative overflow-hidden rounded-2xl"
                style={{ minHeight: "160px", border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
                {/* صورة ملكية */}
                <div className="absolute inset-0">
                  <img src={stat.img} alt={stat.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,12,25,0.97) 0%, rgba(5,12,25,0.6) 50%, rgba(5,12,25,0.15) 100%)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to top, rgba(212,175,55,0.25) 0%, transparent 60%)" }} />
                </div>
                {/* خط ذهبي */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
                {/* النص */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center z-10">
                  <div className="text-3xl font-black mb-1" style={{ color: "#D4AF37", textShadow: "0 2px 8px rgba(0,0,0,0.9)", fontFamily: "'Cairo', sans-serif" }}>{stat.value}</div>
                  <div className="text-xs font-semibold" style={{ color: "rgba(240,232,216,0.8)" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="rental-catalog" className="py-16 px-4">
        <div className="container max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4" style={{ color: "white", fontFamily: "'Cairo', sans-serif" }}>
              كتالوج <span className="text-fire-gradient">التأجير</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>اختر من مجموعتنا الواسعة من لوازم المناسبات الفاخرة</p>
          </div>

          {/* Search + Cart Button */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "rgba(255,255,255,0.4)" }} />
              <Input
                placeholder="ابحث عن لوازم المناسبات..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pr-10 rounded-xl border"
                style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,107,0,0.2)", color: "white" }}
              />
            </div>
            {cart.length > 0 && (
              <Button className="fire-btn text-white font-bold px-6 rounded-xl relative"
                onClick={() => setShowCart(true)}>
                <ShoppingCart className="w-5 h-5 ml-2" />
                السلة
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background: "var(--fire-500)", color: "white" }}>
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              </Button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all text-sm border ${activeCategory === cat.key ? "text-white border-transparent" : "border-opacity-20"}`}
                style={activeCategory === cat.key
                  ? { background: "var(--fire-500)", borderColor: "var(--fire-500)" }
                  : { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,107,0,0.2)", color: "rgba(255,255,255,0.7)" }
                }>
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "var(--fire-400)" }} />
              <p style={{ color: "rgba(255,255,255,0.5)" }}>لا توجد عناصر في هذه الفئة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: any) => (
                <div key={item.id} className="luxury-card rounded-2xl overflow-hidden group"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,107,0,0.12)" }}>

                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.coverImage || HERO_IMG}
                      alt={item.nameAr}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.8) 0%, transparent 60%)" }} />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {item.isFeatured && (
                        <Badge className="text-xs font-bold" style={{ background: "var(--fire-500)", color: "white" }}>
                          <Star className="w-3 h-3 ml-1" /> مميز
                        </Badge>
                      )}
                      {item.deliveryIncluded && (
                        <Badge className="text-xs" style={{ background: "rgba(34,197,94,0.9)", color: "white" }}>
                          <Truck className="w-3 h-3 ml-1" /> توصيل مجاني
                        </Badge>
                      )}
                    </div>

                    {/* Price overlay */}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-2xl font-black" style={{ color: "var(--fire-400)" }}>
                        {Number(item.pricePerDay).toFixed(0)} JOD
                      </span>
                      <span className="text-xs mr-1" style={{ color: "rgba(255,255,255,0.6)" }}>/يوم</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-2" style={{ color: "white" }}>{item.nameAr}</h3>
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {item.descriptionAr || item.description}
                    </p>

                    {/* Features */}
                    {item.features && item.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(item.features as string[]).slice(0, 3).map((f: string) => (
                          <span key={f} className="text-xs px-2 py-1 rounded-full"
                            style={{ background: "rgba(255,107,0,0.1)", color: "var(--fire-400)", border: "1px solid rgba(255,107,0,0.2)" }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        متوفر: {item.stockQuantity} قطعة
                        {item.setupIncluded && <span className="mr-2">• يشمل التركيب</span>}
                      </div>
                      <Button size="sm" className="fire-btn text-white font-bold rounded-xl"
                        onClick={() => addToCart(item)}>
                        <Plus className="w-4 h-4 ml-1" />
                        أضف للسلة
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORY SHOWCASE ── */}
      <section className="py-16 px-4" style={{ background: "rgba(255,107,0,0.03)" }}>
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: "white", fontFamily: "'Cairo', sans-serif" }}>
              تشكيلتنا <span className="text-fire-gradient">الكاملة</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "أثاث وكراسي", img: CHAIRS_IMG, count: "200+ قطعة" },
              { label: "إضاءة احترافية", img: LIGHTING_IMG, count: "50+ نوع" },
              { label: "خيام وقاعات", img: TENTS_IMG, count: "10+ خيمة" },
              { label: "ديكور وتزيين", img: DECOR_IMG, count: "100+ عنصر" },
            ].map(cat => (
              <div key={cat.label} className="relative rounded-2xl overflow-hidden h-48 cursor-pointer group"
                onClick={() => setActiveCategory(cat.label === "أثاث وكراسي" ? "furniture" : cat.label === "إضاءة احترافية" ? "lighting" : cat.label === "خيام وقاعات" ? "tents" : "decor")}>
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.9) 0%, rgba(10,22,40,0.3) 100%)" }} />
                <div className="absolute bottom-4 right-4">
                  <div className="font-bold text-white">{cat.label}</div>
                  <div className="text-sm" style={{ color: "var(--fire-400)" }}>{cat.count}</div>
                </div>
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-6 h-6 rotate-180" style={{ color: "var(--fire-400)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3" style={{ color: "white", fontFamily: "'Cairo', sans-serif" }}>
              لماذا <span className="text-fire-gradient">Expert Plan</span>؟
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { img: FEAT_QUALITY, title: "جودة ملكية", desc: "جميع قطعنا من أرقى الماركات العالمية بصيانة دورية مستمرة" },
              { img: FEAT_DELIVERY_IMG, title: "توصيل وتركيب", desc: "فريق متخصص يوصل ويركب ويفك جميع اللوازم في الوقت المحدد" },
              { img: FEAT_GUARANTEE, title: "ضمان كامل", desc: "نضمن سلامة جميع المعدات وتأمينها طوال فترة الإيجار" },
              { img: FEAT_DECOR, title: "تنسيق احترافي", desc: "فريق تنسيق ديكور متخصص لتحويل مناسبتك إلى تحفة فنية" },
              { img: FEAT_FLEXIBLE, title: "مرونة في الحجز", desc: "احجز من يوم واحد حتى أسابيع مع إمكانية التعديل والإلغاء" },
              { img: FEAT_SUPPORT24, title: "دعم 24/7", desc: "فريق دعم متاح على مدار الساعة لضمان نجاح مناسبتك" },
            ].map(feature => (
              <div key={feature.title} className="group relative overflow-hidden rounded-2xl"
                style={{ minHeight: "220px", border: "1px solid rgba(212,175,55,0.25)", boxShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>
                {/* صورة ملكية كاملة */}
                <div className="absolute inset-0">
                  <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,12,25,0.97) 0%, rgba(5,12,25,0.55) 55%, rgba(5,12,25,0.1) 100%)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to top, rgba(212,175,55,0.2) 0%, transparent 60%)" }} />
                </div>
                {/* خط ذهبي علوي */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
                {/* النص السفلي */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-center">
                  <h3 className="font-black text-lg mb-2" style={{ color: "#D4AF37", fontFamily: "'Cairo', sans-serif", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: "rgba(240,232,216,0.75)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 px-4 text-center" style={{ background: "linear-gradient(135deg, rgba(255,107,0,0.08) 0%, rgba(10,22,40,0.5) 100%)" }}>
        <div className="container max-w-3xl mx-auto">
          <Crown className="w-16 h-16 mx-auto mb-6" style={{ color: "var(--fire-400)" }} />
          <h2 className="text-4xl font-black mb-4" style={{ color: "white", fontFamily: "'Cairo', sans-serif" }}>
            جاهز لتحويل مناسبتك إلى <span className="text-fire-gradient">تجربة ملكية</span>؟
          </h2>
          <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.65)" }}>
            تواصل معنا الآن للحصول على عرض سعر مجاني ومخصص لمناسبتك
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="fire-btn text-white font-bold px-10 py-4 text-lg rounded-xl"
onClick={() => window.open("https://wa.me/447537867459", "_blank")}>
              <Phone className="w-4 h-4" />
              تواصل عبر واتساب
            </Button>
            {cart.length > 0 && (
              <Button size="lg" variant="outline" className="px-10 py-4 text-lg rounded-xl font-bold"
                style={{ borderColor: "rgba(255,107,0,0.4)", color: "var(--fire-400)", background: "rgba(255,107,0,0.05)" }}
                onClick={() => setShowCart(true)}>
                <ShoppingCart className="w-5 h-5 ml-2" />
                إتمام الطلب ({cart.reduce((s, c) => s + c.quantity, 0)} عناصر)
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── CART DRAWER ── */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative mr-auto w-full max-w-md h-full flex flex-col shadow-2xl"
            style={{ background: "var(--navy-900)", borderLeft: "1px solid rgba(255,107,0,0.2)" }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(255,107,0,0.15)" }}>
              <h3 className="text-xl font-bold" style={{ color: "white" }}>
                <ShoppingCart className="inline w-5 h-5 ml-2" style={{ color: "var(--fire-400)" }} />
                سلة التأجير
              </h3>
              <button onClick={() => setShowCart(false)} style={{ color: "rgba(255,255,255,0.5)" }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Date Selection */}
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)" }}>
                <p className="text-sm font-semibold mb-3" style={{ color: "var(--fire-400)" }}>
                  <Calendar className="inline w-4 h-4 ml-1" />
                  تاريخ الإيجار
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.6)" }}>من</Label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="text-sm" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,107,0,0.3)", color: "white" }} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.6)" }}>إلى</Label>
                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="text-sm" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,107,0,0.3)", color: "white" }} />
                  </div>
                </div>
                {rentalDays > 0 && startDate && endDate && (
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                    مدة الإيجار: <span style={{ color: "var(--fire-400)" }}>{rentalDays} يوم</span>
                  </p>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "var(--fire-400)" }} />
                  <p style={{ color: "rgba(255,255,255,0.4)" }}>السلة فارغة</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,107,0,0.1)" }}>
                    {item.coverImage && (
                      <img src={item.coverImage} alt={item.nameAr} className="w-14 h-14 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "white" }}>{item.nameAr}</p>
                      <p className="text-xs" style={{ color: "var(--fire-400)" }}>
                        {Number(item.pricePerDay).toFixed(0)} JOD × {item.quantity} × {rentalDays} يوم
                        = {(Number(item.pricePerDay) * item.quantity * rentalDays).toFixed(2)} JOD
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,107,0,0.15)", color: "var(--fire-400)" }}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold" style={{ color: "white" }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(255,107,0,0.15)", color: "var(--fire-400)" }}>
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center mr-1"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t" style={{ borderColor: "rgba(255,107,0,0.15)" }}>
                <div className="flex justify-between mb-4">
                  <span style={{ color: "rgba(255,255,255,0.7)" }}>المجموع التقديري:</span>
                  <span className="text-xl font-black" style={{ color: "var(--fire-400)" }}>
                    {cartTotal.toFixed(2)} JOD
                  </span>
                </div>
                <Button className="w-full fire-btn text-white font-bold py-3 rounded-xl text-base"
                  onClick={() => { setShowCart(false); setShowOrderForm(true); }}>
                  <ChevronRight className="w-5 h-5 ml-2 rotate-180" />
                  إتمام الطلب
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORDER FORM MODAL ── */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowOrderForm(false)} />
          <div className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--navy-900)", border: "1px solid rgba(255,107,0,0.25)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: "white" }}>
                <Crown className="inline w-5 h-5 ml-2" style={{ color: "var(--fire-400)" }} />
                تفاصيل طلب التأجير
              </h3>
              <button onClick={() => setShowOrderForm(false)} style={{ color: "rgba(255,255,255,0.5)" }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "الاسم الكامل *", key: "name", type: "text", placeholder: "أدخل اسمك الكامل" },
                { label: "البريد الإلكتروني *", key: "email", type: "email", placeholder: "example@email.com" },
                { label: "رقم الهاتف *", key: "phone", type: "tel", placeholder: "+962 79 xxx xxxx" },
                { label: "نوع المناسبة", key: "eventType", type: "text", placeholder: "زفاف، مؤتمر، عيد ميلاد..." },
                { label: "عنوان المناسبة", key: "address", type: "text", placeholder: "المدينة، المنطقة، العنوان التفصيلي" },
              ].map(field => (
                <div key={field.key}>
                  <Label className="text-sm mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>{field.label}</Label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="rounded-xl"
                    style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,107,0,0.2)", color: "white" }}
                  />
                </div>
              ))}
              <div>
                <Label className="text-sm mb-1.5 block" style={{ color: "rgba(255,255,255,0.7)" }}>ملاحظات إضافية</Label>
                <Textarea
                  placeholder="أي طلبات أو ملاحظات خاصة..."
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="rounded-xl resize-none"
                  rows={3}
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,107,0,0.2)", color: "white" }}
                />
              </div>

              {/* Order Summary */}
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.15)" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--fire-400)" }}>ملخص الطلب</p>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{item.nameAr} × {item.quantity}</span>
                    <span style={{ color: "white" }}>{(Number(item.pricePerDay) * item.quantity * rentalDays).toFixed(2)} JOD</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2" style={{ borderColor: "rgba(255,107,0,0.2)" }}>
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>المجموع</span>
                  <span style={{ color: "var(--fire-400)" }}>{cartTotal.toFixed(2)} JOD</span>
                </div>
              </div>

              <Button className="w-full fire-btn text-white font-bold py-3 rounded-xl text-base"
                onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <CheckCircle className="w-5 h-5 ml-2" />}
                {submitting ? "جاري إرسال الطلب..." : "إرسال طلب التأجير"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER SUCCESS ── */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl p-8 text-center shadow-2xl"
            style={{ background: "var(--navy-900)", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: "#22c55e" }} />
            <h3 className="text-2xl font-black mb-2" style={{ color: "white" }}>تم استلام طلبك!</h3>
            <p className="mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>رقم طلبك هو:</p>
            <div className="text-3xl font-black mb-6 p-3 rounded-xl" style={{ color: "var(--fire-400)", background: "rgba(255,107,0,0.1)" }}>
              {orderSuccess}
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
              سيتواصل معك فريقنا خلال ساعات لتأكيد الطلب وترتيب التوصيل
            </p>
            <Button className="fire-btn text-white font-bold px-8 rounded-xl"
              onClick={() => { setOrderSuccess(null); navigate("/"); }}>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
