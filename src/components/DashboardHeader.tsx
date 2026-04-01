import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Settings, Sun, Moon, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  displayName: string;
  avatarUrl: string | null;
}

const DashboardHeader = ({ displayName, avatarUrl }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = displayName?.[0]?.toUpperCase() || '?';

  return (
    <div className="mb-6 flex items-center justify-between">
      {/* Profile avatar + name */}
      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-3 rounded-2xl p-1 pr-3 transition-colors hover:bg-secondary"
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-muted-foreground">{initials}</span>
          )}
        </div>
        <div className="text-left">
          <p className="text-[10px] text-muted-foreground">Olá,</p>
          <p className="text-sm font-bold leading-tight">{displayName || 'Usuário'}</p>
        </div>
      </button>

      {/* Action icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary"
          title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary"
          title="Configurações"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={signOut}
          className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-secondary"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
