import { createFileRoute } from "@tanstack/react-router";
import { UtilisateursPage } from "../presentation/pages/utilisateurs/UtilisateursPage";

export const Route = createFileRoute("/utilisateurs")({ component: UtilisateursPage });
