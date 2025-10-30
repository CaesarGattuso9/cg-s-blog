import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-sc",
});

export const metadata: Metadata = {
  title: "我的博客 - 记录生活与技术",
  description: "一个现代化的个人博客，分享技术文章、生活随记和摄影作品",
  keywords: ["博客", "技术", "摄影", "生活"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&family=Long+Cang&family=Ma+Shan+Zheng&family=ZCOOL+KuaiLe&family=Zhi+Mang+Xing&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} ${notoSansSC.variable}`}>{children}</body>
    </html>
  );
}

