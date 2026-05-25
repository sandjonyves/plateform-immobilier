import { createFileRoute } from "@tanstack/react-router";
import { ClientTerrainsPage } from "../presentation/pages/client/ClientTerrainsPage";

export const Route = createFileRoute("/client/terrains/")({ component: ClientTerrainsPage });
