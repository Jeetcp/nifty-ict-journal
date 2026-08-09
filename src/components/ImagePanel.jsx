import { useState } from 'react';
import { useImages } from '../hooks/useImages';
import ImageUploader from './ImageUploader';
import Lightbox from './Lightbox';
import TagEditor from './TagEditor';

// Full image management panel: upload (paste/drop/pick) + grid + per-image tags & note.
export default function ImagePanel({ tradeId }) {
  const { images, uploadFile, updateImage, deleteImage } = useImages(tradeId);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);

  async function handleFiles(files) {
    setUploading(true);
    try {
      for (const file of files) {
        await uploadFile(file);
      }
    } catch (err) {
      console.error(err);
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  const editingImage = images.find((img) => img.id === editingId);

  return (
    <div>
      <ImageUploader onFiles={handleFiles} uploading={uploading} />

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((img, i) => (
            <div key={img.id} className="image-thumb" onClick={() => setLightboxIndex(i)}>
              <img src={img.url} alt="" loading="lazy" />
              {img.tags?.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    right: 4,
                    display: 'flex',
                    gap: 3,
                    flexWrap: 'wrap',
                  }}
                >
                  {img.tags.slice(0, 2).map((t, ti) => (
                    <span
                      key={ti}
                      style={{
                        background: t.color,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                className="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(img.id);
                }}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  minHeight: 0,
                  padding: '2px 6px',
                  fontSize: 11,
                  background: 'rgba(0,0,0,0.6)',
                }}
              >
                edit
              </button>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && images[lightboxIndex] && (
        <Lightbox
          image={images[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onNext={images.length > 1 ? () => setLightboxIndex((i) => (i + 1) % images.length) : undefined}
          onPrev={images.length > 1 ? () => setLightboxIndex((i) => (i - 1 + images.length) % images.length) : undefined}
        />
      )}

      {editingImage && (
        <div className="lightbox-overlay" onClick={() => setEditingId(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420, width: '100%' }}>
            <img
              src={editingImage.url}
              alt=""
              style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 8, marginBottom: 12 }}
            />
            <div className="field">
              <label>Tags</label>
              <TagEditor tags={editingImage.tags ?? []} onChange={(tags) => updateImage(editingImage.id, { tags })} />
            </div>
            <div className="field">
              <label>Note</label>
              <textarea
                defaultValue={editingImage.note ?? ''}
                placeholder="e.g. 4H bias, 15m entry sweep…"
                onBlur={(e) => updateImage(editingImage.id, { note: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <button
                type="button"
                className="danger"
                onClick={async () => {
                  if (confirm('Delete this image?')) {
                    await deleteImage(editingImage.id);
                    setEditingId(null);
                  }
                }}
              >
                Delete image
              </button>
              <button type="button" className="primary" onClick={() => setEditingId(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
