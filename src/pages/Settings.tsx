import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, Save, Eye, EyeOff, Ruler, Weight } from 'lucide-react';
import { toast } from 'sonner';
import { getAvatarSignedUrl } from '@/lib/avatar';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, fetchProfile } = useHabits();

  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [ageVisible, setAgeVisible] = useState(true);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [waterIncrement, setWaterIncrement] = useState(100);
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [heightVisible, setHeightVisible] = useState(true);
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [weightVisible, setWeightVisible] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setAge((profile as any).age ?? '');
      setAgeVisible((profile as any).age_visible ?? true);
      setWaterGoal(profile.water_goal_ml);
      setWaterIncrement(profile.water_increment_ml);
      setAvatarPath(profile.avatar_url);
      // Resolve signed URL for display
      getAvatarSignedUrl(profile.avatar_url).then(url => setAvatarUrl(url));
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar foto');
      setUploading(false);
      return;
    }

    setAvatarPath(path);
    const signedUrl = await getAvatarSignedUrl(path);
    setAvatarUrl(signedUrl);
    setUploading(false);
    toast.success('Foto atualizada!');
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    const updates: Record<string, any> = {
      display_name: displayName,
      age: age === '' ? null : age,
      age_visible: ageVisible,
      water_goal_ml: waterGoal,
      water_increment_ml: waterIncrement,
    };

    if (avatarPath !== profile.avatar_url) {
      updates.avatar_url = avatarPath;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (error) {
      toast.error('Erro ao salvar');
    } else {
      toast.success('Configurações salvas!');
      fetchProfile();
    }
    setSaving(false);
  };

  const avatarDisplay = avatarUrl || undefined;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Configurações</h1>
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-secondary">
              {avatarDisplay ? (
                <img src={avatarDisplay} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">
                  {displayName?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
              disabled={uploading}
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          {uploading && <p className="text-xs text-muted-foreground">Enviando...</p>}
        </div>

        <div className="space-y-4">
          {/* Display Name */}
          <div className="rounded-2xl border bg-card p-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Nickname</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Seu nome ou apelido"
            />
          </div>

          {/* Age */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Idade</label>
              <button
                onClick={() => setAgeVisible(!ageVisible)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {ageVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {ageVisible ? 'Visível' : 'Oculta'}
              </button>
            </div>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Sua idade"
              min={1}
              max={150}
            />
          </div>

          {/* Water Goal */}
          <div className="rounded-2xl border bg-card p-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Meta de água diária (ml)</label>
            <input
              type="number"
              value={waterGoal}
              onChange={e => setWaterGoal(parseInt(e.target.value) || 0)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              step={100}
              min={0}
            />
          </div>

          {/* Water Increment */}
          <div className="rounded-2xl border bg-card p-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Incremento de água (ml)</label>
            <input
              type="number"
              value={waterIncrement}
              onChange={e => setWaterIncrement(parseInt(e.target.value) || 100)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              step={50}
              min={50}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
