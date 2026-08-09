export const TAG_COLORS = ['#4f8cff', '#2ecc71', '#ff5470', '#f5a623', '#a56cff', '#22c7d5', '#ff8fb3'];

export function colorForText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function TagChip({ text, color, onRemove }) {
  return (
    <span className="chip" style={{ background: `${color}26`, color, border: `1px solid ${color}66` }}>
      {text}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor: 'pointer', fontWeight: 900 }}>
          ×
        </span>
      )}
    </span>
  );
}
