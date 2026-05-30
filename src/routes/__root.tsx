import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppLayout } from "../presentation/components/layout/AppLayout";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold">404</h1>
        <p className="mt-4 text-muted-foreground">Page introuvable.</p>
        <Link to="/" className="inline-flex mt-6 h-9 items-center px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ImmoPro — Tableau de bord immobilier" },
      { name: "description", content: "ImmoPro : la plateforme de gestion immobilière pour le marché camerounais." },
      { property: "og:title", content: "ImmoPro — Tableau de bord immobilier" },
      { name: "twitter:title", content: "ImmoPro — Tableau de bord immobilier" },
      { property: "og:description", content: "ImmoPro : la plateforme de gestion immobilière pour le marché camerounais." },
      { name: "twitter:description", content: "ImmoPro : la plateforme de gestion immobilière pour le marché camerounais." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8b70270e-689b-4993-af69-9985fc0fd62b/id-preview-366be6fc--e74f14a6-4eb5-493c-8221-a15eeb7b0068.lovable.app-1779826497365.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8b70270e-689b-4993-af69-9985fc0fd62b/id-preview-366be6fc--e74f14a6-4eb5-493c-8221-a15eeb7b0068.lovable.app-1779826497365.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout><Outlet /></AppLayout>
    </QueryClientProvider>
  );
}
