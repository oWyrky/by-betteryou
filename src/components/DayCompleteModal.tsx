import { useEffect, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';

interface DayCompleteModalProps {
  open: boolean;
  onClose: () => void;
}

const DayCompleteModal = ({ open, onClose }: DayCompleteModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => setShow(true), 50);
    } else {
      setShow(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`relative mx-4 flex max-w-sm flex-col items-center gap-4 rounded-3xl bg-card p-8 text-center shadow-2xl transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-secondary">
          <X className="h-4 w-4" />
        </button>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Dia Concluído!</h2>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          Parabéns! Você completou todas as suas metas de hoje. Continue assim, cada dia conta! 🔥
        </p>
        <button
          onClick={onClose}
          className="mt-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
        >
          Obrigado!
        </button>
      </div>
    </div>
  );
};

export default DayCompleteModal;
