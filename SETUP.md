# ARI — Setup Guide

## 1. Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor → run the contents of `supabase/schema.sql`
3. Go to Storage → create a bucket called `annual-reports`, set to **public**
4. Set file size limit to 50MB, allowed type: `application/pdf`
5. Copy your Project URL, anon key, and service role key

## 2. Clerk Authentication

1. Create a project at https://clerk.com
2. Enable Email + Google sign-in
3. Copy your publishable key and secret key
4. Set redirect URLs:
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

## 3. Anthropic API

1. Get your API key at https://console.anthropic.com
2. Ensure you have access to `claude-sonnet-4-6`

## 4. Stripe (optional — for billing)

1. Create a project at https://stripe.com
2. Copy publishable key and secret key
3. Set up a webhook to `/api/webhooks/stripe`
4. Add the webhook signing secret

## 5. Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```
cp .env.local.example .env.local
```

## 6. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 7. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under Settings → Environment Variables.

## Architecture notes

- **Upload flow**: PDF → Supabase Storage → `triggerAnalysis()` runs async in the same serverless function
- **Analysis**: Claude Sonnet receives up to 150k chars of structured text (section-aware chunking), returns JSON covering all 16 sections
- **Polling**: Dashboard and report pages poll `/api/reports` every 4-5s while `status === "processing"`
- **Vercel timeout**: Upload function has `maxDuration: 300` (5 minutes) to allow long analysis runs

## Known limitations

- Very long reports (300+ pages) may hit context limits; the chunker caps at 150k chars
- Vercel free tier has 10s function timeout — Pro/Enterprise required for the 300s upload function
- PDF text extraction quality depends on the PDF's text layer (scanned-only PDFs won't work without OCR)
