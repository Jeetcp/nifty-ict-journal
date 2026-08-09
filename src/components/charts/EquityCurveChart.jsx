import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

export default function EquityCurveChart({ data }) {
  if (data.length === 0) return <div className="empty-state">No trades yet</div>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="index" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} />
        <ReferenceLine y={0} stroke="var(--border)" />
        <Tooltip
          contentStyle={{ background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
          formatter={(value) => [`${value.toFixed(2)}R`, 'Cumulative R']}
        />
        <Line type="monotone" dataKey="r" stroke="var(--accent)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
