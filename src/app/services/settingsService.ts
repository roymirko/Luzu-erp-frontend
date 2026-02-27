import * as settingsRepo from '../repositories/settingsRepository';

export interface FinnegansCreds {
  clientId: string;
  clientSecret: string;
}

export async function getFinnegansCreds(): Promise<{ data: FinnegansCreds; error: string | null }> {
  const { data, error } = await settingsRepo.getAll();
  if (error) return { data: { clientId: '', clientSecret: '' }, error };
  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return {
    data: {
      clientId: map['finnegans_client_id'] ?? '',
      clientSecret: map['finnegans_client_secret'] ?? '',
    },
    error: null,
  };
}

export async function saveFinnegansCreds(
  clientId: string,
  clientSecret: string,
  userId?: string
): Promise<{ error: string | null }> {
  const r1 = await settingsRepo.upsert('finnegans_client_id', clientId, userId);
  if (r1.error) return r1;
  const r2 = await settingsRepo.upsert('finnegans_client_secret', clientSecret, userId);
  return r2;
}

export async function testFinnegansConnection(
  clientId: string,
  clientSecret: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('https://teamplace.finneg.com/BSA/api/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${body}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Error de conexión' };
  }
}
