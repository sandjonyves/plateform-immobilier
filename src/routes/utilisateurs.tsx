import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/utilisateurs")({
  component: () => <ComingSoon titre="Utilisateurs" description="Administrez agents, clients et permissions." />,
});
