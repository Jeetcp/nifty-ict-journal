import { useState } from 'react';
import TagChip, { TAG_COLORS, colorForText } from './TagChip';

// tags: [{text, color}]
export default function TagEditor({ tags, onChange }) {
  const [draft, setDraft] = useState('');
  const [color, setColor] = useState(TAG_COLORS[0]);

  function addTag() {
    const text = draft.trim();
    if (!text) return;
    onChange([...tags, { text, color }]);
    setDraft('');
  }

  function removeTag(i) {
    onChange(tags.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: tags.length ? 8 : 0 }}>
        {tags.map((tag, i) => (
          <TagChip key={i} text={tag.text} color={tag.color || colorForText(tag.text)} onRemove={() => removeTag(i)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Add tag…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          style={{ flex: 1 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 24,
                height: 24,
                minHeight: 0,
                padding: 0,
                borderRadius: '50%',
                background: c,
                border: color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
        <button type="button" onClick={addTag} style={{ minHeight: 36, padding: '6px 12px' }}>
          Add
        </button>
      </div>
    </div>
  );
}
