import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { VentesPage } from "../presentation/pages/ventes/VentesPage";

export const Route = createFileRoute("/ventes")({
  beforeLoad: requireAdmin,
  component: VentesPage,
});
