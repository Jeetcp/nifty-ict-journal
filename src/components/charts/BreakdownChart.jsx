import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { formatR } from '../../lib/calculations';

// data: [{key, count, winRate, totalR, avgR}]
// Desktop: bar chart of totalR per group. Mobile: a compact row list (not a squished chart).
export default function BreakdownChart({ data, metric = 'totalR', showWinRate = true }) {
  if (data.length === 0) return <div className="empty-state">No data yet</div>;

  return (
    <>
      <div className="chart-desktop">
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 42)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} />
            <YAxis type="category" dataKey="key" width={110} tick={{ fontSize: 12, fill: 'var(--text)' }} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(value) => (metric === 'totalR' ? [formatR(value), 'Total R'] : [value, 'Count'])}
            />
            <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={metric === 'totalR' ? (d[metric] >= 0 ? 'var(--green)' : 'var(--red)') : 'var(--amber)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-mobile-list">
        {data.map((d) => (
          <div key={d.key} className="breakdown-row">
            <div className="breakdown-row-label">
              <span>{d.key}</span>
              <span style={{ color: 'var(--text-faint)', fontSize: 11 }}>{d.count} trades</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {showWinRate && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{(d.winRate * 100).toFixed(0)}% WR</span>}
              {metric === 'totalR' ? (
                <span className={d.totalR >= 0 ? 'positive' : 'negative'} style={{ fontWeight: 700 }}>
                  {formatR(d.totalR)}
                </span>
              ) : (
                <span style={{ fontWeight: 700 }}>{d[metric]}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
