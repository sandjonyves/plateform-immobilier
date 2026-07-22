import { createFileRoute } from "@tanstack/react-router";
import { ClientMaisonsPage } from "../presentation/pages/client/ClientMaisonsPage";

export const Route = createFileRoute("/client/maisons/")({ component: ClientMaisonsPage });
