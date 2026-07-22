import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { MessageriePage } from "../presentation/pages/messagerie/MessageriePage";

export const Route = createFileRoute("/messagerie")({
  beforeLoad: requireAdmin,
  component: MessageriePage,
});
