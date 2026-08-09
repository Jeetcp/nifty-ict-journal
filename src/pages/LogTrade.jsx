import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuickPicks from '../components/QuickPicks';
import RulesChecklist from '../components/RulesChecklist';
import CustomFieldsEditor from '../components/CustomFieldsEditor';
import ImagePanel from '../components/ImagePanel';
import { useSetups } from '../hooks/useSetups';
import { createDraftTrade, fetchTrade, updateTrade, deleteTrade } from '../hooks/useTrades';
import { formatDuration } from '../lib/calculations';

const SESSIONS = ['London', 'NY AM', 'NY PM', 'Asian'];
const INSTRUMENTS = ['Nifty', 'BankNifty', 'Sensex'];
const MISTAKE_TAGS = ['chased', 'moved stop', 'no confirmation', 'FOMO', 'revenge', 'early exit'];
const EMOTIONS = ['calm', 'FOMO', 'revenge', 'confident'];

const emptyForm = {
  trade_date: new Date().toISOString().slice(0, 10),
  session: '',
  instrument: '',
  option_type: '',
  strike: '',
  expiry: '',
  direction: '',
  entry_premium: '',
  exit_premium: '',
  stop: '',
  target: '',
  entry_time: '',
  exit_time: '',
  risk_r: '',
  outcome_r: '',
  result: '',
  setup_name: '',
  rules_checklist: [],
  mistake_tag: '',
  emotion: '',
  note: '',
  custom_fields: [],
};

