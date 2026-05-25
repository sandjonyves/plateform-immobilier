import { createFileRoute } from "@tanstack/react-router";
import { ClientTerrainDetailPage } from "../presentation/pages/client/ClientTerrainDetailPage";

export const Route = createFileRoute("/client/terrains/$id")({ component: ClientTerrainDetailPage });
