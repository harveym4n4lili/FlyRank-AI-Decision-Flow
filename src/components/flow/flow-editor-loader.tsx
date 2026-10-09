"use client";

import dynamic from "next/dynamic";

/**
 * The editor reads its graph from localStorage, so it renders on the client only;
 * server-rendering it would mismatch the persisted graph on hydration.
 */
export const FlowEditorLoader = dynamic(
  () => import("@/components/flow/flow-editor").then((m) => m.FlowEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading editor…
      </div>
    ),
  },
);
