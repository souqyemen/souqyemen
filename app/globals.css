import "./globals.css";
import Script from 'next/script'; // ✅ إضافة هذا

export const metadata = {
  title: "سوق اليمن | أكبر سوق إلكتروني",
  description: "بيع وشراء العقارات والسيارات في اليمن",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
        />
      </head>
      <body>
        {children}
        
        {/* Leaflet Scripts باستخدام next/script */}
        <Script 
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
