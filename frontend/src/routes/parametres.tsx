import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { ParametresPage } from "../presentation/pages/parametres/ParametresPage";

export const Route = createFileRoute("/parametres")({
  beforeLoad: requireAdmin,
  component: ParametresPage,
});
