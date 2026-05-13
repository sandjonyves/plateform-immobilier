import { createFileRoute } from "@tanstack/react-router";
import { AgendaPage } from "../presentation/pages/agenda/AgendaPage";

export const Route = createFileRoute("/agenda")({ component: AgendaPage });
