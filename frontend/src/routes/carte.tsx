import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { CartePage } from "../presentation/pages/carte/CartePage";

export const Route = createFileRoute("/carte")({
  beforeLoad: requireAdmin,
  component: CartePage,
});
