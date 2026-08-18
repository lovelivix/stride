import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { T } from '../lib/theme.js';

const CATEGORIES = [
  { id: 'idea', label: '💡 Idea', color: T.pink },
  { id: 'bug', label: '🐛 Bug', color: T.coral },
  { id: 'love', label: '❤️ Love it', color: '#E0912B' },
  { id: 'priority', label: '🎯 Priority', color: '#8B6FE8' },
];

const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export default function Feedback() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [category, setCategory] = useState('idea');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const { data, error: err } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    if (err) setError('The feedback list isn’t set up yet — run the one-time SQL Claude gave you in Supabase.');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('feedback').insert({
      user_id: user.id,
      user_name: profile?.name || 'Someone',
      text: text.trim(),
      category,
    });
    setSaving(false);
    if (err) {
      setError('Couldn’t save — the feedback table may not be set up yet (run the SQL in Supabase).');
      return;
    }
    setText('');
    setCategory('idea');
    load();
  };

  const toggleDone = async (item) => {
    if (item.user_id !== user.id) return; // only your own
    await supabase.from('feedback').update({ status: item.status === 'done' ? 'open' : 'done' }).eq('id', item.id);
    load();
  };

  const copyForClaude = async () => {
    const open = items.filter((i) => i.status !== 'done');
    const list = open
      .map((i, n) => `${n + 1}. [${catMeta(i.category).label.replace(/^\S+\s/, '')}] ${i.text} — ${i.user_name}`)
      .join('\n');
    const payload = `STRIDE improvement list:\n\n${list || '(no open items)'}`;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Couldn’t copy automatically — select the list below and copy manually.');
    }
  };

  const openCount = items.filter((i) => i.status !== 'done').length;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <button style={styles.back} onClick={() => navigate(-1)}>‹</button>
        <div>
          <div className="eyebrow">Help shape STRIDE</div>
          <h1 style={{ fontSize: 34 }}>Improvements</h1>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 4 }}>
        Jot down anything — an idea, a bug, something you love. The whole family’s notes collect here, and you can copy
        the list to send to Claude.
      </p>

      {/* Composer */}
      <div className="card" style={{ marginTop: 14 }}>
        <div style={styles.chips}>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`chip ${category === c.id ? 'active' : ''}`}>
              {c.label}
            </button>
          ))}
        </div>
        <textarea
          className="input"
          rows="3"
          style={{ marginTop: 10 }}
          placeholder="What would make STRIDE better?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button className="btn" style={{ marginTop: 10 }} disabled={saving || !text.trim()} onClick={submit}>
          {saving ? 'Saving…' : 'Add to the list'}
        </button>
      </div>

      {/* List */}
      <div style={styles.sectionHead}>
        <h2 style={{ fontSize: 22 }}>The list {openCount ? `(${openCount})` : ''}</h2>
        {items.length > 0 && (
          <button style={styles.copyBtn} onClick={copyForClaude}>{copied ? 'Copied ✓' : '📋 Copy for Claude'}</button>
        )}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28 }}>💡</div>
          <p className="muted" style={{ marginTop: 6 }}>No notes yet. Add the first idea above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((i) => {
            const meta = catMeta(i.category);
            const done = i.status === 'done';
            const mine = i.user_id === user.id;
            return (
              <div key={i.id} className="card" style={{ ...styles.item, opacity: done ? 0.55 : 1 }}>
                <button
                  onClick={() => toggleDone(i)}
                  title={mine ? 'Mark done' : 'Only the author can tick this off'}
                  style={{ ...styles.checkbox, ...(done ? styles.checkboxDone : {}), cursor: mine ? 'pointer' : 'default' }}
                >
                  {done ? '✓' : ''}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none' }}>{i.text}</div>
                  <div style={styles.meta}>
                    <span style={{ ...styles.catTag, color: meta.color, borderColor: meta.color }}>{meta.label}</span>
                    <span className="muted">{i.user_name} · {format(new Date(i.created_at), 'd MMM')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  back: { fontSize: 30, color: 'var(--muted)', width: 34, height: 34, lineHeight: 1 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  error: { color: '#c0263a', fontSize: 12.5, background: '#fdecef', padding: '9px 11px', borderRadius: 10, marginTop: 10, lineHeight: 1.4 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 10px' },
  copyBtn: { fontSize: 12.5, fontWeight: 700, color: 'var(--pink)', background: '#fff2f5', padding: '7px 12px', borderRadius: 999 },
  item: { display: 'flex', gap: 12, padding: 13, alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderRadius: 7, border: '1.5px solid var(--border)', background: 'var(--white)', color: '#093', fontSize: 14, flexShrink: 0, marginTop: 1 },
  checkboxDone: { background: T.lime, borderColor: T.lime },
  meta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 11.5, fontWeight: 600, flexWrap: 'wrap' },
  catTag: { fontSize: 10.5, fontWeight: 700, border: '1px solid', padding: '2px 7px', borderRadius: 999 },
};
