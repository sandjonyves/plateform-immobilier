import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { UtilisateursPage } from "../presentation/pages/utilisateurs/UtilisateursPage";

export const Route = createFileRoute("/utilisateurs")({
  beforeLoad: requireAdmin,
  component: UtilisateursPage,
});
