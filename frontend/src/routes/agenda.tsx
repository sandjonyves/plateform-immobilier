import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { AgendaPage } from "../presentation/pages/agenda/AgendaPage";

export const Route = createFileRoute("/agenda")({
  beforeLoad: requireAdmin,
  component: AgendaPage,
});
