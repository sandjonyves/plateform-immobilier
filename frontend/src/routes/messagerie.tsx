import { createFileRoute, redirect } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";

/** Messagerie désactivée en v1 — code page conservé, accès redirigé. */
export const Route = createFileRoute("/messagerie")({
  beforeLoad: async () => {
    await requireAdmin();
    throw redirect({ to: "/dashboard" });
  },
});
