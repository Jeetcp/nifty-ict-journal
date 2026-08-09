// custom_fields: [{name, value}]
export default function CustomFieldsEditor({ fields, onChange }) {
  function update(i, key, val) {
    onChange(fields.map((f, idx) => (idx === i ? { ...f, [key]: val } : f)));
  }

  function remove(i) {
    onChange(fields.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...fields, { name: '', value: '' }]);
  }

  return (
    <div>
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Field name"
            value={f.name}
            onChange={(e) => update(i, 'name', e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="text"
            placeholder="Value"
            value={f.value}
            onChange={(e) => update(i, 'value', e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" className="ghost" onClick={() => remove(i)} style={{ minHeight: 36, padding: '6px 10px' }}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={add} style={{ minHeight: 36, padding: '6px 12px' }}>
        + Add field
      </button>
    </div>
  );
}
