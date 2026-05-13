import { createFileRoute } from "@tanstack/react-router";
import { TerrainsPage } from "../presentation/pages/terrains/TerrainsPage";

export const Route = createFileRoute("/terrains")({ component: TerrainsPage });
