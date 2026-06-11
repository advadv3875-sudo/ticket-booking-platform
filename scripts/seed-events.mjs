/**
 * Seed Script: إدخال الـ 25 فعالية الخيرية الحقيقية
 * Expert Plan by MUSTAFA AL JAZAEERI
 * فندق ماريوت عمان - 30/03/2026 إلى 30/04/2026
 */

import mysql from "mysql2/promise";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const events = [
  { date: "2026-03-30", name: "حفل افتتاح عالمي", nameEn: "Global Opening Ceremony", desc: "أمسية موسيقية خيرية راقية لدعم التعليم، تجمع نخبة من الفنانين والمتبرعين في أجواء استثنائية بفندق ماريوت عمان.", category: "concert", featured: true },
  { date: "2026-03-31", name: "مؤتمر إنساني دولي", nameEn: "International Humanitarian Conference", desc: "يجمع قادة العمل الخيري والمنظمات الإنسانية لمناقشة حلول مبتكرة للتحديات الإنسانية العالمية.", category: "conference", featured: true },
  { date: "2026-04-02", name: "بازار خيري عالمي", nameEn: "Global Charity Bazaar", desc: "معرض منتجات يدوية وحرفية من مختلف الثقافات لدعم الأسر المحتاجة وتمكين المجتمعات.", category: "exhibition", featured: true },
  { date: "2026-04-03", name: "مزاد فني راقٍ", nameEn: "Premium Art Auction", desc: "مزاد حصري لبيع لوحات فنانين عالميين بارزين، وتوجيه العائدات لصالح مشاريع الرعاية الصحية.", category: "cultural", featured: true },
  { date: "2026-04-05", name: "أمسية ثقافية عربية", nameEn: "Arab Cultural Evening", desc: "عرض تراثي وثقافي يحتفي بالهوية العربية الأصيلة، وعائداته تدعم اللاجئين وذويهم.", category: "cultural", featured: true },
  { date: "2026-04-06", name: "ماراثون عالمي للسلام", nameEn: "World Peace Marathon", desc: "فعالية رياضية تجمع المتطوعين من حول العالم تحت شعار الرياضة والعطاء في آنٍ واحد.", category: "sports", featured: false },
  { date: "2026-04-08", name: "حفل عشاء فاخر", nameEn: "Luxury Charity Gala Dinner", desc: "عشاء فاخر يجمع كبار الرعاة والمتبرعين في أجواء راقية لدعم المبادرات الطبية والإنسانية.", category: "corporate", featured: false },
  { date: "2026-04-09", name: "ملتقى شباب الخير", nameEn: "Youth Charity Forum", desc: "ورش عمل تفاعلية للشباب لتعزيز ثقافة التطوع والعمل الإنساني وبناء قادة المستقبل.", category: "conference", featured: false },
  { date: "2026-04-11", name: "أمسية شعرية خيرية", nameEn: "Charity Poetry Evening", desc: "أمسية أدبية راقية يشارك فيها شعراء من مختلف أنحاء العالم لدعم مشاريع التعليم.", category: "cultural", featured: false },
  { date: "2026-04-12", name: "مؤتمر المرأة والإنسانية", nameEn: "Women & Humanity Conference", desc: "مؤتمر متخصص يناقش دور المرأة في العمل الخيري ودعم قضاياها على الصعيد الإنساني.", category: "conference", featured: false },
  { date: "2026-04-14", name: "معرض صور إنساني", nameEn: "Humanitarian Photo Exhibition", desc: "معرض بصري يوثق قصص نجاح العمل الخيري وأثره الإيجابي على المجتمعات حول العالم.", category: "exhibition", featured: false },
  { date: "2026-04-15", name: "أمسية موسيقية كلاسيكية", nameEn: "Classical Music Evening", desc: "حفل موسيقي كلاسيكي راقٍ يضم نخبة من الموسيقيين لدعم مشاريع الصحة النفسية.", category: "concert", featured: false },
  { date: "2026-04-17", name: "منتدى الابتكار الخيري", nameEn: "Charity Innovation Forum", desc: "منتدى متخصص يستعرض الحلول التقنية والرقمية المبتكرة لدعم وتطوير العمل الإنساني.", category: "conference", featured: false },
  { date: "2026-04-18", name: "أمسية طعام عالمية", nameEn: "Global Food Evening", desc: "تجربة طهي عالمية فريدة تجمع مطابخ متنوعة من كل أنحاء العالم لدعم مشاريع الأمن الغذائي.", category: "corporate", featured: false },
  { date: "2026-04-20", name: "مؤتمر التعليم للجميع", nameEn: "Education for All Conference", desc: "مؤتمر دولي يناقش استراتيجيات دعم وتوسيع مبادرات تعليم الأطفال في المناطق المحرومة.", category: "conference", featured: false },
  { date: "2026-04-21", name: "أمسية سينمائية خيرية", nameEn: "Charity Film Evening", desc: "عرض أفلام وثائقية إنسانية مؤثرة لصالح دعم اللاجئين والمهجّرين حول العالم.", category: "cultural", featured: false },
  { date: "2026-04-23", name: "مهرجان الفنون الشعبية", nameEn: "Folk Arts Festival", desc: "مهرجان ثقافي متنوع يحتفي بالفنون الشعبية لدعم التراث الثقافي والمجتمعات المحلية.", category: "cultural", featured: false },
  { date: "2026-04-24", name: "أمسية جاز خيرية", nameEn: "Charity Jazz Evening", desc: "أمسية موسيقية جاز راقية يؤديها نخبة من الموسيقيين العالميين لدعم مبادرات الشباب.", category: "concert", featured: false },
  { date: "2026-04-26", name: "مؤتمر الصحة العالمية", nameEn: "Global Health Conference", desc: "مؤتمر طبي دولي يناقش أحدث المستجدات الصحية ويدعم مشاريع المستشفيات والمراكز الطبية.", category: "conference", featured: false },
  { date: "2026-04-27", name: "أمسية تكنولوجية خيرية", nameEn: "Tech for Good Evening", desc: "فعالية تقنية تستعرض أحدث الابتكارات الرقمية في خدمة العمل الإنساني والتنمية المستدامة.", category: "conference", featured: false },
  { date: "2026-04-28", name: "بازار الكتب الخيري", nameEn: "Charity Book Bazaar", desc: "معرض كتب متنوع يضم إصدارات نادرة وحصرية، وعائداته تدعم مشاريع التعليم ومحو الأمية.", category: "exhibition", featured: false },
  { date: "2026-04-29", name: "أمسية أوبرا عالمية", nameEn: "World Opera Evening", desc: "عرض أوبرالي عالمي استثنائي يجمع أبرز الأصوات الأوبرالية لدعم مشاريع مكافحة الفقر.", category: "concert", featured: false },
  { date: "2026-04-30", name: "مؤتمر ختامي عالمي", nameEn: "Global Closing Conference", desc: "مؤتمر ختامي يستعرض حصيلة التبرعات وأثرها الإنساني ويرسم خارطة طريق للمستقبل.", category: "conference", featured: false },
  { date: "2026-04-30", name: "أمسية شكر للرعاة", nameEn: "Sponsors Appreciation Evening", desc: "حفل تكريمي راقٍ لتكريم الشركاء الاستراتيجيين والداعمين الذين أسهموا في نجاح البرنامج.", category: "corporate", featured: false },
  { date: "2026-04-30", name: "الحفل الختامي الكبير", nameEn: "Grand Closing Ceremony", desc: "احتفال عالمي كبير يجمع كل المشاركين والمتبرعين والرعاة في ختام مشرّف لبرنامج خيري استثنائي.", category: "concert", featured: false },
];

