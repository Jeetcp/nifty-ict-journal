// Big-tap-target quick-pick buttons for fast mobile logging.
// `options` is an array of strings, or {value, label} objects.
export default function QuickPicks({ options, value, onChange, resultColors = false, allowCustom = true }) {
  function normalize(opt) {
    return typeof opt === 'string' ? { value: opt, label: opt } : opt;
  }

  function resultClass(optValue) {
    if (!resultColors) return '';
    const v = String(optValue).toLowerCase();
    if (v === 'win') return 'result-win';
    if (v === 'loss') return 'result-loss';
    if (v === 'be') return 'result-be';
    return '';
  }

  const normalized = options.map(normalize);
  const isCustomValue = value && allowCustom && !normalized.some((o) => o.value === value);

  return (
    <div>
      <div className="quick-picks">
        {normalized.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`quick-pick-btn${value === opt.value ? ' selected ' + resultClass(opt.value) : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {allowCustom && (
        <input
          style={{ marginTop: 8 }}
          type="text"
          placeholder="Or type custom…"
          value={isCustomValue ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
