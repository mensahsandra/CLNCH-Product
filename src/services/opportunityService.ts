import { supabase } from './supabase';

export interface Opportunity {
  id?: string;
  link: string;
  organization: string;
  category: string;
  requirements: string[];
  deadline?: string;
  status: 'pending' | 'filed' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface ExtractionResult {
  organization: string;
  requirements: string[];
  deadline?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const EXTRACT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/extract` : '';

export async function processOpportunityUrl(url: string): Promise<ExtractionResult> {
  const isSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!isSupabase) {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to store/extract opportunity data via local API');
    }

    return response.json();
  }

  const response = await fetch(EXTRACT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract opportunity data');
  }

  return response.json();
}

export async function createOpportunity(
  data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>
): Promise<Opportunity> {
  const isSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!isSupabase) {
    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create opportunity locally');
    }

    return response.json();
  }

  const { data: result, error } = await supabase
    .from('opportunities')
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create opportunity');
  }

  return result;
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const isSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!isSupabase) {
    const response = await fetch('/api/opportunities');
    if (!response.ok) {
      throw new Error('Failed to fetch opportunities locally');
    }
    return response.json();
  }

  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch opportunities');
  }

  return data || [];
}

export async function updateOpportunityStatus(
  id: string,
  status: Opportunity['status']
): Promise<Opportunity> {
  const isSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!isSupabase) {
    const response = await fetch(`/api/opportunities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update opportunity status locally');
    }

    return response.json();
  }

  const { data, error } = await supabase
    .from('opportunities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update opportunity');
  }

  return data;
}
