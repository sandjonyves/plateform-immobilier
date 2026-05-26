import { createFileRoute } from '@tanstack/react-router';
import { ClientServicesPage } from '../presentation/pages/client/ClientServicesPage';

export const Route = createFileRoute('/client/services')({ component: ClientServicesPage });