export default function LogTrade() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { setups } = useSetups();

  const [tradeId, setTradeId] = useState(id ?? null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(isEditing ? false : true);
  const createdRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      fetchTrade(id).then((trade) => {
        setForm({ ...emptyForm, ...trade, ...toInputShape(trade) });
        setReady(true);
      });
    } else if (!createdRef.current) {
      createdRef.current = true;
      createDraftTrade().then((trade) => setTradeId(trade.id));
    }
  }, [id, isEditing]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applySetup(name) {
    set('setup_name', name);
    const setup = setups.find((s) => s.name === name);
    if (setup && form.rules_checklist.length === 0) {
      set('rules_checklist', (setup.default_rules ?? []).map((rule) => ({ rule, checked: false })));
    }
  }

  async function handleSave() {
    if (!tradeId) return;
    setSaving(true);
    try {
      const patch = toDbShape(form);
      await updateTrade(tradeId, patch);
      navigate(`/trades/${tradeId}`);
    } catch (err) {
      alert('Failed to save trade: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this trade permanently?')) return;
    await deleteTrade(tradeId);
    navigate('/trades');
  }

  const duration =
    form.entry_time && form.exit_time
      ? (new Date(form.exit_time) - new Date(form.entry_time)) / 1000
      : null;

  if (!ready) return <div className="container empty-state">Loading…</div>;

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>{isEditing ? 'Edit Trade' : 'Log Trade'}</h1>
        {isEditing && (
          <button className="danger" onClick={handleDelete} style={{ minHeight: 36, padding: '6px 12px' }}>
            Delete
          </button>
        )}
      </div>

      <div className="section-title">Core</div>
      <div className="form-grid cols-2">
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.trade_date ?? ''} onChange={(e) => set('trade_date', e.target.value)} />
        </div>
        <div className="field">
          <label>Session / Killzone</label>
          <QuickPicks options={SESSIONS} value={form.session} onChange={(v) => set('session', v)} />
        </div>
      </div>

      <div className="field">
        <label>Instrument</label>
        <QuickPicks options={INSTRUMENTS} value={form.instrument} onChange={(v) => set('instrument', v)} />
      </div>

      <div className="form-grid cols-3">
        <div className="field">
          <label>Option Type</label>
          <QuickPicks options={['CE', 'PE']} value={form.option_type} onChange={(v) => set('option_type', v)} allowCustom={false} />
        </div>
        <div className="field">
          <label>Direction</label>
          <QuickPicks options={['long', 'short']} value={form.direction} onChange={(v) => set('direction', v)} allowCustom={false} />
        </div>
        <div className="field">
          <label>Strike</label>
          <input type="number" inputMode="decimal" value={form.strike} onChange={(e) => set('strike', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Expiry</label>
        <input type="date" value={form.expiry ?? ''} onChange={(e) => set('expiry', e.target.value)} />
      </div>

      <div className="section-title">Prices</div>
      <div className="form-grid cols-2">
        <div className="field">
          <label>Entry premium</label>
          <input type="number" inputMode="decimal" value={form.entry_premium} onChange={(e) => set('entry_premium', e.target.value)} />
        </div>
        <div className="field">
          <label>Exit premium</label>
          <input type="number" inputMode="decimal" value={form.exit_premium} onChange={(e) => set('exit_premium', e.target.value)} />
        </div>
        <div className="field">
          <label>Stop</label>
          <input type="number" inputMode="decimal" value={form.stop} onChange={(e) => set('stop', e.target.value)} />
        </div>
        <div className="field">
          <label>Target</label>
          <input type="number" inputMode="decimal" value={form.target} onChange={(e) => set('target', e.target.value)} />
        </div>
      </div>

      <div className="section-title">Timing</div>
      <div className="form-grid cols-2">
        <div className="field">
          <label>Entry time</label>
          <input type="datetime-local" value={form.entry_time ?? ''} onChange={(e) => set('entry_time', e.target.value)} />
        </div>
        <div className="field">
          <label>Exit time</label>
          <input type="datetime-local" value={form.exit_time ?? ''} onChange={(e) => set('exit_time', e.target.value)} />
        </div>
      </div>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: -8 }}>
        Duration: <strong>{duration != null ? formatDuration(duration) : '—'}</strong> (auto-calculated)
      </p>

      <div className="section-title">Result</div>
      <div className="form-grid cols-2">
        <div className="field">
          <label>Risk (R)</label>
          <input type="number" inputMode="decimal" value={form.risk_r} onChange={(e) => set('risk_r', e.target.value)} />
        </div>
        <div className="field">
          <label>Outcome (R)</label>
          <input type="number" inputMode="decimal" value={form.outcome_r} onChange={(e) => set('outcome_r', e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Result</label>
        <QuickPicks options={['win', 'loss', 'BE']} value={form.result} onChange={(v) => set('result', v)} allowCustom={false} resultColors />
      </div>

      <div className="section-title">Setup & Rules</div>
      <div className="field">
        <label>Setup</label>
        <QuickPicks options={setups.map((s) => s.name)} value={form.setup_name} onChange={applySetup} />
      </div>
      <div className="field">
        <label>Rules checklist</label>
        <RulesChecklist checklist={form.rules_checklist} onChange={(v) => set('rules_checklist', v)} />
      </div>

      <div className="section-title">Psychology</div>
      <div className="form-grid cols-2">
        <div className="field">
          <label>Mistake / leak</label>
          <QuickPicks options={MISTAKE_TAGS} value={form.mistake_tag} onChange={(v) => set('mistake_tag', v)} />
        </div>
        <div className="field">
          <label>Emotion</label>
          <QuickPicks options={EMOTIONS} value={form.emotion} onChange={(v) => set('emotion', v)} />
        </div>
      </div>

      <div className="field">
        <label>Note</label>
        <textarea value={form.note ?? ''} onChange={(e) => set('note', e.target.value)} placeholder="Trade notes…" />
      </div>

      <div className="section-title">Custom fields</div>
      <div className="field">
        <CustomFieldsEditor fields={form.custom_fields ?? []} onChange={(v) => set('custom_fields', v)} />
      </div>

      <div className="section-title">Screenshots</div>
      {tradeId ? (
        <ImagePanel tradeId={tradeId} />
      ) : (
        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>Preparing image slot…</p>
      )}

      <div style={{ position: 'sticky', bottom: 76, marginTop: 28 }}>
        <button className="primary" style={{ width: '100%' }} onClick={handleSave} disabled={saving || !tradeId}>
          {saving ? 'Saving…' : 'Save Trade'}
        </button>
      </div>
    </div>
  );
}

function toInputShape(trade) {
  return {
    entry_time: trade.entry_time ? toLocalInput(trade.entry_time) : '',
    exit_time: trade.exit_time ? toLocalInput(trade.exit_time) : '',
    rules_checklist: trade.rules_checklist ?? [],
    custom_fields: trade.custom_fields ?? [],
  };
}

function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDbShape(form) {
  const num = (v) => (v === '' || v == null ? null : Number(v));
  return {
    trade_date: form.trade_date || null,
    session: form.session || null,
    instrument: form.instrument || null,
    option_type: form.option_type || null,
    strike: num(form.strike),
    expiry: form.expiry || null,
    direction: form.direction || null,
    entry_premium: num(form.entry_premium),
    exit_premium: num(form.exit_premium),
    stop: num(form.stop),
    target: num(form.target),
    entry_time: form.entry_time ? new Date(form.entry_time).toISOString() : null,
    exit_time: form.exit_time ? new Date(form.exit_time).toISOString() : null,
    risk_r: num(form.risk_r),
    outcome_r: num(form.outcome_r),
    result: form.result || null,
    setup_name: form.setup_name || null,
    rules_checklist: form.rules_checklist ?? [],
    mistake_tag: form.mistake_tag || null,
    emotion: form.emotion || null,
    note: form.note || null,
    custom_fields: form.custom_fields ?? [],
  };
}
