import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { MaisonsPage } from "../presentation/pages/maisons/MaisonsPage";

export const Route = createFileRoute("/maisons")({
  beforeLoad: requireAdmin,
  component: MaisonsPage,
});
