"use client";

import React, { useState } from "react";

// أقسام الموقع الأساسية
const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "cars", label: "سيارات" },
  { id: "real_estate", label: "عقارات" },
  { id: "mobiles", label: "جوالات" },
  { id: "solar", label: "طاقة شمسية" },
  { id: "jobs", label: "وظائف" },
  { id: "internet", label: "نت وشبكات" },
  { id: "electronics", label: "الكترونيات" },
];

// أمثلة إعلانات (تجريبية – مثل ملف HTML القديم)
const SAMPLE_ADS = [
  {
    id: 1,
    category: "solar",
    title: "منظومة طاقة شمسية كاملة 5 كيلو",
    price: "1,050 دولار",
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
    city: "صنعاء",
    area: "حدة",
    ago: "منذ 5 أيام",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    category: "ac",
    title: "مكيفات جري سبلت 18 وحدة - حالة ممتازة",
    price: "220,000 ريال يمني",
    city: "صنعاء",
    area: "شارع تعز",
    ago: "منذ 3 أيام",
    image:
      "https://images.pexels.com/photos/3967850/pexels-photo-3967850.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    <main className="min-h-screen bg-[#f5f7fb] text-gray-900" dir="rtl">
      {/* الهيدر + الهيرو الأزرق (مثل ملف HTML) */}
      <header className="bg-[#013a86] text-white pb-10 shadow-lg">
        <div className="container-main">
          {/* الشريط العلوي */}
          <div className="flex items-center justify-between py-4">
            {/* الشعار */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                {/* 👇 تأكد إن ملف الشعار موجود في public باسم logo-souqyemen.png */}
                <img
                  src="/logo-souqyemen.png"
                  alt="شعار سوق اليمن"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold">سوق اليمن</h1>
                <p className="text-xs text-blue-100">
                  بيع وشراء كل شيء في اليمن
                </p>
              </div>
            </div>

            {/* زر إضافة إعلان + واتساب */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 bg-white text-[#013a86] px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-50 transition">
                <span className="text-lg">+</span>
                <span>أضف إعلانك</span>
              </button>

              <a
                href="#whatsapp"
                className="flex items-center gap-2 bg-[#25D366] px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-[#1ebe57] transition"
              >
                <span>تواصل واتساب</span>
              </a>
            </div>
          </div>

          {/* محتوى الهيرو */}
          <div className="grid md:grid-cols-[2fr,1.6fr] gap-8 items-center mt-4">
            {/* النصوص */}
            <div>
              <p className="text-sm text-blue-100 mb-2">مرحبا بك في</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-relaxed">
                منصتك للإعلانات في كل محافظات اليمن
              </h2>
              <p className="text-sm md:text-base text-blue-100 mb-6 max-w-xl leading-relaxed">
                اعرض سيارتك أو عقارك أو منتجاتك بكل سهولة، وخلي العملاء
                يتواصلوا معك مباشرة عبر الواتساب أو الاتصال.
              </p>

              {/* مربع البحث */}
              <div className="bg-white rounded-full flex items-center gap-2 p-1.5 shadow-lg mb-4">
                <button className="bg-[#013a86] text-white py-2 px-5 rounded-full text-sm font-bold">
                  بحث
                </button>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن سيارة، بيت، جوال، طاقة شمسية..."
                  className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-800 placeholder:text-gray-400"
                />
              </div>

              {/* نقاط المميزات */}
              <div className="flex flex-wrap gap-3 text-xs md:text-sm text-blue-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-green-400 text-base">✔</span>
                  <span>بدون عمولة على الإعلانات</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-green-400 text-base">✔</span>
                  <span>تواصل مباشر بين البائع والمشتري</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-green-400 text-base">✔</span>
                  <span>أقسام خاصة للعقارات والطاقة الشمسية</span>
                </div>
              </div>
            </div>

            {/* صورة جانبية */}
            <div className="relative hidden md:block">
              <div className="relative bg-white rounded-3xl p-4 shadow-2xl overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3794355/pexels-photo-3794355.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="سوق اليمن - مثال إعلان"
                  className="rounded-2xl object-cover h-64 w-full"
                />
                <div className="absolute top-3 left-3 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-[#013a86] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>إعلانات حقيقية من السوق اليمني</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* أقسام الموقع */}
      <section className="border-b bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="container-main py-3 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`chip ${
                activeCategory === c.id ? "chip--primary" : "chip--ghost"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* مثال الإعلانات */}
      <section className="container-main my-8" id="sample-ads">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">مثال على إعلان في سوق اليمن</h3>
          <span className="text-xs text-gray-500 hidden sm:block">
            هذه فقط أمثلة تجريبية، قريبًا يتم ربط الموقع بقاعدة بيانات كاملة
            للإعلانات.
          </span>
        </div>

        <div className="ads-grid">
          {filteredAds.map((ad) => (
            <article key={ad.id} className="ad-card">
              <div className="ad-card__image-wrapper">
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="ad-card__image"
                />
              </div>

              <div className="ad-card__body">
                <h4 className="ad-card__title">{ad.title}</h4>
                <div className="ad-card__price">{ad.price}</div>

                <div className="ad-card__meta">
                  <span>{ad.city}</span>
                  <span className="text-gray-400">•</span>
                  <span>{ad.area}</span>
                </div>

                <div className="ad-card__footer">
                  <span className="ad-card__ago">{ad.ago}</span>
                  <button className="ad-card__button">
                    مشاهدة تفاصيل الإعلان
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* مميزات سوق اليمن */}
      <section className="bg-white py-10 border-t border-b border-gray-100">
        <div className="container-main">
          <h3 className="section-title mb-6">ليش تختار سوق اليمن؟</h3>
          <div className="grid md:grid-cols-3 gap-5 text-sm">
            <div className="feature-box">
              <h4>منصة يمنية 100%</h4>
              <p>
                موقع مخصص للسوق اليمني، عملة وأسعار وأقسام تناسب احتياجك في
                اليمن.
              </p>
            </div>
            <div className="feature-box">
              <h4>سهولة التواصل</h4>
              <p>
                تواصل مباشر مع صاحب الإعلان عبر واتساب أو اتصال بدون أي وسيط.
              </p>
            </div>
            <div className="feature-box">
              <h4>تركيز على العقار والطاقة</h4>
              <p>
                أقسام قوية للعقارات، الأراضي، الشقق، وأنظمة الطاقة الشمسية
                والبطاريات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* خطوات إضافة إعلان */}
      <section className="py-10">
        <div className="container-main">
          <h3 className="section-title mb-6">طريقة إضافة إعلان جديد</h3>
          <div className="grid md:grid-cols-3 gap-5 text-sm">
            <div className="step-box">
              <span className="step-box__badge">1</span>
              <h4>سجل دخولك أو أنشئ حساب</h4>
              <p>استخدم بريدك الإلكتروني أو رقم جوالك لإنشاء حساب بسيط.</p>
            </div>
            <div className="step-box">
              <span className="step-box__badge">2</span>
              <h4>أضف تفاصيل الإعلان</h4>
              <p>اختر القسم المناسب، أضف العنوان، السعر، والصور الواضحة.</p>
            </div>
            <div className="step-box">
              <span className="step-box__badge">3</span>
              <h4>انشر وتابع اتصالات العملاء</h4>
              <p>الإعلان يظهر في الموقع، والعملاء يتواصلوا معك مباشرة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* الفووتر */}
      <footer className="bg-[#012a5f] text-blue-100 py-6 mt-10">
        <div className="container-main flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © {new Date().getFullYear()} سوق اليمن - بيع وشراء كل شيء في اليمن
          </p>
          <p>هذه فقط نسخة أولية، وستتم إضافة تسجيل الدخول ولوحة التحكم لاحقًا.</p>
        </div>
      </footer>
    </main>
  );
}
