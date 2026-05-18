# BISWasend Pro

Application de gestion de campagnes marketing WhatsApp — import Excel, messages personnalisés, envoi via wa.me et anti-doublon.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Configuration InsForge

1. Lier le projet CLI : `npx @insforge/cli link --project-id 0022cb94-573e-488c-992b-d48f96aa8e84`
2. Copier `.env.example` vers `.env.local`
3. Renseigner la clé anon : `npx @insforge/cli secrets get ANON_KEY`
4. Vérifier : `npx @insforge/cli current` et `npx @insforge/cli metadata --json`

L’agent Cursor utilise le MCP InsForge (`fetch-docs`, `get-backend-metadata`) et les skills dans `.agents/skills/`.

## Stack

- Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- InsForge (PostgreSQL)
- SheetJS (import/export Excel)
