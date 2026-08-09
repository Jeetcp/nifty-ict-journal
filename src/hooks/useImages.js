import { useCallback, useEffect, useState } from 'react';
import { supabase, SCREENSHOTS_BUCKET } from '../lib/supabaseClient';

export function useImages(tradeId) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tradeId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true });
    if (!error) setImages(data ?? []);
    setLoading(false);
  }, [tradeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function uploadFile(file) {
    const ext = file.name?.split('.').pop() || 'png';
    const path = `${tradeId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(SCREENSHOTS_BUCKET).upload(path, file, {
      contentType: file.type || 'image/png',
      upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data: pub } = supabase.storage.from(SCREENSHOTS_BUCKET).getPublicUrl(path);
    const { data, error } = await supabase
      .from('images')
      .insert({ trade_id: tradeId, url: pub.publicUrl, tags: [], note: '' })
      .select()
      .single();
    if (error) throw error;
    setImages((prev) => [...prev, data]);
    return data;
  }

  async function updateImage(id, patch) {
    const { data, error } = await supabase.from('images').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setImages((prev) => prev.map((img) => (img.id === id ? data : img)));
    return data;
  }

  async function deleteImage(id) {
    const { error } = await supabase.from('images').delete().eq('id', id);
    if (error) throw error;
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  return { images, loading, uploadFile, updateImage, deleteImage, refresh };
}
