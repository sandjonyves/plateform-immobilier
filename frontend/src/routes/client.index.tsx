import { createFileRoute, redirect } from "@tanstack/react-router";

/** Ancienne URL d'accueil client → page d'accueil racine */
export const Route = createFileRoute("/client/")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
