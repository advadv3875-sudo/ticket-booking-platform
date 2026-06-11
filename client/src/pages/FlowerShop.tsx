import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import {
  Flower, Search, ShoppingCart, Star, Heart, Filter,
  Leaf, Sparkles, ChevronRight, Package, Truck, Shield, Phone
} from "lucide-react";
import { toast } from "sonner";

const FLOWER_SHOP_IMG = "/manus-storage/service-flowers_1f4ba96d.jpg";

/* ── Royal Product Images (AI Generated) ── */
const FLOWER_RED_ROSES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-royal-red-roses-GR5e5A8Uo4iXEB46U3ZKEi.png";
const FLOWER_WEDDING = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-wedding-arrangement-hXWfVZDa4aajbn48LMCJFE.png";
const FLOWER_ARTIFICIAL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-artificial-eternal-TrTWWxmQirS37sRmomnfK3.png";
const FLOWER_GIFT = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-gift-chocolate-684zZpNobd4n2iccUZzvNR.png";
const FLOWER_TABLE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-table-arrangement-VR4GvC2ZtwdtXBrMS9jT7M.png";
const FLOWER_WHITE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-white-roses-4YRB8PuFo2DKFCMXYNMHpR.png";

/* ── Feature Cards Images (Royal Luxury AI Generated) ── */
const FEAT_FRESH = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-feat-fresh-fPFzBGeKRdTj2rxV5KUP6V.png";
const FEAT_DELIVERY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-feat-delivery-AskxNsXp99ro6yhgU3P6GG.png";
const FEAT_PACKAGING = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-feat-packaging-2cEBfsYkD7knV6MuJfPBz5.png";
const FEAT_QUALITY = "https://d2xsxph8kpxj0f.cloudfront.net/310519663444865328/GHvM9jHA5PpD8tSaYENMCe/flower-feat-quality-mBLidXYBSvrbAWACSEbugQ.png";

/* ── Category Config ── */
const CATEGORIES = [
  { key: "all", label: "الكل", icon: "🌸" },
  { key: "natural", label: "ورد طبيعي", icon: "🌹" },
  { key: "artificial", label: "زهور صناعية", icon: "💐" },
  { key: "bouquet", label: "باقات", icon: "🌺" },
  { key: "arrangement", label: "تنسيقات", icon: "🌻" },
  { key: "gift", label: "هدايا زهور", icon: "🎁" },
];

