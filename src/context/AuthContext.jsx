import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'journal_auth_ok';
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD;

export function AuthProvider({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true');

  function tryUnlock(password) {
    if (!APP_PASSWORD || password === APP_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      return true;
    }
    return false;
  }

  function lock() {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
  }

  return (
    <AuthContext.Provider value={{ unlocked, tryUnlock, lock }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
