# ngl-copy

Messages anonymes (type NGL). Site statique (Vercel) + Supabase.

## Mise en service
1. Supabase > SQL Editor : exécuter `supabase.sql`.
2. Authentication > Providers > Email : désactiver « Confirm email » (ou garder et confirmer par mail).
3. Mettre la clé `anon`/publishable dans `config.js` (`SUPABASE_ANON_KEY`).
4. Pousser sur `main` : Vercel déploie automatiquement.
