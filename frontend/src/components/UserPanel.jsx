import { useState, useEffect } from 'react';
import api from '../api';

export default function UserPanel() {
  const [podcasts, setPodcasts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordingsRes, historyRes] = await Promise.all([
          api.get('/api/recordings').catch(() => ({ data: [] })),
          api.get('/api/auth/history').catch(() => ({ data: { history: [] } }))
        ]);

        const backendRecordings = recordingsRes.data || [];
        const localRecordings = JSON.parse(localStorage.getItem('localRecordings') || '[]');
        
        setPodcasts([...backendRecordings, ...localRecordings]);
        setHistory(historyRes.data?.history || []);
      } catch (err) {
        console.warn('Failed to fetch some user data, using local fallbacks', err);
        const localRecordings = JSON.parse(localStorage.getItem('localRecordings') || '[]');
        setPodcasts(localRecordings);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">User Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">My Uploaded Podcasts</h2>
            {podcasts.length === 0 ? (
              <p className="text-gray-400">No podcasts uploaded yet.</p>
            ) : (
              <ul className="space-y-4">
                {podcasts.map(p => (
                  <li key={p._id || p.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                    <div className="font-bold">{p.title}</div>
                    <div className="text-sm text-gray-400">{p.category || 'Recording'} • {new Date(p.createdAt || p.uploadedAt).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Listen History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400">No history found.</p>
            ) : (
              <ul className="space-y-4">
                {history.map((h, index) => (
                  <li key={index} className="bg-gray-800 p-4 rounded border border-gray-700">
                    <div className="font-bold">{h.podcast?.title || 'Unknown Podcast'}</div>
                    <div className="text-sm text-gray-400">Listened on {new Date(h.listenedAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

