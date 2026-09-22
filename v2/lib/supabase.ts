import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cap client de v2 parla directament amb Supabase des del navegador.
 * Aquest client (service role) només s'utilitza dins d'API routes.
 */
export function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Falten les variables d'entorn de Supabase (v2)");
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
