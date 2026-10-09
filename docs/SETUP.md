# Manual setup checklist

These are the steps the code can't do for you. Follow them in order on a fresh machine or clone, and tick each one off.

## 1. Install the prerequisites

- [ ] **Node.js 20 or later.** Check with `node -v`. This project was built on Node 24.
- [ ] **Git.** Check with `git --version`.

## 2. Get an OpenAI API key

Decision nodes call OpenAI to get a YES/NO answer, so you need a key with credit on it.

- [ ] Sign in at https://platform.openai.com.
- [ ] Add a payment method or credit under **Settings → Billing**. A key on an account with no credit returns `429 insufficient_quota`.
- [ ] Create a key under **API keys → Create new secret key**, and copy it right away (it is only shown once).

## 3. Install dependencies

```bash
npm install
```

- [ ] Check that the Inngest CLI downloaded its binary:

  ```bash
  npx inngest-cli --version
  ```

  `package.json` already allows the `inngest-cli` and `unrs-resolver` install scripts (see `allowScripts`). If npm warns that a script was blocked and the command above fails, run:

  ```bash
  npm approve-scripts inngest-cli unrs-resolver
  npm rebuild inngest-cli unrs-resolver
  ```

  The `protobufjs` warning is safe to ignore.

## 4. Configure environment variables

- [ ] Create your local env file from the template:

  ```bash
  cp .env.example .env.local
  ```

- [ ] Open `.env.local` and replace `OPENAI_API_KEY=sk-...` with your real key.
- [ ] Optional: change `OPENAI_MODEL` (the default is `gpt-4o-mini`).
- [ ] Leave `INNGEST_DEV=1` as it is for local development.

`.env.local` is gitignored. Never commit it, and never put a real key in `.env.example`.

## 5. Run the app and the Inngest dev server

Use two terminals, both in the project root:

```bash
# Terminal 1
npm run dev           # Next.js on http://localhost:3000

# Terminal 2
npm run dev:inngest   # Inngest dev server on http://localhost:8288
```

Start the app first. If port 3000 is already taken, Next picks another port and the Inngest dev server won't find the app. Free port 3000, or change the `-u` URL in the `dev:inngest` script to match.

## 6. Verify everything is connected

- [ ] http://localhost:3000 shows the flow canvas.
- [ ] http://localhost:3000/api/inngest returns JSON containing `"mode":"dev"` and `"function_count":1` (or more).
- [ ] In the Inngest dashboard at http://localhost:8288, **Apps** lists `ai-decision-flow` as synced, and **Functions** lists `run-workflow`.
- [ ] Send a test run and watch it appear under **Runs** in the dashboard:

  ```bash
  curl -X POST http://localhost:3000/api/workflows/run \
    -H "content-type: application/json" \
    -d '{"graph":{"nodes":[],"edges":[]}}'
  ```

  You should get back `{"eventId":"..."}`.

If the app doesn't show up in the dashboard, click **Sync new app** and enter `http://localhost:3000/api/inngest`.

## 7. Production deploy (only if you deploy)

You don't need any of this for local development or the assignment demo.

- [ ] Create an account at https://app.inngest.com.
- [ ] Copy the **Event Key** and **Signing Key** from the Inngest Cloud dashboard.
- [ ] On your host (for example Vercel), set these environment variables:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL` (optional)
  - `INNGEST_EVENT_KEY`
  - `INNGEST_SIGNING_KEY`
  - Do **not** set `INNGEST_DEV` in production.
- [ ] After deploying, sync the app in Inngest Cloud using `https://<your-domain>/api/inngest`. The Vercel integration does this for you automatically.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Missing required environment variable: OPENAI_API_KEY` | Set the key in `.env.local`, then restart `npm run dev`. |
| `429 insufficient_quota` from OpenAI | Add credit to your OpenAI account. |
| The dashboard shows no apps | Start `npm run dev` before `npm run dev:inngest`, or sync manually (step 6). |
| `inngest-cli` is not found or fails to run | Re-run the approve and rebuild commands in step 3. |
| Saved workflow looks wrong after a code change | Click **Reset** in the editor toolbar to restore the sample graph. |
