import { useEffect, useRef, useState } from 'react';

// Handles paste (Ctrl+V), drag-and-drop, file picker, and phone camera roll.
// Calls onFiles(File[]) whenever new images are ready to upload.
export default function ImageUploader({ onFiles, uploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const zoneRef = useRef(null);

  useEffect(() => {
    function handlePaste(e) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = [];
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) {
        e.preventDefault();
        onFiles(files);
      }
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFiles]);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const files = [...(e.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  }

  function handleFilePick(e) {
    const files = [...(e.target.files ?? [])];
    if (files.length) onFiles(files);
    e.target.value = '';
  }

  return (
    <div
      ref={zoneRef}
      className={`dropzone${dragging ? ' dragging' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFilePick}
        style={{ display: 'none' }}
      />
      {uploading ? (
        <span className="spinner" />
      ) : (
        <>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
          <div style={{ fontWeight: 600 }}>Paste, drop, or tap to add screenshots</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Ctrl+V a chart · drag files · or use your camera roll</div>
        </>
      )}
    </div>
  );
}
