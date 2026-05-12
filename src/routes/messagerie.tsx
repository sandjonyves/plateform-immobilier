import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/messagerie")({
  component: () => <ComingSoon titre="Messagerie" description="Conversations avec clients et agents." />,
});
