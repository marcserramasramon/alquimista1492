"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VistaExtraAr } from "@/components/vistes/VistaExtraAr";
import { VistaFantasmes } from "@/components/vistes/VistaFantasmes";
import { VistaAigua } from "@/components/vistes/VistaAigua";
import { VistaFoc } from "@/components/vistes/VistaFoc";
import { VistaGuiesAnimes } from "@/components/vistes/VistaGuiesAnimes";
import { VistaTerra } from "@/components/vistes/VistaTerra";
import { getExtraAr } from "@/content/public/extres";

/** Extra de realitat augmentada (content/public/extres.ts): no toca el progrés de la partida. */
export default function ExtraArPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const extra = getExtraAr(id);

  useEffect(() => {
    if (!extra) router.replace("/joc");
  }, [extra, router]);

  if (!extra) return null;
  const Vista =
    extra.escena === "fantasmes"
      ? VistaFantasmes
      : extra.escena === "foc"
        ? VistaFoc
        : extra.escena === "guies"
          ? VistaGuiesAnimes
          : extra.escena === "aigua"
            ? VistaAigua
            : extra.escena === "terra"
              ? VistaTerra
              : VistaExtraAr;
  return <Vista extra={extra} onTornar={() => router.push("/joc")} />;
}
