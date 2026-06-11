import { supabase } from './supabase';

export interface VoiceProfileResult {
  success: boolean;
  transcript?: string;
  toneProfileSchema?: string;
  saved?: boolean;
  error?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const EDGE_FN_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/profile-voice` : '';

export async function uploadVoiceProfile(
  audioBlob: Blob,
  durationSeconds: number
): Promise<VoiceProfileResult> {
  const isSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!isSupabase) {
    const formData = new FormData();
    formData.append('voiceSample', audioBlob, 'profile-voice.wav');
    formData.append('duration', String(durationSeconds));

    const response = await fetch('/api/profile-voice', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error ?? 'Local upload/processing failed');
    }
    return data as VoiceProfileResult;
  }

  const formData = new FormData();
  formData.append('voiceSample', audioBlob, 'profile-voice.wav');
  formData.append('duration', String(durationSeconds));

  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? 'Upload failed');
  }

  return data as VoiceProfileResult;
}

export async function getLatestVoiceProfile() {
  const isSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!isSupabase) {
    const response = await fetch('/api/profile-voice/latest');
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch latest voice profile locally');
    }
    return response.json();
  }

  const { data, error } = await supabase
    .from('voice_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}
