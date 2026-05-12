import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/documents")({
  component: () => <ComingSoon titre="Documents" description="Contrats, titres fonciers et permis." />,
});
