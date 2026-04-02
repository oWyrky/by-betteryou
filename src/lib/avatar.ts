import { supabase } from '@/integrations/supabase/client';

/**
 * Resolves an avatar storage path to a signed URL.
 * Handles both legacy full URLs and new path-only values.
 */
export async function getAvatarSignedUrl(avatarPath: string | null): Promise<string | null> {
  if (!avatarPath) return null;
  
  // If it's already a signed URL or external URL, return as-is (legacy)
  if (avatarPath.startsWith('http')) return avatarPath;
  
  const { data } = await supabase.storage.from('avatars').createSignedUrl(avatarPath, 3600);
  return data?.signedUrl ?? null;
}
