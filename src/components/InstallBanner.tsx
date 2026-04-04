import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

const InstallBanner = () => {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="mb-4 flex items-center justify-between rounded-2xl border bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">Instale o BY</p>
          <p className="text-[11px] text-muted-foreground">Acesso rápido na tela inicial</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={install}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          Instalar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
