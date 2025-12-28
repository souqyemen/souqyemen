// app/components/HomePage.jsx - الإصدار المحسن
"use client";

import { useState } from 'react';
import { FaCar, FaHome, FaMobileAlt, FaSolarPanel, FaBriefcase, FaBook, FaLaptop, FaSearch, FaWhatsapp, FaPhoneAlt, FaStore, FaShieldAlt, FaDatabase, FaMapMarkerAlt, FaTag, FaClock, FaCheck, FaStar } from 'react-icons/fa';
import './HomePage.css';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'الكل', icon: <FaStore />, color: '#0d3b66' },
    { id: 'cars', name: 'سيارات', icon: <FaCar />, color: '#1a5f7a' },
    { id: 'properties', name: 'عقارات', icon: <FaHome />, color: '#168aad' },
    { id: 'mobiles', name: 'جوالات', icon: <FaMobileAlt />, color: '#34a0a4' },
    { id: 'solar', name: 'طاقة شمسية', icon: <FaSolarPanel />, color: '#52b69a' },
    { id: 'jobs', name: 'وظائف', icon: <FaBriefcase />, color: '#76c893' },
    { id: 'books', name: 'كتب ومستلزمات', icon: <FaBook />, color: '#99d98c' },
    { id: 'electronics', name: 'الكترونيات', icon: <FaLaptop />, color: '#b5e48c' }
  ];

  const features = [
    { id: 1, text: 'بدون عمولة على الإعلانات' },
    { id: 2, text: 'تواصل مباشر بين البائع والمشتري' },
    { id: 3, text: 'أقسام خاصة للعقارات والطاقة الشمسية' }
  ];

  const exampleAds = [
    {
      id: 1,
      title: 'تويوتا كامري 2022',
      description: 'تويوتا كامري فول اوبشن - موديل 2022 - لون أبيض - كم 30,000 فقط - بحالة الوكالة',
      price: '35,000,000 ريال',
      location: 'صنعاء',
      date: 'منذ يومين',
      category: 'سيارات',
      imageColor: '#0d3b66'
    },
    {
      id: 2,
      title: 'شقة للبيع في حي التحرير',
      description: 'شقة 3 غرف نوم - 2 حمام - صالة - مطبخ - مكيفة - طابق ثالث - مساحة 150م',
      price: '65,000,000 ريال',
      location: 'عدن',
      date: 'منذ 5 أيام',
      category: 'عقارات',
      imageColor: '#1a5f7a'
    },
    {
      id: 3,
      title: 'نظام طاقة شمسية 5 كيلو',
      description: 'نظام طاقة شمسية متكامل 5 كيلو وات، يشمل الألواح، الانفرتر، البطاريات وجميع الملحقات',
      price: '5,500,000 ريال',
      location: 'تعز',
      date: 'منذ 3 أيام',
      category: 'طاقة شمسية',
      imageColor: '#52b69a'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('بحث عن:', searchTerm);
    // هنا يمكن إضافة منطق البحث
  };

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    // هنا يمكن إضافة منطق تصفية الإعلانات حسب القسم
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="logo-container">
              <div className="logo-main">
                <FaStore className="logo-icon" />
                <h1 className="logo-text">سوق اليمن</h1>
              </div>
              <p className="tagline-main">بيع وشراء كل شيء في اليمن</p>
            </div>
            
            <div className="hero-welcome">
              <h2 className="welcome-title">
                مرحباً بك في <span>منصتك للإعلانات</span>
              </h2>
              <p className="welcome-subtitle">
                في كل محافظات اليمن
              </p>
              <p className="welcome-description">
                تعرض سيارات أو عقارات أو منتجاتك بكل سهولة، والعملاء يتواصلوا معك مباشرة عبر الواتساب أو الاتصال.
              </p>
            </div>

            {/* Search Section */}
            <div className="search-section-hero">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    className="search-input-hero"
                    placeholder="أبحث عن سيارة، بيت، جوال، طاقة شمسية..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="search-btn-hero">
                    بحث
                  </button>
                </form>
              </div>
            </div>

            {/* Features */}
            <div className="features-grid">
              {features.map((feature) => (
                <div key={feature.id} className="feature-item">
                  <FaCheck className="feature-icon" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2 className="section-title">تصفح الأقسام</h2>
          <p className="section-subtitle">اختِر القسم المناسب لعرض إعلانك أو البحث عن ما تحتاجه</p>
        </div>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              style={{ '--category-color': category.color }}
            >
              <div className="category-icon-wrapper" style={{ backgroundColor: `${category.color}15` }}>
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
              </div>
              <h3 className="category-name">{category.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Example Ads Section */}
      <section className="ads-section">
        <div className="section-header">
          <h2 className="section-title">إعلانات مميزة</h2>
          <p className="section-subtitle">أحدث الإعلانات المضافة في سوق اليمن</p>
        </div>

        <div className="ads-grid">
          {exampleAds.map((ad) => (
            <div key={ad.id} className="ad-card">
              <div className="ad-image" style={{ backgroundColor: ad.imageColor }}>
                <div className="ad-category-tag">{ad.category}</div>
                <div className="ad-favorite">
                  <FaStar />
                </div>
              </div>
              <div className="ad-content">
                <h3 className="ad-title">{ad.title}</h3>
                <p className="ad-description">{ad.description}</p>
                
                <div className="ad-meta">
                  <div className="ad-location">
                    <FaMapMarkerAlt />
                    <span>{ad.location}</span>
                  </div>
                  <div className="ad-date">
                    <FaClock />
                    <span>{ad.date}</span>
                  </div>
                </div>
                
                <div className="ad-footer">
                  <div className="ad-price">{ad.price}</div>
                  <div className="ad-actions">
                    <a href={`https://wa.me/967123456789?text=أرغب في الاستفسار عن ${ad.title}`} className="whatsapp-btn">
                      <FaWhatsapp />
                      <span>تواصل</span>
                    </a>
                    <a href="tel:+967123456789" className="call-btn">
                      <FaPhoneAlt />
                      <span>اتصال</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">ابدأ بيع وشراء كل شيء في اليمن الآن</h2>
          <p className="cta-description">
            انضم إلى آلاف البائعين والمشترين في أكبر منصة إعلانات يمنية
          </p>
          <div className="cta-buttons">
            <a href="#add-ad" className="cta-btn-primary">
              أضف إعلانك مجاناً
            </a>
            <a href="#browse" className="cta-btn-secondary">
              تصفح الإعلانات
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-number">10,000+</div>
          <div className="stat-label">إعلان نشط</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50,000+</div>
          <div className="stat-label">مستخدم نشط</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24+</div>
          <div className="stat-label">محافظة يمنية</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">100%</div>
          <div className="stat-label">مجاني للإعلانات</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <FaStore />
            <span>سوق اليمن</span>
          </div>
          <p className="footer-tagline">منصتك للإعلانات في كل محافظات اليمن</p>
          <div className="footer-contact">
            <p>للتواصل والدعم:</p>
            <div className="contact-links">
              <a href="https://wa.me/967123456789" className="footer-contact-link">
                <FaWhatsapp /> واتساب
              </a>
              <a href="tel:+967123456789" className="footer-contact-link">
                <FaPhoneAlt /> اتصال
              </a>
            </div>
          </div>
          <div className="footer-copyright">
            © 2024 سوق اليمن - جميع الحقوق محفوظة
          </div>
        </div>
      </footer>
    </div>
  );
}
