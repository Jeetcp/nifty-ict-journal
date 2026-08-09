import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ImagePanel from '../components/ImagePanel';
import { deleteTrade, fetchTrade } from '../hooks/useTrades';
import { formatDuration, formatR } from '../lib/calculations';

export default function TradeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    fetchTrade(id).then(setTrade);
  }, [id]);

  if (!trade) return <div className="container empty-state">Loading…</div>;

  async function handleDelete() {
    if (!confirm('Delete this trade permanently?')) return;
    await deleteTrade(id);
    navigate('/trades');
  }

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>
            {trade.instrument} {trade.option_type} · {trade.trade_date}
          </h1>
          <p style={{ color: 'var(--text-dim)', margin: '4px 0 0' }}>{trade.setup_name || 'No setup'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/log/${id}`}>
            <button>Edit</button>
          </Link>
          <button className="danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="stat-cards" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="label">Outcome</div>
          <div className={`value ${trade.outcome_r > 0 ? 'positive' : trade.outcome_r < 0 ? 'negative' : ''}`}>
            {formatR(trade.outcome_r)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Risk</div>
          <div className="value">{trade.risk_r != null ? `${trade.risk_r}R` : '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Result</div>
          <div className="value">{trade.result ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Duration</div>
          <div className="value">{formatDuration(trade.duration_seconds)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Rules</div>
          <div className={`value ${trade.rules_followed ? 'positive' : trade.rules_followed === false ? 'negative' : ''}`}>
            {trade.rules_followed == null ? '—' : trade.rules_followed ? 'Followed' : 'Broken'}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">Session</div>
          <div className="value" style={{ fontSize: 16 }}>{trade.session || '—'}</div>
        </div>
      </div>

      <div className="section-title">Trade details</div>
      <div className="card">
        <div className="form-grid cols-3" style={{ rowGap: 12 }}>
          <Detail label="Direction" value={trade.direction} />
          <Detail label="Strike" value={trade.strike} />
          <Detail label="Expiry" value={trade.expiry} />
          <Detail label="Entry premium" value={trade.entry_premium} />
          <Detail label="Exit premium" value={trade.exit_premium} />
          <Detail label="Stop" value={trade.stop} />
          <Detail label="Target" value={trade.target} />
          <Detail label="Entry time" value={trade.entry_time ? new Date(trade.entry_time).toLocaleString() : null} />
          <Detail label="Exit time" value={trade.exit_time ? new Date(trade.exit_time).toLocaleString() : null} />
          <Detail label="Mistake / leak" value={trade.mistake_tag} />
          <Detail label="Emotion" value={trade.emotion} />
        </div>
        {trade.custom_fields?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            {trade.custom_fields.map((f, i) => (
              <Detail key={i} label={f.name} value={f.value} />
            ))}
          </div>
        )}
        {trade.note && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 4 }}>NOTE</div>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{trade.note}</p>
          </div>
        )}
      </div>

      {trade.rules_checklist?.length > 0 && (
        <>
          <div className="section-title">Rules checklist</div>
          <div className="card">
            {trade.rules_checklist.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
                <span className={r.checked ? 'positive' : 'negative'}>{r.checked ? '✓' : '✕'}</span>
                <span>{r.rule}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">Screenshots</div>
      <ImagePanel tradeId={id} />
    </div>
  );
}

function Detail({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div>{String(value)}</div>
    </div>
  );
}
