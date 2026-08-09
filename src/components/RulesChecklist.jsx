// checklist: [{rule, checked}]
export default function RulesChecklist({ checklist, onChange }) {
  function toggle(index) {
    const next = checklist.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item));
    onChange(next);
  }

  function updateRule(index, text) {
    const next = checklist.map((item, i) => (i === index ? { ...item, rule: text } : item));
    onChange(next);
  }

  function removeRule(index) {
    onChange(checklist.filter((_, i) => i !== index));
  }

  function addRule() {
    onChange([...checklist, { rule: '', checked: false }]);
  }

  const allChecked = checklist.length > 0 && checklist.every((r) => r.checked);

  return (
    <div>
      {checklist.length === 0 && (
        <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
          No rules yet. Pick a setup to prefill, or add your own.
        </p>
      )}
      {checklist.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={!!item.checked}
            onChange={() => toggle(i)}
            style={{ width: 22, height: 22, minHeight: 0, flexShrink: 0, accentColor: 'var(--accent)' }}
          />
          <input
            type="text"
            value={item.rule}
            placeholder="Rule…"
            onChange={(e) => updateRule(i, e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" className="ghost" onClick={() => removeRule(i)} style={{ minHeight: 36, padding: '6px 10px' }}>
            ✕
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button type="button" onClick={addRule} style={{ minHeight: 36, padding: '6px 12px' }}>
          + Add rule
        </button>
        {checklist.length > 0 && (
          <span className={allChecked ? 'positive' : 'negative'} style={{ fontSize: 13, fontWeight: 700 }}>
            {allChecked ? '✓ Rules followed' : '✕ Rules broken'}
          </span>
        )}
      </div>
    </div>
  );
}
