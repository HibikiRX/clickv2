# ngl-copy → stories Instagram

Page d'envoi anonyme (`index.html`) → `api/submit` (filtre + limite de débit) → story Instagram via l'API Graph (`api/story` génère l'image JPEG 1080x1920).
Sans `IG_USER_ID` / `IG_ACCESS_TOKEN`, les messages sont seulement enregistrés (statut `queued`) dans la table `confessions` de Supabase.

## Variables d'environnement Vercel
- `IG_USER_ID` : ID du compte Instagram Professionnel
- `IG_ACCESS_TOKEN` : jeton longue durée (permission `instagram_content_publish`)
- `ACCOUNT_NAME` (optionnel) : texte affiché sur la story
