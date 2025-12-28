// components/HomePage.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

// الأقسام الأساسية
const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "cars", label: "سيارات" },
  { id: "real_estate", label: "عقارات" },
  { id: "mobiles", label: "جوالات" },
  { id: "solar", label: "طاقة شمسية" },
  { id: "electronics", label: "الكترونيات" },
  { id: "internet", label: "نت وشبكات" },
  { id: "jobs", label: "وظائف" },
];

// أمثلة إعلانات تجريبية
const SAMPLE_ADS = [
  {
    id: 1,
    category: "solar",
    title: "منظومة طاقة شمسية كاملة 5 كيلو",
    price: "1,050 دولار",
    priceYER: "1,008,000 ريـال يمني",
    priceSAR: "2,400 رس",
    city: "تعز",
    area: "الحوبان",
    ago: "منذ 7 أيام",
    image:
      "https://images.pexels.com/photos/9875441/pexels-photo-9875441.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    category: "real_estate",
    title: "شقة للإيجار في صنعاء - 4 غرف وصالة",
    price: "250,000 ريال يمني",
    priceYER: "250,000 ريـال يمني",
    priceSAR: "630 رس",
    city: "صنعاء",
    area: "حدة",
    ago: "منذ 5 أيام",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    category: "cars",
    title: "سيارة صالون بحالة ممتازة",
    price: "8,500 دولار",
    priceYER: "7,000,000 ريـال يمني تقريباً",
    priceSAR: "32,000 رس",
    city: "صنعاء",
    area: "شارع تعز",
    ago: "منذ 3 أيام",
    image:
      "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredAds = SAMPLE_ADS.filter((ad) => {
    const matchCat = activeCategory === "all" || ad.category === activeCategory;
    const matchSearch =
      !search ||
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.city.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-slate-100" dir="rtl">
      {/* ===== الهيدر + الهيرو الأزرق ===== */}
      <header className="bg-gradient-to-l from-[#0251c9] to-[#012f7a] text-white pb-5 shadow-lg">
        <div className="container-main pt-4">
          {/* الشريط العلوي */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* الشعار + نص */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                {/* تأكد أن الصورة موجودة في public/logo-souqyemen.png */}
                <Image
                  src="/logo-souqyemen.png"
                  alt="شعار سوق اليمن"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div className="leading-tight">
                <p className="text-[13px] text-blue-100">بيع وشراء كل شيء في اليمن</p>
                <h1 className="text-xl font-extrabold tracking-tight">
                  سوق اليمن
                </h1>
              </div>
            </div>

            {/* أزرار علويّة بسيطة */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition">
                🔔
              </button>
              <button className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition">
                🌙
              </button>
              <button className="inline-flex items-center rounded-full bg-amber-400 px-4 py-1.5 text-xs sm:text-sm font-bold text-slate-900 shadow hover:bg-amber-300 transition">
                + أضف إعلانك
              </button>
            </div>
          </div>

          {/* مربع البحث */}
          <div className="bg-white/95 rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 shadow-lg mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث في الإعلانات… سيارة، عقار، طاقة شمسية، جوال ..."
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 px-2"
            />
            <button className="bg-[#0251c9] text-white rounded-xl px-4 py-2 text-xs sm:text-sm font-bold">
              بحث
            </button>
          </div>

          {/* مميزات سريعة تحت البحث */}
          <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs text-blue-100 mb-2">
            <span className="feature-pill">
              <span className="dot" /> بدون عمولة على الإعلانات
            </span>
            <span className="feature-pill">
              <span className="dot" /> تواصل مباشر بين البائع والمشتري
            </span>
            <span className="feature-pill">
              <span className="dot" /> أقسام خاصة للعقارات والطاقة الشمسية
            </span>
          </div>
        </div>
      </header>

      {/* ===== الأقسام (أيقونات) ===== */}
      <section className="bg-white border-b shadow-sm">
        <div className="container-main py-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-pill ${
                activeCategory === cat.id ? "category-pill--active" : ""
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== كروت الإعلانات التجريبية ===== */}
      <section className="container-main py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title text-base sm:text-lg">
            مثال على إعلان في سوق اليمن
          </h2>
          <span className="text-[11px] sm:text-xs text-gray-500">
            هذه فقط أمثلة تجريبية، قريباً يتم ربط الموقع بقاعدة بيانات حقيقية.
          </span>
        </div>

        <div className="ads-grid">
          {filteredAds.map((ad) => (
            <article key={ad.id} className="ad-card">
              <div className="relative h-44 sm:h-52 w-full overflow-hidden rounded-2xl">
                <Image
                  src={ad.image}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="badge-icon">⭐</span>
                  <span className="badge-icon">👁</span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/55 text-white text-[11px] px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="inline-block w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    📍
                  </span>
                  <span>
                    {ad.city} - {ad.area}
                  </span>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="ad-title">{ad.title}</h3>

                <div className="mt-1 text-xs text-gray-500">
                  <span className="font-semibold text-[#0251c9] text-sm">
                    {ad.priceSAR}
                  </span>{" "}
                  <span className="mx-1 text-gray-400">|</span>
                  <span>{ad.price}</span>
                </div>

                <div className="mt-1 text-[11px] text-gray-400">
                  {ad.priceYER}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{ad.ago}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-400" /> 0 مشاهدة
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="btn-secondary">اتصال 📞</button>
                  <button className="btn-whatsapp">واتساب 💬</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== فووتر بسيط ===== */}
      <footer className="bg-[#021a46] text-blue-100 mt-6 py-4 text-[11px] sm:text-xs">
        <div className="container-main flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} سوق اليمن – بيع وشراء كل شيء في اليمن.
          </p>
          <p>هذه نسخة تجريبية، وسيتم إضافة تسجيل الدخول ولوحة التحكم لاحقاً.</p>
        </div>
      </footer>
    </main>
  );
}
