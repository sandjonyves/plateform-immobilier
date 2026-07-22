import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { TerrainsPage } from "../presentation/pages/terrains/TerrainsPage";

export const Route = createFileRoute("/terrains")({
  beforeLoad: requireAdmin,
  component: TerrainsPage,
});
