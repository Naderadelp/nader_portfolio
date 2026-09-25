import {
  DerivedStateDiagram,
  ErpSyncDiagram,
  PublishPipelineDiagram,
} from "@/components/diagrams";

/** Diagram component per case-study `diagramId`. */
const DIAGRAMS = {
  "publish-pipeline": PublishPipelineDiagram,
  "erp-sync": ErpSyncDiagram,
  "derived-state": DerivedStateDiagram,
} as const;

export function DiagramById({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const Component = DIAGRAMS[id as keyof typeof DIAGRAMS];
  if (!Component) return null;
  return <Component className={className} />;
}
