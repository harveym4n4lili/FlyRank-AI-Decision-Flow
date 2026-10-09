import { FlowEditorLoader } from "@/components/flow/flow-editor-loader";

export default function Home() {
  return (
    <main className="flex h-screen flex-col">
      <header className="border-b px-6 py-3">
        <h1 className="text-lg font-semibold">AI Decision Flow</h1>
      </header>
      <div className="min-h-0 flex-1">
        <FlowEditorLoader />
      </div>
    </main>
  );
}
