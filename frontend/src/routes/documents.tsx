import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPage } from "../presentation/pages/documents/DocumentsPage";

export const Route = createFileRoute("/documents")({ component: DocumentsPage });
