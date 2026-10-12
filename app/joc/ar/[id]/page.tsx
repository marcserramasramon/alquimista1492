"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VistaExtraAr } from "@/components/vistes/VistaExtraAr";
import { VistaFantasmes } from "@/components/vistes/VistaFantasmes";
import { VistaFoc } from "@/components/vistes/VistaFoc";
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
  const Vista = extra.escena === "fantasmes" ? VistaFantasmes : extra.escena === "foc" ? VistaFoc : VistaExtraAr;
  return <Vista extra={extra} onTornar={() => router.push("/joc")} />;
}
