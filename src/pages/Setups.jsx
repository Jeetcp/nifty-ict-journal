import { useState } from 'react';
import { useSetups } from '../hooks/useSetups';

export default function Setups() {
  const { setups, createSetup, updateSetup, deleteSetup } = useSetups();
  const [newName, setNewName] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createSetup(newName.trim(), []);
    setNewName('');
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Setups</h1>

      <form onSubmit={handleCreate} className="card" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New setup name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="primary">Add</button>
      </form>

      {setups.length === 0 && <div className="empty-state">No setups yet. Add your first ICT model above.</div>}

      {setups.map((setup) => (
        <SetupCard key={setup.id} setup={setup} onUpdate={updateSetup} onDelete={deleteSetup} />
      ))}
    </div>
  );
}

function SetupCard({ setup, onUpdate, onDelete }) {
  const [rules, setRules] = useState(setup.default_rules ?? []);
  const [newRule, setNewRule] = useState('');
  const [dirty, setDirty] = useState(false);

  function addRule() {
    if (!newRule.trim()) return;
    setRules([...rules, newRule.trim()]);
    setNewRule('');
    setDirty(true);
  }

  function removeRule(i) {
    setRules(rules.filter((_, idx) => idx !== i));
    setDirty(true);
  }

  async function save() {
    await onUpdate(setup.id, { default_rules: rules });
    setDirty(false);
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <strong>{setup.name}</strong>
        <button
          className="danger"
          onClick={() => confirm(`Delete setup "${setup.name}"?`) && onDelete(setup.id)}
          style={{ minHeight: 32, padding: '4px 10px' }}
        >
          Delete
        </button>
      </div>

      <label>Default rules checklist</label>
      {rules.map((rule, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span style={{ flex: 1, fontSize: 14 }}>{rule}</span>
          <button type="button" className="ghost" onClick={() => removeRule(i)} style={{ minHeight: 28, padding: '2px 8px' }}>
            ✕
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          type="text"
          placeholder="Add rule…"
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
          style={{ flex: 1 }}
        />
        <button type="button" onClick={addRule} style={{ minHeight: 40, padding: '6px 12px' }}>
          Add
        </button>
      </div>

      {dirty && (
        <button className="primary" onClick={save} style={{ marginTop: 12, width: '100%' }}>
          Save changes
        </button>
      )}
    </div>
  );
}
