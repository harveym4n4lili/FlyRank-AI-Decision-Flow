# AI Decision Flow

A visual AI workflow builder. Each node is an AI decision step that answers a prompt with **YES** or **NO**, and execution follows the matching edge. Workflows are drawn with [React Flow](https://reactflow.dev) and executed durably with [Inngest](https://www.inngest.com), with each node running as one Inngest step.

```
"Is this a support request?"
   ├── YES → Support node
   └── NO  → Sales node
```

## Tech stack

| Concern        | Tool                                   |
| -------------- | -------------------------------------- |
| App framework  | Next.js (App Router) + React + TypeScript |
| Flow editor    | `@xyflow/react` (React Flow v12)       |
| Workflow engine| Inngest (+ local dev server via `inngest-cli`) |
| LLM            | OpenAI SDK                             |
| UI             | shadcn/ui + Tailwind CSS v4            |

## Getting started

**Requirements:** Node.js 20+ and an OpenAI API key.

```bash
npm install
cp .env.example .env.local   # then set OPENAI_API_KEY
```

Run the app and the Inngest dev server in two terminals:

```bash
npm run dev           # Next.js → http://localhost:3000
npm run dev:inngest   # Inngest dev server → http://localhost:8288
```

The Inngest dev server finds the app at `http://localhost:3000/api/inngest`. Open http://localhost:8288 to see registered functions, events and runs.

### Environment variables

| Variable              | Required | Description                                          |
| --------------------- | -------- | ---------------------------------------------------- |
| `OPENAI_API_KEY`      | yes      | Used by decision nodes to get a YES/NO answer        |
| `OPENAI_MODEL`        | no       | Defaults to `gpt-4o-mini`                            |
| `INNGEST_DEV`         | local    | `1` makes the SDK talk to the local dev server       |
| `INNGEST_EVENT_KEY`   | prod     | Inngest Cloud event key                              |
| `INNGEST_SIGNING_KEY` | prod     | Inngest Cloud signing key                            |

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Flow editor page
│   └── api/
│       ├── inngest/route.ts        # Serves Inngest functions (GET/POST/PUT)
│       └── workflows/run/route.ts  # POST { graph } → sends "workflow/run" event
├── components/
│   ├── flow/                       # React Flow canvas + custom decision node
│   └── ui/                         # shadcn/ui components
├── inngest/
│   ├── client.ts                   # Inngest client
│   └── functions/                  # Inngest functions (run-workflow)
├── lib/
│   ├── env.ts                      # Server env access
│   ├── openai.ts                   # OpenAI client
│   └── sample-workflow.ts          # Starter graph
└── types/workflow.ts               # Graph, node, edge and Decision types
```

## Scripts

| Script               | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev`        | Start Next.js in dev mode      |
| `npm run dev:inngest`| Start the Inngest dev server   |
| `npm run build`      | Production build               |
| `npm run lint`       | Run ESLint                     |

## Roadmap

- [x] **Phase 1: Setup.** Next.js, React Flow, Inngest, OpenAI SDK, shadcn, env config
- [ ] **Phase 2: Foundations.** Interactive editor: add/connect nodes, edit prompts, YES/NO edge types, local graph state
- [ ] **Phase 3: Core.** Node → Inngest step, LLM YES/NO decisions, edge traversal, execution order tracking
- [ ] **Phase 4: Polish.** Execution state, logs, save/load, JSON import/export, and more
