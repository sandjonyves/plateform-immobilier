import { createFileRoute } from "@tanstack/react-router";
import { VentesPage } from "../presentation/pages/ventes/VentesPage";

export const Route = createFileRoute("/ventes")({ component: VentesPage });
