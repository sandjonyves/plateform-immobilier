import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { ServicesPage } from "../presentation/pages/services/ServicesPage";

export const Route = createFileRoute("/services")({
  beforeLoad: requireAdmin,
  component: ServicesPage,
});
