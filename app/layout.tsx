import type { Metadata, Viewport } from "next";
import {
  Libre_Caslon_Display,
  EB_Garamond,
  Cinzel,
  IM_Fell_English,
  Lavishly_Yours,
} from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

// Historical theme typography
const libreCalson = Libre_Caslon_Display({
  variable: "--font-libre-caslon",
  weight: "400",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: "600",
  subsets: ["latin"],
});

const imFellEnglish = IM_Fell_English({
  variable: "--font-im-fell",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const lavishlyYours = Lavishly_Yours({
  variable: "--font-lavishly-yours",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Traïdor de la Guixa",
  description:
    "Joc exterior d'escapista amb narrativa del Pacte dels Vigatans (1705)",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Traïdor Guixa",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "og:title": "El Traïdor de la Guixa",
    "og:description":
      "Descobreix el traïdor en aquest escape room exterior a la Guixa",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1D3557",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ca"
      className={`${libreCalson.variable} ${ebGaramond.variable} ${cinzel.variable} ${imFellEnglish.variable} ${lavishlyYours.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-ink">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
