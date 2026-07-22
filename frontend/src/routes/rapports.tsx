import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { RapportsPage } from "../presentation/pages/rapports/RapportsPage";

export const Route = createFileRoute("/rapports")({
  beforeLoad: requireAdmin,
  component: RapportsPage,
});
