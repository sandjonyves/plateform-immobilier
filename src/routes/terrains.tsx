import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/terrains")({
  component: () => <ComingSoon titre="Terrains" description="Gérez votre catalogue de terrains avec polygones GPS." />,
});