/* ── Featured Products (Static showcase until admin adds real ones) ── */
const SHOWCASE_PRODUCTS = [
  {
    id: 1,
    name: "باقة الورد الأحمر الملكي",
    nameEn: "Royal Red Rose Bouquet",
    type: "natural",
    price: 45,
    currency: "JOD",
    rating: 4.9,
    reviews: 128,
    badge: "الأكثر مبيعاً",
    badgeColor: "#FF6B00",
    image: FLOWER_RED_ROSES,
    description: "24 وردة حمراء طازجة مع شريط ذهبي فاخر",
    inStock: true,
  },
  {
    id: 2,
    name: "تنسيق الزفاف الملكي",
    nameEn: "Royal Wedding Arrangement",
    type: "arrangement",
    price: 120,
    currency: "JOD",
    rating: 5.0,
    reviews: 64,
    badge: "حصري",
    badgeColor: "#D4A843",
    image: FLOWER_WEDDING,
    description: "تنسيق زهور فاخر لحفلات الزفاف بالورد الأبيض والوردي",
    inStock: true,
  },
  {
    id: 3,
    name: "باقة الزهور الصناعية الدائمة",
    nameEn: "Eternal Artificial Flower Bouquet",
    type: "artificial",
    price: 35,
    currency: "JOD",
    rating: 4.8,
    reviews: 95,
    badge: "تدوم للأبد",
    badgeColor: "#4A90D9",
    image: FLOWER_ARTIFICIAL,
    description: "زهور صناعية فاخرة لا تذبل، مثالية للديكور الدائم",
    inStock: true,
  },
  {
    id: 4,
    name: "هدية الورد مع الشوكولاتة",
    nameEn: "Rose & Chocolate Gift",
    type: "gift",
    price: 55,
    currency: "JOD",
    rating: 4.7,
    reviews: 82,
    badge: "هدية مميزة",
    badgeColor: "#FF6B00",
    image: FLOWER_GIFT,
    description: "باقة ورد مع صندوق شوكولاتة بلجيكية فاخرة",
    inStock: true,
  },
  {
    id: 5,
    name: "تنسيق الطاولة الفاخر",
    nameEn: "Luxury Table Arrangement",
    type: "arrangement",
    price: 80,
    currency: "JOD",
    rating: 4.9,
    reviews: 47,
    badge: "للمناسبات",
    badgeColor: "#D4A843",
    image: FLOWER_TABLE,
    description: "تنسيق مركزي فاخر للطاولات في المناسبات والحفلات",
    inStock: true,
  },
  {
    id: 6,
    name: "الورد الأبيض الناصع",
    nameEn: "Pure White Roses",
    type: "natural",
    price: 40,
    currency: "JOD",
    rating: 4.8,
    reviews: 73,
    badge: "طازج يومياً",
    badgeColor: "#4A90D9",
    image: FLOWER_WHITE,
    description: "20 وردة بيضاء طازجة مستوردة يومياً",
    inStock: false,
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function FlowerShop() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  /* Fetch real products from DB (falls back to showcase if empty) */
  const { data: dbProducts } = trpc.flowers.list.useQuery(
    selectedCategory === "all" ? undefined : { category: selectedCategory as any }
  );

  const products = (dbProducts && dbProducts.length > 0) ? dbProducts : SHOWCASE_PRODUCTS;

  const filtered = products.filter((p: any) => {
    const matchCat = selectedCategory === "all" || p.type === selectedCategory || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameEn?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAddToCart = (product: any) => {
    setCartCount((c) => c + 1);
    toast.success(`تمت الإضافة: ${product.name}`, { description: "سيتم التواصل معك لإتمام الطلب" });
  };

  const handleOrder = (product: any) => {
    const msg = `مرحباً، أريد طلب: ${product.name} بسعر ${product.price} ${product.currency}`;
    window.open(`https://wa.me/447537867459?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a1628", color: "#f0e8d8" }} dir="rtl">
      <AnnouncementBanner />
      <Navbar />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={FLOWER_SHOP_IMG} alt="متجر الزهور" className="w-full h-full object-cover" style={{ filter: "brightness(0.3)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(10,22,40,0.75) 60%, rgba(10,22,40,0.5) 100%)" }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to top, #0a1628, transparent)" }} />

        <div className="relative z-10 container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)" }}>
            <Flower className="w-4 h-4" style={{ color: "#FF6B00" }} />
            <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>متجر الزهور الملكي</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Cairo', sans-serif" }}>
            <span style={{ color: "#f0e8d8" }}>زهور فاخرة</span>
            <br />
            <span className="text-fire-gradient">بجودة ملكية</span>
          </h1>

          <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "rgba(240,232,216,0.75)", fontFamily: "'Cairo', sans-serif" }}>
            ورد طبيعي طازج يومياً وزهور صناعية فاخرة — باقات مخصصة لكل مناسبة بأيدي خبراء التنسيق
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "#FF6B00" }} />
            <Input
              placeholder="ابحث عن زهور، باقات، هدايا..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 py-6 text-base rounded-2xl"
              style={{
                background: "rgba(10,22,40,0.8)",
                border: "1px solid rgba(255,107,0,0.35)",
                color: "#f0e8d8",
                backdropFilter: "blur(10px)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES STRIP
      ══════════════════════════════════════════ */}
      <section className="py-8" style={{ backgroundColor: "#0d1e35", borderTop: "1px solid rgba(255,107,0,0.15)", borderBottom: "1px solid rgba(255,107,0,0.15)" }}>
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: FEAT_FRESH, title: "طازج يومياً", desc: "مستورد كل يوم" },
              { img: FEAT_DELIVERY, title: "توصيل سريع", desc: "لجميع المناطق" },
              { img: FEAT_PACKAGING, title: "تغليف فاخر", desc: "هدايا مميزة" },
              { img: FEAT_QUALITY, title: "ضمان الجودة", desc: "أو استرداد كامل" },
            ].map((f) => (
              <div key={f.title} className="group relative overflow-hidden rounded-xl cursor-pointer"
                style={{ border: "1px solid rgba(212,175,55,0.3)", minHeight: "140px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                {/* صورة ملكية كاملة */}
                <div className="absolute inset-0">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,12,25,0.95) 0%, rgba(5,12,25,0.5) 50%, rgba(5,12,25,0.1) 100%)" }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to top, rgba(212,175,55,0.3) 0%, transparent 60%)" }} />
                </div>
                {/* خط ذهبي علوي */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
                {/* النص السفلي */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <div className="font-black text-sm" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>{f.title}</div>
                  <div className="text-xs" style={{ color: "rgba(240,232,216,0.7)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES FILTER
      ══════════════════════════════════════════ */}
      <section className="py-10" style={{ backgroundColor: "#0a1628" }}>
        <div className="container">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 ml-2" style={{ color: "rgba(240,232,216,0.6)" }}>
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">تصفية:</span>
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: selectedCategory === cat.key ? "rgba(255,107,0,0.2)" : "rgba(255,107,0,0.06)",
                  border: selectedCategory === cat.key ? "1px solid rgba(255,107,0,0.6)" : "1px solid rgba(255,107,0,0.15)",
                  color: selectedCategory === cat.key ? "#FF6B00" : "rgba(240,232,216,0.7)",
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PRODUCTS GRID
      ══════════════════════════════════════════ */}
      <section className="pb-24" style={{ backgroundColor: "#0a1628" }}>
        <div className="container">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)" }}>
                <Flower className="w-10 h-10" style={{ color: "#FF6B00" }} />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ color: "#f0e8d8" }}>لا توجد منتجات في هذا القسم</h3>
              <p style={{ color: "rgba(240,232,216,0.55)" }}>تواصل معنا لطلب باقة مخصصة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onOrder={handleOrder}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CUSTOM ORDER CTA
      ══════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "#0d1e35", borderTop: "1px solid rgba(255,107,0,0.2)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #FF6B00, transparent)", filter: "blur(60px)" }} />
        <div className="container relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#FF6B00" }} />
            <span className="text-sm font-semibold" style={{ color: "#FF9A3C" }}>طلب مخصص</span>
          </div>
          <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "'Cairo', sans-serif", color: "#f0e8d8" }}>
            لديك طلب <span className="text-fire-gradient">خاص؟</span>
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(240,232,216,0.65)", fontFamily: "'Cairo', sans-serif" }}>
            نصمم باقات مخصصة لأي مناسبة — زفاف، تخرج، أعياد ميلاد، مؤتمرات. تواصل معنا الآن!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => window.open("https://wa.me/447537867459?text=مرحباً، أريد طلب باقة زهور مخصصة", "_blank")}
              size="lg" className="text-white font-bold px-8 py-6 text-lg rounded-xl"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)", boxShadow: "0 4px 25px rgba(255,107,0,0.5)" }}>
              <Phone className="w-5 h-5 ml-2" />
              تواصل عبر واتساب
            </Button>
            <Button
              onClick={() => navigate("/events")}
              variant="outline" size="lg" className="font-bold px-8 py-6 text-lg rounded-xl"
              style={{ borderColor: "rgba(255,107,0,0.4)", color: "#FF9A3C", background: "rgba(255,107,0,0.08)" }}>
              استعرض الفعاليات
              <ChevronRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════════ */
function ProductCard({ product, onAddToCart, onOrder }: { product: any; onAddToCart: (p: any) => void; onOrder: (p: any) => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group rounded-2xl overflow-hidden luxury-card"
      style={{ background: "#0f1e35", border: "1px solid rgba(255,107,0,0.2)" }}>
      <div className="relative h-60 overflow-hidden">
        <img
          src={product.image || product.imageUrl || FLOWER_RED_ROSES}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,22,40,0.85) 0%, transparent 60%)" }} />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ background: product.badgeColor || "#FF6B00" }}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Out of Stock */}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(10,22,40,0.7)" }}>
            <span className="px-4 py-2 rounded-xl font-bold text-white"
              style={{ background: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.5)" }}>
              نفذت الكمية
            </span>
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: "rgba(10,22,40,0.7)", border: "1px solid rgba(255,107,0,0.3)" }}>
          <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-white/70"}`} />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg mb-1" style={{ color: "#f0e8d8", fontFamily: "'Cairo', sans-serif" }}>
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm mb-3 line-clamp-2" style={{ color: "rgba(240,232,216,0.6)", fontFamily: "'Cairo', sans-serif" }}>
            {product.description}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-gray-600"}`} />
            ))}
            <span className="text-xs mr-1" style={{ color: "rgba(240,232,216,0.5)" }}>({product.reviews})</span>
          </div>
        )}

        {/* Price + Actions */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,107,0,0.15)" }}>
          <div>
            <span className="text-xs" style={{ color: "rgba(240,232,216,0.4)" }}>السعر</span>
            <div className="text-xl font-black text-fire-gradient">
              {product.price} {product.currency || "JOD"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddToCart(product)}
              disabled={product.inStock === false}
              className="rounded-xl"
              style={{ borderColor: "rgba(255,107,0,0.35)", color: "#FF9A3C", background: "rgba(255,107,0,0.08)" }}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => onOrder(product)}
              disabled={product.inStock === false}
              className="text-white rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}>
              اطلب الآن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
