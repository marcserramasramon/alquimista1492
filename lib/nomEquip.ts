import { z } from "zod";

/** Validació compartida (client i servidor) del nom que l'equip tria. */
export const NomEquipSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "El nom ha de tenir com a mínim 2 caràcters")
    .max(30, "El nom pot tenir com a màxim 30 caràcters"),
});
