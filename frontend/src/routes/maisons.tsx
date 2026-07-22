import { createFileRoute } from "@tanstack/react-router";
import { MaisonsPage } from "../presentation/pages/maisons/MaisonsPage";

export const Route = createFileRoute("/maisons")({ component: MaisonsPage });
