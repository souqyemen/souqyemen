export const metadata = {
  title: "سوق اليمن | بيع وشراء كل شيء",
  description:
    "سوق اليمن - منصة إعلانات لبيع وشراء كل شيء في اليمن: سيارات، عقارات، جوالات، طاقة شمسية، وظائف، ملابس وأكثر. أضف إعلانك مجاناً الآن.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-100 text-slate-900">{children}</body>
    </html>
  );
}
