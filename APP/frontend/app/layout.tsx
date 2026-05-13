import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Album Pipeline",
  description:
    "从一个念头开始，完成一张可发布的 AI 专辑。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
