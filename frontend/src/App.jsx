import { useEffect, useState } from 'react';
import api from './api';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import './styles.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Restore an existing session on page load
  useEffect(() => {
    api.get('/api/user')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await api.post('/api/logout');
    setUser(null);
  };

  return (
    <div className="page">
      <Header user={user} onLogout={logout} />
      <main className="page__main">
        {checking ? null : user ? (
          <section className="auth auth--done">
            <p>Signed in as <strong>{user.name}</strong> ({user.email})</p>
          </section>
        ) : (
          <AuthPage onAuth={setUser} />
        )}
      </main>
      <Footer />
    </div>
  );
}
