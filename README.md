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

**Requirements:** Node.js 20+ and an OpenAI API key. For the full checklist of manual steps (API key, approving install scripts, verification, production keys), see [docs/SETUP.md](docs/SETUP.md).

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

## Using the editor

- **Add node:** use the toolbar button. The new node appears in the middle of the view and is selected.
- **Edit:** select a node to change its label and prompt in the side panel. The panel also shows where each branch leads.
- **Connect:** drag from a node's green handle to make its **YES** path, or from its red handle for the **NO** path. Each handle connects to one node, and connections that would create a loop are refused, so every run ends.
- **Start node:** the node marked **Start** is where execution begins. Use **Set as start** in the side panel to change it.
- **Delete:** select a node or edge and press Backspace or Delete, or use the panel's **Delete** button.
- **Persistence:** the graph is saved to localStorage automatically. **Reset** brings back the sample workflow.

A branch with no outgoing edge ends the workflow.

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Flow editor page
│   └── api/
│       ├── inngest/route.ts        # Serves Inngest functions (GET/POST/PUT)
│       └── workflows/run/route.ts  # POST { graph } → sends "workflow/run" event
├── components/
│   ├── flow/
│   │   ├── flow-editor-loader.tsx  # Client-only loader (graph lives in localStorage)
│   │   ├── flow-editor.tsx         # Canvas + inspector layout
│   │   ├── flow-canvas.tsx         # React Flow canvas, toolbar, connection rules
│   │   ├── decision-node.tsx       # Decision node with YES/NO handles
│   │   ├── branch-edge.tsx         # "yes" / "no" edge types
│   │   └── node-inspector.tsx      # Side panel for editing the selected node
│   └── ui/                         # shadcn/ui components
├── inngest/
│   ├── client.ts                   # Inngest client
│   └── functions/                  # Inngest functions (run-workflow)
├── lib/
│   ├── branches.ts                 # YES/NO branch colours and helpers
│   ├── graph.ts                    # Node/edge factories, cycle + connection validation
│   ├── env.ts                      # Server env access
│   ├── openai.ts                   # OpenAI client
│   └── sample-workflow.ts          # Starter graph
├── store/workflow-store.ts         # Zustand graph store, persisted to localStorage
└── types/workflow.ts               # Graph, node, edge, Branch and Decision types
docs/SETUP.md                       # Manual setup checklist
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
- [x] **Phase 2: Foundations.** Interactive editor: add/connect nodes, edit prompts, YES/NO edge types, local graph state
- [ ] **Phase 3: Core.** Node → Inngest step, LLM YES/NO decisions, edge traversal, execution order tracking
- [ ] **Phase 4: Polish.** Execution state, logs, save/load, JSON import/export, and more
