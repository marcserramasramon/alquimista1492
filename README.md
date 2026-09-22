# Els Guardians del Secret de Sentfores

Webapp mòbil per a un escape room exterior a Sentfores (Osona), ambientat el 1472. Els equips busquen les cinc fites elementals repartides pel poble i acaben amb el ritual del Gresol dels Cinc Elements al Pla de Masset. Primera edició: Festa Major, novembre de 2026.

## Posar-la en marxa

```bash
cp .env.local.example .env.local   # i omple els valors
npm install
npm run dev                        # http://localhost:3000
```

Cal aplicar les migracions de `supabase/migrations/` al projecte de Supabase.

- Jugadors: `/` (codi d'equip) o `/e/CODI`
- Màster: `/master` (PIN)

## Documentació

- [CLAUDE.md](./CLAUDE.md) — regles del projecte i estructura
- [docs/historia-nova.md](./docs/historia-nova.md) — la trama
- [docs/fites-nova.md](./docs/fites-nova.md) — les fites i el Gresol
- [docs/app-nova.md](./docs/app-nova.md) — disseny de l'app
