import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/rapports")({
  component: () => <ComingSoon titre="Rapports" description="Analyses de performance et exports." />,
});
