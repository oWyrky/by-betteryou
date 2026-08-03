import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import logoImg from '@/assets/logo.png';

type AuthorizationDetails = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get('authorization_id') ?? '';
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError('Requisição inválida: authorization_id ausente.');
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        if (active) setNeedsLogin(true);
        return;
      }
      const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const signIn = async () => {
    await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}${window.location.pathname}${window.location.search}`,
    });
  };

  const decide = async (approve: boolean) => {
    setBusy(true);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError('O servidor de autorização não retornou um redirecionamento.');
      return;
    }
    window.location.href = target;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6">
        <div className="mb-5 flex flex-col items-center gap-3 text-center">
          <img src={logoImg} alt="BY" className="h-16 w-16 rounded-2xl" />
          <h1 className="text-lg font-bold">Conectar ao BY</h1>
        </div>

        {error && (
          <p className="text-sm text-destructive">Não foi possível carregar esta autorização: {error}</p>
        )}

        {!error && needsLogin && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">Entre na sua conta para continuar a autorização.</p>
            <button
              onClick={signIn}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Entrar com Google
            </button>
          </div>
        )}

        {!error && !needsLogin && !details && (
          <p className="text-center text-sm text-muted-foreground">Carregando…</p>
        )}

        {!error && details && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {details.client?.name ?? 'Um aplicativo'} quer acessar seus hábitos e perfil no BY, agindo como você.
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-secondary disabled:opacity-50"
              >
                Recusar
              </button>
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
              >
                Autorizar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OAuthConsent;
