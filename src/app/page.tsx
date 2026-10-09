import { FlowCanvas } from "@/components/flow/flow-canvas";

export default function Home() {
  return (
    <main className="flex h-screen flex-col">
      <header className="border-b px-6 py-3">
        <h1 className="text-lg font-semibold">AI Decision Flow</h1>
      </header>
      <div className="flex-1">
        <FlowCanvas />
      </div>
    </main>
  );
}
