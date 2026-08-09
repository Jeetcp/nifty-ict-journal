import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSetups() {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('setups').select('*').order('name', { ascending: true });
    if (!error) setSetups(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function createSetup(name, default_rules = []) {
    const { data, error } = await supabase.from('setups').insert({ name, default_rules }).select().single();
    if (error) throw error;
    setSetups((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    return data;
  }

  async function updateSetup(id, patch) {
    const { data, error } = await supabase.from('setups').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setSetups((prev) => prev.map((s) => (s.id === id ? data : s)));
    return data;
  }

  async function deleteSetup(id) {
    const { error } = await supabase.from('setups').delete().eq('id', id);
    if (error) throw error;
    setSetups((prev) => prev.filter((s) => s.id !== id));
  }

  return { setups, loading, refresh, createSetup, updateSetup, deleteSetup };
}
