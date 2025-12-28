"use client";

import React, { useState } from "react";
import Image from "next/image";

const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "cars", label: "سيارات" },
  { id: "real_estate", label: "عقارات" },
  { id: "mobiles", label: "جوالات" },
  { id: "solar", label: "طاقة شمسية" },
  { id: "jobs", label: "وظائف" },
  { id: "internet", label: "نت وشبكات" },
  { id: "electronics", label: "إلكترونيات" },
];

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
    category: "cars",
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
      {/* الهيدر الأزرق */}
      <header className="bg-[#013a86] text-white pb-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          {/* شريط علوي */}
          <div className="flex items-center justify-between py-4">
            {/* الشعار */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md overflow-hidden">
                <Image
                  src="/logo-souqyemen.png"
                  alt="شعار سوق اليمن"
                  width={40}
                  height={40}
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

            {/* أزرار */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 bg-white text-[#013a86] px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-50 transition">
                <span className="text-lg">+</span>
                <span>أضف إعلانك</span>
              </button>

              <a
                href="#whatsapp"
                className="flex items-center gap-2 bg-[#25D366] px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-[#1ebe57] transition"
              >
                تواصل واتساب
              </a>
            </div>
          </div>

          {/* الهيرو */}
          <div className="grid md:grid-cols-[2fr,1.6fr] gap-8 items-center mt-4">
            {/* النصوص */}
            <div>
              <p className="text-sm text-blue-100 mb-2">مرحباً بك في</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-relaxed">
                منصتك للإعلانات في كل محافظات اليمن
              </h2>
              <p className="text-sm md:text-base text-blue-100 mb-6 max-w-xl leading-relaxed">
                اعرض سيارتك أو عقارك أو منتجاتك بكل سهولة، وخلي العملاء
                يتواصلوا معك مباشرة عبر الواتساب أو الاتصال.
              </p>

              {/* البحث */}
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

              {/* مميزات */}
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
                <Image
                  src="https://images.pexels.com/photos/3794355/pexels-photo-3794355.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="سوق اليمن - مثال إعلان"
                  width={800}
                  height={600}
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

      {/* الأٌقسام */}
      <section className="border-b bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm border transition ${
                  active
                    ? "bg-yellow-400 text-black border-yellow-500 shadow"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* الإعلانات التجريبية */}
      <section className="max-w-6xl mx-auto px-4 my-8" id="sample-ads">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            مثال على إعلان في سوق اليمن
          </h3>
          <span className="text-xs text-gray-500 hidden sm:block">
            هذه فقط أمثلة تجريبية، قريباً يتم ربط الموقع بقاعدة بيانات كاملة
            للإعلانات.
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {filteredAds.map((ad) => (
            <article
              key={ad.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={ad.image}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="p-4 flex flex-col gap-2 flex-1">
                <h4 className="font-semibold text-sm md:text-base line-clamp-2">
                  {ad.title}
                </h4>
                <div className="text-[#0d7a3a] font-bold text-sm md:text-base">
                  {ad.price}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{ad.city}</span>
                  <span>•</span>
                  <span>{ad.area}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{ad.ago}</span>
                  <button className="px-3 py-1 rounded-full border border-gray-200 text-[#013a86] font-semibold hover:bg-blue-50 text-xs">
                    مشاهدة تفاصيل الإعلان
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* مميزات */}
      <section className="bg-white py-10 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            ليش تختار سوق اليمن؟
          </h3>
          <div className="grid md:grid-cols-3 gap-5 text-sm">
            <div className="bg-[#f5f7fb] rounded-xl p-4">
              <h4 className="font-semibold mb-2">منصة يمنية 100%</h4>
              <p className="text-gray-600">
                موقع مخصص للسوق اليمني، بعملات وأسعار وأقسام تناسب احتياجك في
                اليمن.
              </p>
            </div>
            <div className="bg-[#f5f7fb] rounded-xl p-4">
              <h4 className="font-semibold mb-2">سهولة التواصل</h4>
              <p className="text-gray-600">
                تواصل مباشر مع صاحب الإعلان عبر واتساب أو اتصال بدون أي وسيط.
              </p>
            </div>
            <div className="bg-[#f5f7fb] rounded-xl p-4">
              <h4 className="font-semibold mb-2">تركيز على العقار والطاقة</h4>
              <p className="text-gray-600">
                أقسام قوية للعقارات، الأراضي، الشقق، وأنظمة الطاقة الشمسية
                والبطاريات.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* خطوات إضافة إعلان */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            طريقة إضافة إعلان جديد
          </h3>
          <div className="grid md:grid-cols-3 gap-5 text-sm">
            {[
              {
                step: 1,
                title: "سجل دخولك أو أنشئ حساب",
                text: "استخدم بريدك الإلكتروني أو رقم جوالك لإنشاء حساب بسيط.",
              },
              {
                step: 2,
                title: "أضف تفاصيل الإعلان",
                text: "اختر القسم المناسب، أضف العنوان، السعر، والصور الواضحة.",
              },
              {
                step: 3,
                title: "انشر وتابع اتصالات العملاء",
                text: "الإعلان يظهر في الموقع، والعملاء يتواصلوا معك مباشرة.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <span className="absolute -top-3 right-4 w-7 h-7 rounded-full bg-[#013a86] text-white text-xs flex items-center justify-center font-bold">
                  {item.step}
                </span>
                <h4 className="font-semibold mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* فووتر */}
      <footer className="bg-[#012a5f] text-blue-100 py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>
            © {new Date().getFullYear()} سوق اليمن - بيع وشراء كل شيء في اليمن
          </p>
          <p>هذه فقط نسخة أولية، وسيتم إضافة تسجيل الدخول ولوحة التحكم لاحقًا.</p>
        </div>
      </footer>
    </main>
  );
}
