import { useEffect } from 'react';
import TagChip, { colorForText } from './TagChip';

export default function Lightbox({ image, onClose, onNext, onPrev }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext?.();
      if (e.key === 'ArrowLeft') onPrev?.();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onNext, onPrev]);

  if (!image) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button
        className="ghost"
        onClick={onClose}
        style={{ position: 'absolute', top: 12, right: 12, fontSize: 20, minHeight: 40 }}
      >
        ✕
      </button>
      {onPrev && (
        <button
          className="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{ position: 'absolute', left: 8, fontSize: 24, minHeight: 48 }}
        >
          ‹
        </button>
      )}
      {onNext && (
        <button
          className="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{ position: 'absolute', right: 8, fontSize: 24, minHeight: 48 }}
        >
          ›
        </button>
      )}
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}
      >
        <img src={image.url} alt="" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 8 }} />
        {image.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {image.tags.map((t, i) => (
              <TagChip key={i} text={t.text} color={t.color || colorForText(t.text)} />
            ))}
          </div>
        )}
        {image.note && <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>{image.note}</p>}
      </div>
    </div>
  );
}
