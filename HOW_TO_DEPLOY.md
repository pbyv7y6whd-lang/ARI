# How to get ARI running in your browser

You need exactly 3 things. Takes about 15 minutes total.

---

## Thing 1 — Anthropic API key (the AI brain)

1. Go to **console.anthropic.com** and create an account
2. Add a credit card (you'll pay a few pence per report — typical monthly cost is under £5)
3. Click **API Keys** in the left menu → **Create Key** → copy it and keep it safe

---

## Thing 2 — GitHub account (free, needed to deploy)

1. Go to **github.com** → Sign up (it's free)
2. That's it — just create the account

---

## Thing 3 — Deploy to Vercel (free hosting)

1. Go to **vercel.com** → click **Sign up with GitHub**

2. Click **Add New Project** → **Import Git Repository**
   - If it asks to connect GitHub, do that
   - You need to put the ARI folder on GitHub first — see below

3. **Put ARI on GitHub:**
   - Go to github.com → click the **+** icon → **New repository** → name it "ari" → **Create repository**
   - Open **Terminal** on your Mac (press Cmd+Space, type Terminal)
   - Paste these lines one at a time:
   ```
   export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
   cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/ARI
   git init
   git add .
   git commit -m "first commit"
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ari.git
   git push -u origin main
   ```
   *(replace YOUR_GITHUB_USERNAME with your actual GitHub username)*

4. Back in Vercel — import your "ari" repository → click **Deploy**

5. **Add your environment variables** — in Vercel, go to your project → **Settings** → **Environment Variables** and add:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | your key from Step 1 |
   | `APP_PASSWORD` | anything you want (this is your login password) |
   | `SESSION_SECRET` | any long random string, e.g. `xk92mznq8a1bc7de3fg5hi6jkl0mnop4` |

6. **Add Storage** (two clicks):
   - In your Vercel project → **Storage** tab
   - Click **Create** → **Postgres** → follow prompts (free tier) → **Connect**
   - Click **Create** → **Blob** → follow prompts (free tier) → **Connect**
   - Vercel adds the connection details automatically — you don't need to copy anything

7. Go to **Deployments** → click **Redeploy** (so it picks up the new env vars)

8. Click **Visit** — your app is live at a URL like `https://ari-abc123.vercel.app`

---

## Using ARI

1. Open your Vercel URL
2. Enter the password you set as `APP_PASSWORD`
3. Click **New analysis** → drag in any annual report PDF
4. Wait 2–4 minutes
5. Read your institutional research report

---

## Stuck?

Tell me which step you're on and what you see on screen.
