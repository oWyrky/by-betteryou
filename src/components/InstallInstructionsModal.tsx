import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InstallPlatform } from '@/hooks/usePWAInstall';
import { Share, Plus, MoreVertical, MonitorDown } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  platform: InstallPlatform;
}

const InstallInstructionsModal = ({ open, onClose, platform }: Props) => {
  const renderSteps = () => {
    switch (platform) {
      case 'ios':
        return (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span>Abra este site no <strong>Safari</strong> (não funciona em outros navegadores no iPhone).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span className="flex items-center gap-1">Toque no ícone <Share className="inline h-4 w-4" /> <strong>Compartilhar</strong> na barra inferior.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span className="flex items-center gap-1">Selecione <Plus className="inline h-4 w-4" /> <strong>Adicionar à Tela de Início</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
              <span>Confirme em <strong>Adicionar</strong>. Pronto! O BY aparecerá como um app nativo.</span>
            </li>
          </ol>
        );
      case 'android':
        return (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span className="flex items-center gap-1">Toque no menu <MoreVertical className="inline h-4 w-4" /> no canto superior direito do Chrome.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span>Toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
              <span>Confirme tocando em <strong>Instalar</strong>.</span>
            </li>
          </ol>
        );
      case 'desktop-safari':
        return (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <span>No Safari, vá ao menu <strong>Arquivo</strong>.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span>Selecione <strong>Adicionar ao Dock…</strong></span>
            </li>
          </ol>
        );
      case 'desktop-firefox':
        return (
          <p className="text-sm text-muted-foreground">
            O Firefox não suporta instalação de PWA por padrão. Use o <strong>Chrome</strong>, <strong>Edge</strong> ou <strong>Brave</strong> para instalar o BY como app.
          </p>
        );
      default:
        return (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MonitorDown className="h-5 w-5 shrink-0 text-primary" />
              <span>Procure pelo ícone de <strong>instalação</strong> na barra de endereço do navegador (Chrome/Edge/Brave) e clique nele.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span>Ou abra o menu do navegador e procure por <strong>Instalar BY</strong>.</span>
            </li>
          </ol>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Como instalar o BY</DialogTitle>
          <DialogDescription>
            Siga os passos abaixo para adicionar o BY à sua tela inicial.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2">{renderSteps()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallInstructionsModal;
