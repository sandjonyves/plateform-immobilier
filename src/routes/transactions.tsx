import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "../presentation/pages/ComingSoon";

export const Route = createFileRoute("/transactions")({
  component: () => <ComingSoon titre="Transactions" description="Suivi des ventes et locations." />,
});
