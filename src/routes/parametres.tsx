import { createFileRoute } from "@tanstack/react-router";
import { ParametresPage } from "../presentation/pages/parametres/ParametresPage";

export const Route = createFileRoute("/parametres")({ component: ParametresPage });
