import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrades } from '../hooks/useTrades';
import { supabase } from '../lib/supabaseClient';
import { formatR } from '../lib/calculations';

export default function TradeList() {
  const { trades, loading } = useTrades();
  const [thumbs, setThumbs] = useState({});
  const [filters, setFilters] = useState({ setup: '', instrument: '', session: '', result: '' });

  useEffect(() => {
    if (trades.length === 0) return;
    const ids = trades.map((t) => t.id);
    supabase
      .from('images')
      .select('trade_id, url, created_at')
      .in('trade_id', ids)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        for (const img of data) {
          if (!map[img.trade_id]) map[img.trade_id] = img.url;
        }
        setThumbs(map);
      });
  }, [trades]);

  const options = useMemo(() => {
    const uniq = (key) => [...new Set(trades.map((t) => t[key]).filter(Boolean))];
    return {
      setups: uniq('setup_name'),
      instruments: uniq('instrument'),
      sessions: uniq('session'),
    };
  }, [trades]);

  const filtered = trades.filter((t) => {
    if (filters.setup && t.setup_name !== filters.setup) return false;
    if (filters.instrument && t.instrument !== filters.instrument) return false;
    if (filters.session && t.session !== filters.session) return false;
    if (filters.result && t.result !== filters.result) return false;
    return true;
  });

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Trades</h1>
        <Link to="/log">
          <button className="primary">+ Log Trade</button>
        </Link>
      </div>

      <div className="card scroll-x" style={{ display: 'flex', gap: 8, marginBottom: 16, padding: 10 }}>
        <select value={filters.setup} onChange={(e) => setFilters((f) => ({ ...f, setup: e.target.value }))}>
          <option value="">All setups</option>
          {options.setups.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.instrument} onChange={(e) => setFilters((f) => ({ ...f, instrument: e.target.value }))}>
          <option value="">All instruments</option>
          {options.instruments.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.session} onChange={(e) => setFilters((f) => ({ ...f, session: e.target.value }))}>
          <option value="">All sessions</option>
          {options.sessions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filters.result} onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}>
          <option value="">All results</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="BE">BE</option>
        </select>
      </div>

      {loading && <div className="empty-state">Loading…</div>}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">No trades yet. Log your first one.</div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.map((t) => (
          <Link key={t.id} to={`/trades/${t.id}`} className="trade-row">
            {thumbs[t.id] ? (
              <img src={thumbs[t.id]} className="trade-thumb" alt="" />
            ) : (
              <div className="trade-thumb" />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600 }}>
                <span>{t.trade_date}</span>
                <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>
                  {t.instrument} {t.option_type}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {t.setup_name || 'No setup'} · {t.session || '—'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={t.outcome_r > 0 ? 'positive' : t.outcome_r < 0 ? 'negative' : 'neutral'} style={{ fontWeight: 700 }}>
                {formatR(t.outcome_r)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'uppercase' }}>{t.result || '—'}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
