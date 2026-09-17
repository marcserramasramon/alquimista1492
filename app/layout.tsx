import type { Metadata } from "next";
import {
  Libre_Caslon_Display,
  EB_Garamond,
  Cinzel,
  IM_Fell_English,
} from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "El Traïdor de la Guixa",
  description:
    "Joc exterior d'escapista amb narrativa del Pacte dels Vigatans (1705)",
  other: {
    "og:title": "El Traïdor de la Guixa",
    "og:description":
      "Descobreix el traïdor en aquest escape room exterior a la Guixa",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ca"
      className={`${libreCalson.variable} ${ebGaramond.variable} ${cinzel.variable} ${imFellEnglish.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-parchment text-ink">
        {children}
      </body>
    </html>
  );
}
