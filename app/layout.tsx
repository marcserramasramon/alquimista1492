import type { Metadata, Viewport } from "next";
import { Grenze_Gotisch, Alegreya_Sans, Alegreya_Sans_SC } from "next/font/google";
import "./globals.css";

// Títols: gòtica llegible (1472). Text: humanista amb arrel cal·ligràfica.
const grenzeGotisch = Grenze_Gotisch({
  variable: "--font-grenze-gotisch",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});

const alegreyaSans = Alegreya_Sans({
  variable: "--font-alegreya-sans",
  weight: ["400", "500", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const alegreyaSansSC = Alegreya_Sans_SC({
  variable: "--font-alegreya-sans-sc",
  weight: ["700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Els Guardians del Secret de Sentfores",
  description: "Escape room exterior a Sentfores–La Guixa",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fbf4e4",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ca"
      className={`${grenzeGotisch.variable} ${alegreyaSans.variable} ${alegreyaSansSC.variable}`}
    >
      <body className="text-ink antialiased">{children}</body>
    </html>
  );
}
