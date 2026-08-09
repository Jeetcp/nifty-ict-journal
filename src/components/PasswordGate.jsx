import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function PasswordGate({ children }) {
  const { unlocked, tryUnlock } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return children;

  function handleSubmit(e) {
    e.preventDefault();
    if (!tryUnlock(password)) {
      setError(true);
      setPassword('');
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <form onSubmit={handleSubmit} className="card" style={{ width: '100%', maxWidth: 340 }}>
        <h1 style={{ fontSize: 20, marginTop: 0, marginBottom: 4 }}>Trade Journal</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 0, marginBottom: 20 }}>
          Enter password to continue
        </p>
        <div className="field">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Password"
          />
        </div>
        {error && (
          <p style={{ color: 'var(--red)', fontSize: 13, marginTop: -8, marginBottom: 14 }}>
            Incorrect password
          </p>
        )}
        <button type="submit" className="primary" style={{ width: '100%' }}>
          Unlock
        </button>
      </form>
    </div>
  );
}
