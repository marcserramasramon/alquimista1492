"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VistaMasterLogin } from "@/components/vistes/VistaMasterLogin";

export default function MasterLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviant, setEnviant] = useState(false);

  async function entrar() {
    setEnviant(true);
    setError(null);
    try {
      const res = await fetch("/api/master/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "PIN incorrecte");
        return;
      }
      router.push("/master");
    } finally {
      setEnviant(false);
    }
  }

  return <VistaMasterLogin pin={pin} error={error} enviant={enviant} onPinChange={setPin} onSubmit={entrar} />;
}
