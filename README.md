# BPS Business Car — plateforme de vente, commande et location

Site statique (HTML, CSS, JavaScript) relié à Supabase. Thème bleu et bleu ciel.

## Fichiers
- `index.html`, `style.css`, `app.js` : le site et l’espace administrateur
- `data.js` : adresse du projet Supabase, clé publique et stock de démonstration
- `supabase/migrations/…sql` : tables, règles de sécurité (RLS), bucket de photos et 20 véhicules d’exemple

## 1. Initialiser la base de données (une seule fois)
**Méthode simple :** Supabase → SQL Editor → New query → collez le contenu du fichier `.sql` → Run.

**Méthode ligne de commande :**
```
supabase login
supabase init
supabase link --project-ref ktdnevesgdmhophcozjv
supabase db push
```
(le mot de passe de la base est demandé par `link`; ne l’écrivez dans aucun fichier du site.)

## 2. Créer le compte administrateur
1. Ouvrez le site, section **ADMIN**, cliquez « Première utilisation ? Créer le compte administrateur ».
2. Entrez votre email et un mot de passe (8 caractères minimum), puis confirmez l’email reçu.
3. Reconnectez-vous : le **premier** compte connecté devient administrateur, personne d’autre ne peut le devenir.
4. Ensuite : Supabase → Authentication → Sign In / Providers → désactivez « Allow new users to sign up ».

L’administrateur peut ajouter, modifier et supprimer véhicules et locations (avec photos), lire et supprimer les demandes clients, et changer le numéro WhatsApp et les contacts.

## 3. Publier avec GitHub Pages
Dépôt → Settings → Pages → Branch `main` / `/ (root)`. Puis Supabase → Authentication → URL Configuration : mettez l’adresse de votre site GitHub Pages dans « Site URL ».

## Sécurité
La clé `sb_publishable_…` peut être publique. Toute la protection repose sur les règles RLS : tout le monde lit les véhicules visibles et peut envoyer une demande, seul l’administrateur écrit.
Ne publiez jamais le mot de passe de la base ni une clé `secret` / `service_role`.
