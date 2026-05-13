import { createFileRoute } from "@tanstack/react-router";
import { MessageriePage } from "../presentation/pages/messagerie/MessageriePage";

export const Route = createFileRoute("/messagerie")({ component: MessageriePage });
