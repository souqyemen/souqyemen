
export const metadata = {
  title: "سوق اليمن | بيع وشراء كل شيء في اليمن",
  description:
    "سوق اليمن - منصة إعلانات لبيع وشراء السيارات والعقارات والجوالات والطاقة الشمسية والوظائف في جميع محافظات اليمن.",
  openGraph: {
    title: "سوق اليمن | بيع وشراء كل شيء في اليمن",
    description:
      "منصتك الأولى للإعلانات المبوبة في اليمن. أضف إعلانك مجاناً وشاهد طلبات الشراء بسهولة.",
    type: "website",
    locale: "ar_YE",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="body-root">
        {children}
      </body>
    </html>
  );
}