// Cover images per category
const images = {
  concert: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  conference: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80",
  exhibition: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80",
  cultural: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80",
  sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
  corporate: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
  other: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
};

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log("✅ Connected to database");

  // Check if events already exist
  const [existing] = await conn.execute("SELECT COUNT(*) as cnt FROM events WHERE organizerId = 1");
  if (existing[0].cnt > 0) {
    console.log(`⚠️  Found ${existing[0].cnt} existing events. Clearing them first...`);
    await conn.execute("DELETE FROM ticket_types WHERE eventId IN (SELECT id FROM events WHERE organizerId = 1)");
    await conn.execute("DELETE FROM events WHERE organizerId = 1");
    console.log("✅ Cleared existing events");
  }

  let inserted = 0;
  for (const ev of events) {
    const slug = `${ev.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${nanoid(6)}`;
    const eventDate = new Date(`${ev.date}T17:00:00.000Z`); // 8pm Amman time (UTC+3)
    const endDate = new Date(`${ev.date}T22:00:00.000Z`);   // 1am next day
    const coverImg = images[ev.category] || images.other;

    const [result] = await conn.execute(
      `INSERT INTO events (organizerId, title, titleAr, slug, description, descriptionAr, category, status, coverImage, venue, venueAr, city, country, startDate, endDate, currency, isFeatured, totalCapacity, soldCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        1,                          // organizerId (admin)
        ev.nameEn,                  // title (English)
        ev.name,                    // titleAr (Arabic)
        slug,
        ev.desc,                    // description
        ev.desc,                    // descriptionAr
        ev.category,
        "published",
        coverImg,
        "Marriott Hotel Amman",     // venue (English)
        "فندق ماريوت عمان",          // venueAr
        "Amman",
        "Jordan",
        eventDate,
        endDate,
        "JOD",
        ev.featured ? 1 : 0,
        500,
        0,
      ]
    );

    const eventId = result.insertId;

    // VIP ticket
    await conn.execute(
      `INSERT INTO ticket_types (eventId, name, nameAr, description, descriptionAr, price, currency, totalQuantity, soldQuantity, heldQuantity, maxPerOrder, isActive, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [eventId, "VIP", "VIP", "Premium front-row seat with exclusive reception service", "مقعد مميز في الصف الأول مع خدمة استقبال حصرية", "350.00", "JOD", 50, 0, 0, 4, 1, 1]
    );
    // Standard ticket
    await conn.execute(
      `INSERT INTO ticket_types (eventId, name, nameAr, description, descriptionAr, price, currency, totalQuantity, soldQuantity, heldQuantity, maxPerOrder, isActive, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [eventId, "Standard", "عادي", "General admission with all standard event benefits", "دخول عام مع جميع مزايا الفعالية الأساسية", "250.00", "JOD", 400, 0, 0, 6, 1, 2]
    );
    // Student ticket
    await conn.execute(
      `INSERT INTO ticket_types (eventId, name, nameAr, description, descriptionAr, price, currency, totalQuantity, soldQuantity, heldQuantity, maxPerOrder, isActive, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [eventId, "Student", "طلابي", "Student discount ticket - valid university ID required", "تذكرة مخفضة للطلاب - يشترط إبراز الهوية الجامعية", "150.00", "JOD", 50, 0, 0, 2, 1, 3]
    );

    inserted++;
    console.log(`✅ [${inserted}/25] ${ev.name} (${ev.date}) → ID: ${eventId}`);
  }

  await conn.end();
  console.log(`\n🎉 تم إدخال ${inserted} فعالية بنجاح!`);
  console.log("📍 الموقع: فندق ماريوت عمان");
  console.log("🎫 التذاكر: VIP 350 JOD | عادي 250 JOD | طلابي 150 JOD");
  console.log("💺 المقاعد: 500 لكل فعالية (50 VIP + 400 عادي + 50 طلابي)");
  console.log("🌍 العملات: JOD / EUR / USD");
}

main().catch(err => { console.error("❌ Error:", err.message); process.exit(1); });
