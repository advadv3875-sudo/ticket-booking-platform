import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "wouter";
import { Star, Mail, Phone, Instagram, Facebook, Linkedin, MessageCircle, Send } from "lucide-react";

const STAT_IMG_EVENTS = "/manus-storage/about-stat-events_f148b979.jpg";
const STAT_IMG_CLIENTS = "/manus-storage/about-stat-clients_07fe94b0.jpg";
const STAT_IMG_YEARS = "/manus-storage/about-stat-years_00933c91.jpg";
const STAT_IMG_COUNTRIES = "/manus-storage/about-stat-countries_8ce9cec7.jpg";

const STATS = [
  { value: "500+", label: "فعالية ناجحة", img: STAT_IMG_EVENTS },
  { value: "50K+", label: "عميل راضٍ", img: STAT_IMG_CLIENTS },
  { value: "15+", label: "سنة خبرة", img: STAT_IMG_YEARS },
  { value: "20+", label: "دولة حول العالم", img: STAT_IMG_COUNTRIES },
];

const VAL_IMG_PROF = "/manus-storage/about-val-professionalism_ecd4b68d.jpg";
const VAL_IMG_INNOV = "/manus-storage/about-val-innovation_e7cf2297.jpg";
const VAL_IMG_TRUST = "/manus-storage/about-val-trust_ba2ea673.jpg";
const VAL_IMG_EXCEL = "/manus-storage/about-val-excellence_5c1e130b.jpg";

const VALUES = [
  { title: "الاحترافية", desc: "نلتزم بأعلى معايير الجودة في كل فعالية ننظمها، من التخطيط حتى التنفيذ.", img: VAL_IMG_PROF },
  { title: "الابتكار", desc: "نستخدم أحدث التقنيات والأساليب الإبداعية لتقديم تجارب فريدة لا تُنسى.", img: VAL_IMG_INNOV },
  { title: "الموثوقية", desc: "نبني علاقات طويلة الأمد مع عملائنا قائمة على الثقة والشفافية التامة.", img: VAL_IMG_TRUST },
  { title: "التميز", desc: "نسعى دائماً لتجاوز توقعات عملائنا وتقديم ما هو أفضل مما يتوقعون.", img: VAL_IMG_EXCEL },
];

const TEAM = [
  {
    name: "مصطفى الجزائري",
    role: "المؤسس والرئيس التنفيذي",
    desc: "خبرة تزيد عن 15 عاماً في تنظيم الفعاليات الدولية والمؤتمرات الكبرى.",
    initials: "MJ",
    color: "from-amber-500 to-amber-700",
  },
  {
    name: "فريق التخطيط",
    role: "إدارة الفعاليات",
    desc: "فريق متخصص من المحترفين في تخطيط وتنفيذ الفعاليات بكل أنواعها.",
    initials: "FT",
    color: "from-indigo-500 to-indigo-700",
  },
  {
    name: "فريق التقنية",
    role: "الحلول الرقمية",
    desc: "خبراء في تطوير منصات الحجز الإلكتروني وأنظمة إدارة الفعاليات.",
    initials: "TT",
    color: "from-emerald-500 to-emerald-700",
  },
];

const MILESTONES = [
  { year: "2009", title: "التأسيس", desc: "تأسيس Expert Plan في عمّان، الأردن بهدف تقديم خدمات تنظيم فعاليات احترافية." },
  { year: "2013", title: "التوسع الإقليمي", desc: "توسيع نطاق الخدمات لتشمل دول الخليج العربي والمنطقة العربية." },
  { year: "2017", title: "المنصة الرقمية", desc: "إطلاق منصة الحجز الإلكتروني الأولى لتسهيل وصول العملاء." },
  { year: "2021", title: "الانتشار العالمي", desc: "تنظيم فعاليات دولية في أكثر من 20 دولة حول العالم." },
  { year: "2024", title: "منصة Expert Plan", desc: "إطلاق المنصة الحديثة بأكثر من 11 بوابة دفع وتجربة حجز متطورة." },
];

