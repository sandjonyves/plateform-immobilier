import { createFileRoute } from "@tanstack/react-router";
import { RapportsPage } from "../presentation/pages/rapports/RapportsPage";

export const Route = createFileRoute("/rapports")({ component: RapportsPage });
