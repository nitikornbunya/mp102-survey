import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { LineLiffProvider } from "@/app/context/LineLiffContext";
import "./globals.css";

const prompt = Prompt({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบรับฟังความคิดเห็น MP102",
  description: "แบบฟอร์มรับฟังความคิดเห็น ช่วงคำถามที่ 1 และช่วงคำถามที่ 2 ตาม 4 ฐาน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.variable} ${prompt.className} antialiased`}>
        <LineLiffProvider>
          {children}
        </LineLiffProvider>
      </body>
    </html>
  );
}
