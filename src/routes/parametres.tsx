import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/parametres")({
  component: () => <ComingSoon titre="Paramètres" description="Profil, notifications et apparence." />,
});
