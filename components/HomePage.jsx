"use client";

import { useState } from "react";
import { Icons } from "./Icons";

const categories = [
  { id: "cars", label: "سيارات", icon: Icons.Car },
  { id: "realestate", label: "عقارات", icon: Icons.Home },
  { id: "mobiles", label: "جوالات", icon: Icons.Phone },
  { id: "solar", label: "طاقة شمسية", icon: Icons.Sun },
  { id: "jobs", label: "وظائف", icon: Icons.Bag },
];

const sampleAds = [
  {
    id: 1,
    title: "مكيفات جري سبيلت 18 وحدة - حالة ممتازة",
    price: "220,000",
    currency: "ريال يمني",
    city: "صنعاء",
    area: "شارع تعز",
    daysAgo: 3,
    image:
      "https://images.pexels.com/photos/3964734/pexels-photo-3964734.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    title: "شقة للإيجار في صنعاء - 4 غرف وصالة",
    price: "250,000",
    currency: "ريال يمني",
    city: "صنعاء",
    area: "حدة",
    daysAgo: 5,
    image:
      "https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    title: "منظومة طاقة شمسية كاملة 5 كيلو",
    price: "1,050",
    currency: "دولار",
    city: "تعز",
    area: "الحوبان",
    daysAgo: 7,
    image:
      "https://images.pexels.com/photos/987544/pexels-photo-987544.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");

  const filteredAds = sampleAds.filter((ad) => {
    const matchesSearch =
      !search ||
      ad.title.toLowerCase().includes(search.toLowerCase()) ||
      ad.city.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* الهيدر العلوي */}
      <header className="bg-primary text-white shadow-md">
        <div className="container-main py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
              <img
                src="/logo-souqyemen.png"
                alt="شعار سوق اليمن"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">سوق اليمن</h1>
              <p className="text-xs text-blue-100">بيع وشراء كل شيء في اليمن</p>
            </div>
          </div>

          <button className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-400 text-primary font-bold shadow-lg hover:bg-amber-300 transition text-sm">
            + أضف إعلانك
          </button>
        </div>
      </header>

      {/* البطل (Hero) */}
      <section className="bg-primary text-white">
        <div className="container-main py-10 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-blue-100">مرحبا بك في</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              منصتك للإعلانات في كل محافظات اليمن
            </h2>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl">
              اعرض سيارتك أو عقارك أو منتجاتك بكل سهولة، وخلي العملاء يتواصلوا معك مباشرة عبر
              الواتساب أو الاتصال.
            </p>
          </div>

          <div className="bg-white rounded-full p-2 flex items-center gap-2 shadow-lg max-w-2xl">
            <input
              type="text"
              className="flex-1 rounded-full px-4 py-2 text-sm text-slate-800 outline-none"
              placeholder="ابحث عن سيارة، بيت، جوال، طاقة شمسية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold">
              بحث
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-blue-100">
            <span>✅ بدون عمولة على الإعلانات</span>
            <span>✅ تواصل مباشر بين البائع والمشتري</span>
            <span>✅ أقسام خاصة للعقارات والسيارات والطاقة الشمسية</span>
          </div>
        </div>
      </section>

      {/* الأقسام */}
      <section className="bg-slate-100 border-b border-slate-200">
        <div className="container-main py-4">
          <h3 className="font-bold mb-3">الأقسام الرئيسية</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCat("all")}
              className={`chip ${activeCat === "all" ? "chip-active" : ""}`}
            >
              الكل
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`chip ${activeCat === cat.id ? "chip-active" : ""}`}
                >
                  <Icon className="w-4 h-4 ms-1" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* أمثلة إعلانات */}
      <main className="container-main py-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-lg">مثال على إعلان في سوق اليمن</h3>
          <p className="text-xs text-slate-500">
            هذه فقط أمثلة تجريبية، قريبا سيتم ربط الموقع بقاعدة بيانات كاملة للإعلانات.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAds.map((ad) => (
            <article key={ad.id} className="ad-card">
              <img src={ad.image} alt={ad.title} className="ad-card-img" />
              <div className="ad-card-body">
                <h4 className="font-bold text-slate-900 line-clamp-2">{ad.title}</h4>
                <div className="flex items-baseline gap-1 text-primary font-extrabold">
                  <span className="text-lg">{ad.price}</span>
                  <span className="text-xs text-slate-600">{ad.currency}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {ad.city} - {ad.area}
                  </span>
                  <span>منذ {ad.daysAgo} أيام</span>
                </div>
                <button className="mt-3 w-full rounded-xl border border-primary text-primary text-sm py-2 font-semibold hover:bg-primary hover:text-white transition">
                  مشاهدة تفاصيل الإعلان
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* الفوتر */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="container-main py-6 text-xs text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} سوق اليمن - جميع الحقوق محفوظة.</p>
          <p>هذا الإصدار تجريبي، وسيتم تطويره ليدعم تسجيل الدخول وإضافة الإعلانات من المستخدمين.</p>
        </div>
      </footer>
    </div>
  );
}
