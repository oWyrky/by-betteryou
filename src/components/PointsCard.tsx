import { usePoints, usePointTransactions } from '@/hooks/usePoints';
import { POINT_RULES, type PointReason } from '@/lib/points';
import { Coins, TrendingUp, Wallet } from 'lucide-react';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const PointsCard = () => {
  const { balance, totalEarned, totalSpent, loading } = usePoints();
  const { transactions } = usePointTransactions(8);

  return (
    <div className="mb-6 rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
            <Coins className="h-4 w-4 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Seus pontos</p>
            <p className="text-xl font-bold leading-none">{loading ? '—' : balance}</p>
          </div>
        </div>
        <div className="flex gap-3 text-right">
          <div>
            <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> Ganhos
            </p>
            <p className="text-sm font-semibold">{totalEarned}</p>
          </div>
          <div>
            <p className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
              <Wallet className="h-3 w-3" /> Gastos
            </p>
            <p className="text-sm font-semibold">{totalSpent}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-secondary/50 p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Como ganhar pontos
        </p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li className="flex justify-between"><span>💧 Meta de água</span><span className="font-semibold text-foreground">+10</span></li>
          <li className="flex justify-between"><span>🏋️ Exercício concluído</span><span className="font-semibold text-foreground">+15</span></li>
          <li className="flex justify-between"><span>📚 Estudo concluído</span><span className="font-semibold text-foreground">+15</span></li>
          <li className="flex justify-between"><span>📖 Leitura concluída</span><span className="font-semibold text-foreground">+15</span></li>
          <li className="flex justify-between"><span>🎯 Dia 100% completo</span><span className="font-semibold text-foreground">+25</span></li>
        </ul>
        <p className="mt-2 text-[10px] italic text-muted-foreground">
          Guarde seus pontos — a loja está a caminho.
        </p>
      </div>

      {transactions.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Últimas transações
          </p>
          <ul className="divide-y">
            {transactions.map((t) => {
              const rule = POINT_RULES[t.reason as PointReason];
              return (
                <li key={t.id} className="flex items-center justify-between py-1.5 text-xs">
                  <div>
                    <p className="font-medium">{rule?.label ?? t.reason}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.reference_date ? formatDate(t.reference_date) : formatDate(t.created_at)}
                    </p>
                  </div>
                  <span className={`font-bold ${t.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PointsCard;
