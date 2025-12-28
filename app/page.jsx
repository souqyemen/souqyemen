
import Image from "next/image";
import "./globals.css";

const categories = [
  "سيارات",
  "عقارات",
  "جوالات",
  "طاقة شمسية",
  "وظائف",
  "أثاث",
  "ملابس",
  "الكترونيات",
  "نت وشبكات",
  "مواشي",
  "منتجات يمنية",
  "أخرى",
];

export default function HomePage() {
  return (
    <main className="page">
      <header className="header">
        <div className="header-content">
          <div className="logo-wrap">
            <Image
              src="/logo-souqyemen.png"
              alt="شعار سوق اليمن"
              width={56}
              height={56}
              className="logo-image"
              priority
            />
            <div>
              <h1 className="site-title">سوق اليمن</h1>
              <p className="site-subtitle">بيع وشراء كل شيء في اليمن</p>
            </div>
          </div>

          <a href="#add-later" className="add-btn">
            + أضف إعلانك
          </a>
        </div>

        <div className="hero">
          <h2>منصتك للإعلانات في كل محافظات اليمن</h2>
          <p>
            اعرض سيارتك أو عقارك أو منتجاتك بكل سهولة، وخلي العملاء يتواصلوا معك مباشرة
            عبر الواتساب أو الاتصال.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="ابحث عن سيارة، بيت، جوال، طاقة شمسية ..."
            />
            <button>بحث</button>
          </div>
        </div>
      </header>

      <section className="categories">
        <h3>الأقسام الرئيسية</h3>
        <div className="categories-grid">
          {categories.map((cat) => (
            <button key={cat} className="category-card">
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="sample-ad">
        <h3>مثال على إعلان في سوق اليمن</h3>
        <div className="ad-card">
          <div className="ad-image" />
          <div className="ad-info">
            <h4>مكيفات جري سبليت 18 وحدة - حالة ممتازة</h4>
            <p className="price">220,000 ريال يمني</p>
            <p className="meta">صنعاء - شارع تعز | منذ 3 أيام</p>
            <p className="desc">
              مكيفات نظيفة جداً، استخدام بسيط، تبريد ممتاز، مناسبة للبيت
              أو المحل التجاري. التوصيل متاح داخل صنعاء.
            </p>
            <div className="ad-actions">
              <a href="#whatsapp" className="whats">
                تواصل واتساب
              </a>
              <a href="#call" className="call">
                اتصال مباشر
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>سوق اليمن © {new Date().getFullYear()} - جميع الحقوق محفوظة</p>
        <p className="footer-small">
          هذه نسخة تجريبية بسيطة بدون تسجيل دخول أو قاعدة بيانات، مخصصة لعرض
          التصميم فقط. يمكن لاحقاً إضافة نظام إدارة إعلانات كامل.
        </p>
      </footer>
    </main>
  );
}
