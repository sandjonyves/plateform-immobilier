import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/agenda")({
  component: () => <ComingSoon titre="Agenda" description="Visites, signatures et réunions." />,
});
