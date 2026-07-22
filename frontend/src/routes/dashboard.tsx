import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { OverviewPage } from "../presentation/pages/overview/OverviewPage";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAdmin,
  component: OverviewPage,
});
