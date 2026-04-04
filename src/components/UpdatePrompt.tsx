import { RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const UpdatePrompt = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onControllerChange = () => window.location.reload();

    navigator.serviceWorker.ready.then((registration) => {
      // Check for waiting worker on load
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShow(true);
      }

      // Listen for new waiting worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShow(true);
          }
        });
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  const handleUpdate = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <RefreshCw className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Nova versão disponível!</p>
            <p className="text-[11px] text-muted-foreground">Atualize para a última versão</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleUpdate}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Atualizar
          </button>
          <button
            onClick={() => setShow(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;
