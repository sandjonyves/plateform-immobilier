import { createFileRoute } from "@tanstack/react-router";
import { ClientHomePage } from "../presentation/pages/client/ClientHomePage";

export const Route = createFileRoute("/client/")({ component: ClientHomePage });
