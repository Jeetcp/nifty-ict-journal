export default function StatCard({ label, value, tone }) {
  const colorClass = tone === 'positive' ? 'positive' : tone === 'negative' ? 'negative' : '';
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className={`value ${colorClass}`}>{value}</div>
    </div>
  );
}
