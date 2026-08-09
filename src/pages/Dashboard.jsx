import { useMemo, useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import StatCard from '../components/StatCard';
import EquityCurveChart from '../components/charts/EquityCurveChart';
import BreakdownChart from '../components/charts/BreakdownChart';
import {
  expectancy,
  profitFactor,
  winRate,
  totalR,
  currentStreak,
  equityCurve,
  bySetup,
  bySession,
  byDayOfWeek,
  rulesComparison,
  mistakeFrequency,
  durationByOutcome,
  formatR,
  formatDuration,
} from '../lib/calculations';

const RANGE_OPTIONS = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
];

export default function Dashboard() {
  const { trades, loading } = useTrades();
  const [range, setRange] = useState('all');
  const [setupFilter, setSetupFilter] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');

  const options = useMemo(() => {
    const uniq = (key) => [...new Set(trades.map((t) => t[key]).filter(Boolean))];
    return { setups: uniq('setup_name'), instruments: uniq('instrument') };
  }, [trades]);

  const filtered = useMemo(() => {
    const now = new Date();
    return trades.filter((t) => {
      if (!t.trade_date) return false;
      if (setupFilter && t.setup_name !== setupFilter) return false;
      if (instrumentFilter && t.instrument !== instrumentFilter) return false;
      if (range === 'all') return true;
      const d = new Date(t.trade_date + 'T00:00:00');
      if (range === 'week') {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        return d >= start;
      }
      if (range === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [trades, range, setupFilter, instrumentFilter]);

  const streak = currentStreak(filtered);
  const rules = rulesComparison(filtered);
  const duration = durationByOutcome(filtered);

  if (loading) return <div className="container empty-state">Loading…</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Dashboard</h1>

      <div className="filter-bar card" style={{ marginBottom: 20, padding: 10 }}>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={setupFilter} onChange={(e) => setSetupFilter(e.target.value)}>
          <option value="">All setups</option>
          {options.setups.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={instrumentFilter} onChange={(e) => setInstrumentFilter(e.target.value)}>
          <option value="">All instruments</option>
          {options.instruments.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No trades in this range yet. Log one to see your stats.</div>
      ) : (
        <>
          <div className="stat-cards" style={{ marginBottom: 24 }}>
            <StatCard label="Expectancy" value={formatR(expectancy(filtered))} tone={expectancy(filtered) >= 0 ? 'positive' : 'negative'} />
            <StatCard label="Profit Factor" value={profitFactor(filtered) === Infinity ? '∞' : profitFactor(filtered).toFixed(2)} />
            <StatCard label="Win Rate" value={`${(winRate(filtered) * 100).toFixed(0)}%`} />
            <StatCard label="Total Trades" value={filtered.length} />
            <StatCard label="Total R" value={formatR(totalR(filtered))} tone={totalR(filtered) >= 0 ? 'positive' : 'negative'} />
            <StatCard label="Streak" value={streak.count > 0 ? `${streak.count} ${streak.type}${streak.count > 1 ? 's' : ''}` : '—'} />
          </div>

          <div className="section-title">Equity Curve</div>
          <div className="card" style={{ marginBottom: 24 }}>
            <EquityCurveChart data={equityCurve(filtered)} />
          </div>

          <div className="dashboard-grid cols-2">
            <div>
              <div className="section-title">By Setup</div>
              <div className="card" style={{ marginBottom: 24 }}>
                <BreakdownChart data={bySetup(filtered)} />
              </div>
            </div>
            <div>
              <div className="section-title">By Session / Killzone</div>
              <div className="card" style={{ marginBottom: 24 }}>
                <BreakdownChart data={bySession(filtered)} />
              </div>
            </div>
          </div>

          <div className="section-title">By Day of Week</div>
          <div className="card" style={{ marginBottom: 24 }}>
            <BreakdownChart data={byDayOfWeek(filtered)} />
          </div>

          <div className="dashboard-grid cols-2">
            <div>
              <div className="section-title">Rules Followed vs Broken</div>
              <div className="card" style={{ marginBottom: 24 }}>
                {rules.every((r) => r.count === 0) ? (
                  <div className="empty-state">No rules checklists logged yet</div>
                ) : (
                  rules.map((r) => (
                    <div key={r.key} className="breakdown-row">
                      <div className="breakdown-row-label">
                        <span>{r.key}</span>
                        <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>{r.count} trades</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{(r.winRate * 100).toFixed(0)}% WR</span>
                        <span className={r.avgR >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 700 }}>
                          {formatR(r.avgR)} avg
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="section-title">Time in Trade by Outcome</div>
              <div className="card" style={{ marginBottom: 24 }}>
                {duration.map((d) => (
                  <div key={d.key} className="breakdown-row">
                    <span className="breakdown-row-label">{d.key}</span>
                    <span style={{ fontWeight: 700 }}>{formatDuration(d.avgSeconds)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-title">Mistake / Leak Frequency</div>
          <div className="card" style={{ marginBottom: 24 }}>
            <BreakdownChart data={mistakeFrequency(filtered)} metric="count" showWinRate={false} />
          </div>
        </>
      )}
    </div>
  );
}
