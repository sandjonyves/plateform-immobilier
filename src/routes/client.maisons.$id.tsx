import { createFileRoute } from "@tanstack/react-router";
import { ClientMaisonDetailPage } from "../presentation/pages/client/ClientMaisonDetailPage";

export const Route = createFileRoute("/client/maisons/$id")({ component: ClientMaisonDetailPage });
