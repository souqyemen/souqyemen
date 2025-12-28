// app/layout.jsx
import "./globals.css";

export const metadata = {
  title: "سوق اليمن | بيع وشراء كل شيء في اليمن",
  description:
    "سوق اليمن - منصتك للإعلانات في كل محافظات اليمن، بيع وشراء السيارات والعقارات والطاقة الشمسية والجوالات بسهولة.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-100 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
