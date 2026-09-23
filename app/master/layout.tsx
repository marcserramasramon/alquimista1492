import type { Metadata, Viewport } from "next";

// El màster té la seva pròpia app instal·lable (manifest amb scope /master),
// separada de la dels equips.
export const metadata: Metadata = {
  title: "Màster · Guardians de Sentfores",
  manifest: "/manifest-master.json",
  icons: {
    icon: "/icons/icon-master-192.png",
    apple: "/icons/icon-master-apple.png",
  },
  appleWebApp: {
    capable: true,
    title: "Màster",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b1511",
};

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
