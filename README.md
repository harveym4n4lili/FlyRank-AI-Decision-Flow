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
- **Export / Import:** **Export** downloads the workflow (graph + input) as `workflow.json`; **Import** loads one back. Imported files are validated with the same rules as the editor, and problems are reported in a toast.

A branch with no outgoing edge ends the workflow.

## Running a workflow

Type the text you want the workflow to decide about, such as a customer message, into **Input** in the **Run workflow** panel, then click **Run**. Every node is asked its question about that same input. The panel streams progress as it happens and then lists the steps in the order they ran, with each node's YES/NO answer.

### While it runs

- **Visual execution state:** the node being decided glows amber with a spinner. Finished nodes get a green YES or red NO outline and icon. A node that failed turns red, and nodes the run didn't reach fade out.
- **Animated active edges:** edges the run has followed are drawn bold, and they animate while the run is in progress. Branches it didn't take fade out.
- **Execution log:** the **Execution log** tab under the canvas shows timestamped lines for each event: the run starting, the event being sent to Inngest, each node being decided and its answer, and the outcome.
- **Execution history:** the **History** tab keeps the last 20 finished runs in localStorage. Click one to show its path, steps and log again.
- **Retry failed nodes:** if a run fails at a node, **Retry from <node>** resumes from that node with the current prompts and input. Steps that already succeeded are kept and are not sent to the LLM again.

### How execution works

```
Browser                       Next.js                          Inngest
───────                       ───────                          ───────
POST /api/workflows/realtime-token  → subscription token for channel workflow-run:<runKey>
subscribe(channel)  ◄──────────────────────────────────────────  realtime messages
POST /api/workflows/run  →  validate graph → send "workflow/run" ─► run-workflow function
                                                                   for each node, from the start node:
                                                                     publish status { running, nodeId }
                                                                     step.run("node-<id>") → OpenAI → YES|NO
                                                                     publish step { order, decision, nextNodeId }
                                                                     follow the YES or NO edge
                                                                   publish status { completed }
```

- **One Inngest step per node.** Each decision is `step.run("node-<id>")`, so it is saved once it finishes, retried on its own if it fails, and shown separately in the Inngest dashboard.
- **Only YES or NO.** The OpenAI call uses Structured Outputs with a JSON schema whose `decision` field is the enum `["YES", "NO"]`, and the reply is checked again before it's used. Anything else is treated as an error and retried.
- **Branching.** After a node answers, execution follows that node's `yes` or `no` edge. A branch with no edge ends the run.
- **Execution order.** Every executed node is recorded as `{ order, nodeId, label, prompt, decision, nextNodeId }`. These records are streamed to the browser and returned as the function's output.
- **Errors.** Temporary failures, such as rate limits or OpenAI 5xx errors, are retried up to 2 times per node. Permanent ones, such as a missing or invalid key or no credit, fail the run immediately. An `onFailure` handler then publishes the error so the panel can show it.
- **Live progress.** The browser subscribes to a channel for this run before starting it, using a random `runKey`, so it never misses a message.

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
- [x] **Phase 3: Core.** Node → Inngest step, LLM YES/NO decisions, edge traversal, execution order tracking
- [x] **Phase 4: Polish.** Visual execution state, animated active edges, better node styling, execution log, execution history, JSON export/import, retry failed nodes, error toasts
