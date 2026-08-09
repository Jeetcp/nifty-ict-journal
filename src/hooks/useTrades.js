import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false });
    if (error) setError(error);
    else setTrades(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { trades, loading, error, refresh };
}

export async function fetchTrade(id) {
  const { data, error } = await supabase.from('trades').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createDraftTrade() {
  const { data, error } = await supabase
    .from('trades')
    .insert({ trade_date: new Date().toISOString().slice(0, 10) })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTrade(id, patch) {
  const { data, error } = await supabase.from('trades').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTrade(id) {
  const { error } = await supabase.from('trades').delete().eq('id', id);
  if (error) throw error;
}
