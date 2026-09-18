import React, { useState } from 'react';

export default function FocusYouTubePlayer() {
  const [inputUrl, setInputUrl] = useState('');
  const [activeVideoId, setActiveVideoId] = useState('');
  const [error, setError] = useState('');

  const extractVideoId = (url) => {
    const trimmed = url.trim();
    // Handle bare 11-char video IDs
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const id = extractVideoId(inputUrl);
    if (id) {
      setActiveVideoId(id);
      setInputUrl('');
    } else {
      setError('Could not find a valid YouTube video ID. Try pasting the full link.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '8px 0' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Paste a YouTube link to watch distraction-free..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #ccc)',
            fontSize: '1rem',
            backgroundColor: 'var(--input-bg, #fff)',
            color: 'var(--text-primary, #111)',
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '10px 22px', borderRadius: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          Watch
        </button>
      </form>

      {error && (
        <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</p>
      )}

      {activeVideoId ? (
        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: '10px',
            backgroundColor: '#000',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${activeVideoId}?rel=0&modestbranding=1&iv_load_policy=3&autoplay=1`}
            title="Focus YouTube Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            border: '2px dashed var(--border-color, #ddd)',
            borderRadius: '10px',
            color: 'var(--text-secondary, #888)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', opacity: 0.5 }}>
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon>
          </svg>
          <p style={{ margin: 0, fontSize: '1rem' }}>Paste a YouTube link above to watch without sidebar recommendations, shorts, or comments.</p>
        </div>
      )}
    </div>
  );
}
