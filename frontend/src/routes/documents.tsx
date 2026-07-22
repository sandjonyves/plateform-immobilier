import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "../application/auth/requireAdmin";
import { DocumentsPage } from "../presentation/pages/documents/DocumentsPage";

export const Route = createFileRoute("/documents")({
  beforeLoad: requireAdmin,
  component: DocumentsPage,
});
