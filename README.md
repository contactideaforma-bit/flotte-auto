# Flotte Auto — Mymy la King 👑

Application de gestion de parc automobile. Stack : Next.js 14 · Supabase · Vercel.

---

## 1. Supabase — créer la base de données

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Nommer le projet (ex: `flotte-auto`), choisir une région (Europe West)
3. Une fois le projet créé → **SQL Editor** → coller le contenu de `supabase/schema.sql` → **Run**
4. Aller dans **Project Settings → API** et noter :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Local — installation et lancement

```bash
# Copier les variables d'environnement
cp .env.local.example .env.local
# Editer .env.local avec vos vraies clés Supabase

npm install
npm run dev
# → http://localhost:3000
```

---

## 3. GitHub — pousser le code

```bash
git init
git add .
git commit -m "init: flotte auto"

# Créer un repo sur github.com puis :
git remote add origin https://github.com/VOTRE_USER/flotte-auto.git
git branch -M main
git push -u origin main
```

---

## 4. Vercel — déploiement

1. Aller sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importer le repo GitHub `flotte-auto`
3. Dans **Environment Variables**, ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL` = votre URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = votre clé anon
4. Cliquer **Deploy** → l'URL de production est prête en ~2 minutes

---

## Structure du projet

```
flotte-auto/
├── app/
│   ├── api/vehicles/         # API REST (GET, POST, PUT, DELETE)
│   ├── dashboard/page.tsx    # Dashboard principal
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── VehicleModal.tsx      # Formulaire ajout/modification
│   ├── MiniCalendar.tsx      # Calendrier avec alertes
│   └── StatusBadge.tsx
├── lib/
│   ├── supabase.ts           # Client Supabase + types
│   └── utils.ts              # Calcul alertes J+40
└── supabase/
    └── schema.sql            # À exécuter dans Supabase
```

## Logique des alertes

- **Alerte déclenchée** : 40 jours après la date de souscription assurance
- **Badge orange** : échéance dans ≤ 10 jours
- **Badge rouge** : échéance dépassée
- **Calendrier** : les jours d'alerte sont surlignés en rouge
