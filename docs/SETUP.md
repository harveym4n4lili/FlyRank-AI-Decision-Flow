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
If the app doesn't show up in the dashboard, click **Sync new app** and enter `http://localhost:3000/api/inngest`.

## 7. Run a workflow end to end

This step needs a real `OPENAI_API_KEY` (step 4) and both servers running.

- [ ] Open http://localhost:3000. The **Run workflow** panel on the right already contains a sample input.
- [ ] Click **Run**. The badge should go from **Queued** to **Running**, with a "Deciding: …" line for the current node, then to **Completed**.
- [ ] Check the results list. With the sample input it should show `1. Classify: YES` followed by `2. Support`, then "Workflow ended after Support".
- [ ] In the Inngest dashboard at http://localhost:8288, open **Runs**. The newest `run-workflow` run should list one `node-…` step for each decision, each with its YES/NO output.
- [ ] Optional: edit the input, for example "We're a 500-person company interested in your enterprise plan", and run it again. Classify should now answer NO and the run should go to Sales.

If **Run** is greyed out, the hint underneath says why: the input is empty, there is no start node, or a node in the path has no prompt.

Progress reaches the browser through Inngest Realtime, which the dev server provides. You don't need to set anything up for it locally.

## 8. Production deploy (only if you deploy)

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
- [ ] Run a workflow from the deployed site. Live progress uses Inngest Cloud Realtime, which signs subscription tokens with `INNGEST_SIGNING_KEY`, so that key must be set.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| A run fails with `Missing required environment variable: OPENAI_API_KEY` | Set the key in `.env.local`, then restart `npm run dev`. |
| A run fails with `401 Incorrect API key provided` | `.env.local` still has the placeholder key or a revoked one. Replace it and restart `npm run dev`. |
| A run fails with `429 ... insufficient_quota` | Add credit to your OpenAI account. |
| A run fails with `404 The model ... does not exist` | Your account can't use `OPENAI_MODEL`. Remove the line to use the default, or pick a model you have access to. |
| A run stays on **Queued**, then shows "Timed out waiting for the run to finish" | The Inngest dev server isn't running or hasn't synced the app. Start `npm run dev:inngest` and check step 6. |
| A run shows "Lost connection to the run" | The Realtime connection to the Inngest dev server dropped. Make sure it's still running, then click **Run** again. |
| A run fails because of a temporary OpenAI error (500, rate limit) | Inngest retries each node up to 2 more times before failing the run. Check **Runs** in the dashboard to see each attempt. |
| The dashboard shows no apps | Start `npm run dev` before `npm run dev:inngest`, or sync manually (step 6). |
| `inngest-cli` is not found or fails to run | Re-run the approve and rebuild commands in step 3. |
| Saved workflow looks wrong after a code change | Click **Reset** in the editor toolbar to restore the sample graph. |
