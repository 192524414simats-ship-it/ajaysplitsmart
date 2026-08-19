import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Lightweight hash-based router — no external dependency.
// Routes: /, /dashboard, /groups, /groups/:id, /groups/:id/expenses,
// /groups/:id/balances, /groups/:id/settlement, /groups/:id/analytics,
// /groups/:id/what-if, /groups/:id/budget, /history, /demo

interface RouterCtx {
  path: string;
  navigate: (to: string) => void;
}

const Ctx = createContext<RouterCtx>({ path: '/', navigate: () => {} });

function currentPath(): string {
  const hash = window.location.hash.slice(1);
  return hash || '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(currentPath());

  useEffect(() => {
    const handler = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return <Ctx.Provider value={{ path, navigate }}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

// Parse path segments
export function parsePath(path: string): string[] {
  return path.split('/').filter(Boolean);
}
