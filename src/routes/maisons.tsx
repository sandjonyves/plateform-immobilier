import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/maisons")({
  component: () => <ComingSoon titre="Maisons" description="Catalogue de maisons et appartements." />,
});
