import type { Metadata, Viewport } from "next";
import { Inknut_Antiqua, Source_Sans_3, Fira_Sans } from "next/font/google";
import "./globals.css";

const inknutAntiqua = Inknut_Antiqua({
  variable: "--font-inknut-antiqua",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const sourceSansPro = Source_Sans_3({
  variable: "--font-source-sans-pro",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  weight: ["400", "500", "600", "700"],
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ca"
      className={`${inknutAntiqua.variable} ${sourceSansPro.variable} ${firaSans.variable}`}
    >
      <body className="bg-parchment text-ink antialiased">{children}</body>
    </html>
  );
}
