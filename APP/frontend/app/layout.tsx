import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_SC,
  JetBrains_Mono,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import Toast from "./components/Toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-noto-sans-sc",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
});

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
    <html lang="zh" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html: `
              (function() {
                var theme = localStorage.getItem('album-pipeline-theme') || 'warm-vinyl';
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
        }}
      />
      <body
        className={`${inter.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable}`}
      >
        {children}
        <Toast />
      </body>
    </html>
  );
}
