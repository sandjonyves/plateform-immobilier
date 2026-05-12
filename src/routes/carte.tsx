import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/carte")({
  component: () => <ComingSoon titre="Carte globale" description="Visualisez tout votre portefeuille sur la carte." />,
});
