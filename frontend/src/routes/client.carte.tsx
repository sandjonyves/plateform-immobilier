import { createFileRoute } from "@tanstack/react-router";
import { ClientCartePage } from "../presentation/pages/client/ClientCartePage";

export const Route = createFileRoute("/client/carte")({ component: ClientCartePage });
