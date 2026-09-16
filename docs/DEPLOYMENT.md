# Guía de Desplegament

Com desplegar a Vercel i Supabase per a staging i producció.

## 🎯 Arquitectura

- **Dev:** Localhost + Supabase dev
- **Staging:** Branca `develop` → Vercel auto-deploy
- **Prod:** Branca `main` → Vercel auto-deploy
- **Database prod:** Supabase prod (projecte independent)

## 🚀 Setup inicial

### 1. Vercel

1. Crea un compte a [vercel.com](https://vercel.com)
2. Connecta repositori GitHub
3. Crea 2 projectes Vercel:
   - `traidor-guixa-staging` (branca `develop`)
   - `traidor-guixa-prod` (branca `main`)

### 2. Supabase

1. Crea 2 projectes Supabase:
   - `traidor-guixa-dev` (per a desenvolupament local)
   - `traidor-guixa-prod` (per a producció)

2. Per a cada projecte:
   - Vés a Settings → API
   - Copia les credencials
   - Configura a Vercel

### 3. Configurar variables d'entorn a Vercel

A cada projecte Vercel (Settings → Environment Variables):

**Staging:**

```
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[staging-key]
SUPABASE_SERVICE_ROLE_KEY=[staging-secret]
NEXT_PUBLIC_APP_URL=https://traidor-guixa-staging.vercel.app
MASTER_PIN=[secret-pin]
MASTER_SESSION_SECRET=[secret-32-chars]
PASS_SECRET=[secret-32-chars]
```

**Producció:**

```
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[prod-key]
SUPABASE_SERVICE_ROLE_KEY=[prod-secret]
NEXT_PUBLIC_APP_URL=https://traidor-guixa.vercel.app
MASTER_PIN=[different-secret-pin]
MASTER_SESSION_SECRET=[different-secret]
PASS_SECRET=[different-secret]
```

## 📋 Desplegar canvis

### Workflow automàtic

```
git push origin feature/my-feature
    ↓
Crea PR a develop
    ↓
Review + merge a develop
    ↓
Vercel staging auto-deploys (teste aquí)
    ↓
PR a main
    ↓
Merge a main
    ↓
Vercel prod auto-deploys
```

### Migracions de database

Si un PR afecta el model de dades:

1. **Develop branch:**
   ```bash
   npx supabase db push  # Aplica migracions a dev
   ```

2. **Branca feature:**
   ```bash
   git push origin feature/my-feature
   ```

3. **Staging (manual):**
   - Vercel deploy dispara
   - Però database pot no estar sincronitzada
   - **Manual:** Supabase Studio staging → SQL Editor → executa migracions

4. **Production:**
   - Merge a `main`
   - Vercel deploys
   - **Manual:** Supabase Studio prod → SQL Editor → executa migracions
   - **Backup:** Fes snapshot de prod antes

## 🔐 Secrets

### Generar secrets

```bash
# MASTER_SESSION_SECRET i PASS_SECRET (32+ chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Actualitzar secrets sense downtime

1. Afegeix nova variable a Vercel
2. Redeploy (que llegeix la nova)
3. Esborrar l'antiga

## ✅ Checklist pre-producció

Antes de fer un push a `main`:

- [ ] Tots els tests passen localment
- [ ] `npm run build` sense errors
- [ ] Staging deploy completat i testat
- [ ] Migracions aplicades a staging database
- [ ] RLS policies verificades
- [ ] Secrets configurats a Vercel prod
- [ ] Secrets **NO** apareixen a fitxers públics
- [ ] QR shortener funcionant (si usat)
- [ ] Domains HTTPS configurats

## 📱 Testing a producció

Després del deploy:

1. Accedeix a https://traidor-guixa.vercel.app
2. Prova entrada màster amb PIN
3. Prova entrada jugador amb QR
4. Verifica realtime sincronització
5. Mira logs a Vercel → Logs

## 🔍 Monitoring

### Vercel

- Analytics: https://vercel.com/dashboard/[project]/analytics
- Logs: https://vercel.com/dashboard/[project]/logs

### Supabase

- Logs: https://supabase.com/dashboard/[project]/logs
- Metrics: https://supabase.com/dashboard/[project]/reports/api

## 🔄 Rollback

Si algo va mal en prod:

### Revertir a commit anterior (Vercel)

1. Vés a [Vercel Dashboard](https://vercel.com) → Deployments
2. Selecciona deployment anterior
3. Clica "Promote to Production"

### Revertir database

⚠️ **Peligroso, fer amb cura:**

1. Supabase → Backups
2. Restora el snapshot anterior
3. (Pots perdre dades)

**Millor:** no necessitar rollback (testing exhaustiu).

## 🌍 Domain personalitzat

(Opcional, si vols un domain propi)

1. Compra domain (GoDaddy, etc.)
2. Vercel → Domains → Add domain
3. Afegeix records DNS al teu domain registrar
4. Vercel ho valida automàticament

## 📊 Performance

### Mètriques a vigilar

- **LCP** (Largest Contentful Paint): < 2.5 s
- **FID** (First Input Delay): < 100 ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Bundle size:** no canviar dràsticament

Vercel Analytics mostra aquestes mètriques.

### Optimitzacions

- Next.js Image: `<Image>` component
- Code splitting: route-based (automàtic)
- Supabase queries: índexs de database
- Realtime: no abusar de channels

## 🆘 Troubleshooting

### Deployment falla amb "Module not found"

```bash
# Localment
npm run build

# Si falla, diagnostica a local i fixa
```

### Environment variables no carregades

1. Verifica que estan a Vercel Settings
2. Verifica `process.env.*` accés correcte
3. `NEXT_PUBLIC_*` visible al client; altres no

### Database no sincronitzada amb app

1. Verifica migracions aplicades
2. SQL Editor → `SELECT version()` → veure schema
3. Consulta Supabase docs per a migracions

## 📞 Support

- [Vercel docs](https://vercel.com/docs)
- [Supabase docs](https://supabase.com/docs)
- GitHub Issues

---

**Happy deploying!** 🚀
