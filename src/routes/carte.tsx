import { createFileRoute } from "@tanstack/react-router";
import { CartePage } from "../presentation/pages/carte/CartePage";

export const Route = createFileRoute("/carte")({ component: CartePage });