export default function AboutPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #111827 100%)" }}
      dir="rtl"
    >
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #d97706, transparent)" }} />
          <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, #4f46e5, transparent)" }} />
        </div>
        <div className="container relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-5 py-2 mb-6">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">منذ عام 2009</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-black mb-6 leading-tight"
            style={{
              fontFamily: "'Noto Kufi Arabic', sans-serif",
              background: "linear-gradient(135deg, #ffffff 0%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            من نحن
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            <strong className="text-amber-400">Expert Plan by MUSTAFA ALJAZAEERI</strong> — المنظمة الأردنية الرائدة في تنظيم الفعاليات والمؤتمرات الدولية. نجمع بين الخبرة العميقة والتقنية الحديثة لنقدم تجارب استثنائية لا تُنسى.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all group"
                style={{ minHeight: "180px" }}
              >
                <img
                  src={stat.img}
                  alt={stat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
                <div className="relative z-10 flex flex-col items-center justify-end h-full p-5 text-center" style={{ minHeight: "180px" }}>
                  <div
                    className="text-3xl font-black text-amber-400 mb-1 drop-shadow-lg"
                    style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white text-sm font-semibold drop-shadow">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl font-black text-white mb-6"
                style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
              >
                قصتنا
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                <p>
                  بدأت رحلة <strong className="text-amber-400">Expert Plan</strong> عام 2009 برؤية واضحة: تقديم خدمات تنظيم فعاليات تجمع بين الاحترافية العالية والإبداع اللامحدود في قلب عمّان، الأردن.
                </p>
                <p>
                  على مدار أكثر من 15 عاماً، نجحنا في تنظيم أكثر من 500 فعالية متنوعة — من المؤتمرات الدولية الكبرى، إلى حفلات الزفاف الفاخرة، والمعارض التجارية، والفعاليات الثقافية والترفيهية.
                </p>
                <p>
                  اليوم، نفخر بخدمة أكثر من 50,000 عميل راضٍ في أكثر من 20 دولة، مع منصة رقمية متطورة تتيح الحجز بأكثر من 11 طريقة دفع آمنة.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-amber-400 font-black text-sm">{m.year}</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex-1">
                    <h3 className="font-bold text-white mb-1">{m.title}</h3>
                    <p className="text-gray-400 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="container">
          <h2
            className="text-4xl font-black text-white text-center mb-12"
            style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          >
            قيمنا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all group"
                style={{ minHeight: "260px" }}
              >
                <img
                  src={v.img}
                  alt={v.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.2) 100%)" }} />
                <div className="relative z-10 flex flex-col justify-end h-full p-6" style={{ minHeight: "260px" }}>
                  <h3
                    className="font-bold text-amber-400 text-lg mb-2 drop-shadow-lg"
                    style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-gray-200 text-sm leading-relaxed drop-shadow">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container">
          <h2
            className="text-4xl font-black text-white text-center mb-12"
            style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
          >
            فريقنا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center hover:border-amber-500/30 transition-all"
              >
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-4 text-white font-black text-xl shadow-lg`}
                >
                  {member.initials}
                </div>
                <h3
                  className="font-bold text-white text-lg mb-1"
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  {member.name}
                </h3>
                <p className="text-amber-400 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl font-black text-white mb-4"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              تابعنا على منصات التواصل الاجتماعي
            </h2>
            <p className="text-gray-400 mb-10">ابقَ على اطلاع بآخر فعالياتنا وأخبارنا</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "Instagram", href: "https://www.instagram.com/expert_plan387?igsh=N3l1czQ4ZjZkeWN1&utm_source=qr", icon: <Instagram className="w-5 h-5" />, color: "from-pink-500 to-rose-500" },
                { label: "Facebook", href: "https://www.facebook.com/share/1DFR63nZJL/?mibextid=wwXIfr", icon: <Facebook className="w-5 h-5" />, color: "from-blue-600 to-blue-700" },
                { label: "Threads", href: "https://www.threads.com/@mustafa_ja387?igshid=NTc4MTIwNjQ2YQ==", icon: <Send className="w-5 h-5" />, color: "from-gray-600 to-gray-700" },
                { label: "TikTok", href: "https://www.tiktok.com/@mustafa_sj7?_r=1&_t=ZS-94S2jxKvdKy", icon: <MessageCircle className="w-5 h-5" />, color: "from-gray-800 to-gray-900" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/expert-plan-a337863b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app", icon: <Linkedin className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
                { label: "Snapchat", href: "https://snapchat.com/t/kHefBkVa", icon: <MessageCircle className="w-5 h-5" />, color: "from-yellow-400 to-yellow-500" },
                { label: "واتسآب (UK)", href: "https://wa.me/447537867459", icon: <MessageCircle className="w-5 h-5" />, color: "from-green-500 to-green-600" },
                { label: "واتسآب (SA)", href: "https://wa.me/966598416557", icon: <MessageCircle className="w-5 h-5" />, color: "from-green-400 to-green-500" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 bg-gradient-to-r ${s.color} text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div
            className="rounded-3xl p-12 text-center"
            style={{ background: "linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(79,70,229,0.15) 100%)", border: "1px solid rgba(217,119,6,0.3)" }}
          >
            <h2
              className="text-4xl font-black text-white mb-4"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              هل أنت مستعد لفعاليتك القادمة؟
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              تواصل معنا اليوم وسنساعدك في تحويل رؤيتك إلى حقيقة مذهلة.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg">
                  استعرض الفعاليات
                </button>
              </Link>
              <a
                href="mailto:maljazaeeri@gmail.com"
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20 flex items-center gap-2 justify-center"
              >
                <Mail className="w-5 h-5" />
                تواصل معنا
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
