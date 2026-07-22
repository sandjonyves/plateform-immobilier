import { redirect } from '@tanstack/react-router';
import { useAuthStore } from '../store/authStore';

/** Protège les routes admin : non connecté → /auth, client → /. */
export async function requireAdmin() {
  const store = useAuthStore.getState();
  if (!store.bootstrapped) {
    await store.bootstrap();
  }
  const user = useAuthStore.getState().user;
  if (!user) {
    throw redirect({ to: '/auth' });
  }
  if (user.role !== 'admin') {
    throw redirect({ to: '/' });
  }
}
