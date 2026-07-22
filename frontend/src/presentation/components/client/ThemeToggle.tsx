import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../../../application/hooks/useTheme';

export function ThemeToggle() {
  const { toggle } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return (
    <button
      onClick={toggle}
      aria-label="Changer le thème"
      className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent text-foreground/75 transition-colors"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
