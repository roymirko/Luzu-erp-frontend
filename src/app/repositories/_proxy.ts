const useSupabase = import.meta.env.VITE_USE_SUPABASE !== 'false';

export function createRepoProxy<T extends Record<string, any>>(
  supabaseImport: () => Promise<T>,
  apiImport: () => Promise<T>,
): T {
  let impl: T | null = null;
  const loading = useSupabase ? supabaseImport() : apiImport();
  loading.then(m => { impl = m; });

  return new Proxy({} as T, {
    get(_, prop: string) {
      if (prop === 'then') return undefined;
      return async (...args: any[]) => {
        if (!impl) impl = await loading;
        return (impl[prop] as Function)(...args);
      };
    },
  });
}
