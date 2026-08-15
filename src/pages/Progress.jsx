import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { T } from '../lib/theme.js';

export default function Progress() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(params.get('log') === '1');

  const [form, setForm] = useState({ weight_kg: '', waist_cm: '', hips_cm: '', arms_cm: '', notes: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    const { data } = await supabase.from('body_stats').select('*').eq('user_id', user.id).order('logged_at', { ascending: true });
    setEntries(data || []);
    // sign photo urls
    const withPhotos = (data || []).filter((e) => e.photo_url);
    const urls = {};
    await Promise.all(
      withPhotos.map(async (e) => {
        const { data: signed } = await supabase.storage.from('progress-photos').createSignedUrl(e.photo_url, 3600);
        if (signed?.signedUrl) urls[e.id] = signed.signedUrl;
      })
    );
    setPhotoUrls(urls);
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const save = async () => {
    setError(null);
    if (!form.weight_kg && !file && !form.waist_cm && !form.notes) {
      setError('Add at least a weight, measurement or photo.');
      return;
    }
    setSaving(true);
    let photoPath = null;
    if (file) {
      const ext = file.name.split('.').pop();
      photoPath = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('progress-photos').upload(photoPath, file);
      if (upErr) {
        setError('Photo upload failed: ' + upErr.message);
        setSaving(false);
        return;
      }
    }
    const { error: insErr } = await supabase.from('body_stats').insert({
      user_id: user.id,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
      hips_cm: form.hips_cm ? parseFloat(form.hips_cm) : null,
      arms_cm: form.arms_cm ? parseFloat(form.arms_cm) : null,
      photo_url: photoPath,
      notes: form.notes || null,
    });
    setSaving(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    setForm({ weight_kg: '', waist_cm: '', hips_cm: '', arms_cm: '', notes: '' });
    setFile(null);
    setShowForm(false);
    load();
  };

  const chartData = useMemo(
    () => entries.filter((e) => e.weight_kg != null).map((e) => ({ date: format(new Date(e.logged_at), 'd MMM'), weight: Number(e.weight_kg) })),
    [entries]
  );

  const latest = [...entries].reverse().find((e) => e.weight_kg != null);
  const first = entries.find((e) => e.weight_kg != null);
  const delta = latest && first ? Number(latest.weight_kg) - Number(first.weight_kg) : null;

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="eyebrow">Body stats</div>
          <h1 className="h-title">Progress</h1>
        </div>
        <button className="btn btn-sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Close' : '+ Log'}</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={styles.formGrid}>
            <Field label="Weight (kg)" value={form.weight_kg} onChange={(v) => setForm({ ...form, weight_kg: v })} />
            <Field label="Waist (cm)" value={form.waist_cm} onChange={(v) => setForm({ ...form, waist_cm: v })} />
            <Field label="Hips (cm)" value={form.hips_cm} onChange={(v) => setForm({ ...form, hips_cm: v })} />
            <Field label="Arms (cm)" value={form.arms_cm} onChange={(v) => setForm({ ...form, arms_cm: v })} />
          </div>
          <label style={styles.lbl}>Progress photo (private to you)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ marginBottom: 12, fontSize: 13 }} />
          <label style={styles.lbl}>Notes</label>
          <textarea className="input" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="How you’re feeling, energy, sleep…" />
          {error && <div style={styles.error}>{error}</div>}
          <button className="btn" style={{ marginTop: 12 }} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save entry'}</button>
        </div>
      )}

      {chartData.length >= 2 && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={styles.chartHead}>
            <div>
              <div style={styles.chartVal}>{latest?.weight_kg}kg</div>
              <div className="muted" style={{ fontSize: 12 }}>Latest weight</div>
            </div>
            {delta != null && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...styles.chartVal, color: delta <= 0 ? '#0a8f3c' : T.coral, fontSize: 22 }}>{delta > 0 ? '+' : ''}{delta.toFixed(1)}kg</div>
                <div className="muted" style={{ fontSize: 12 }}>since start</div>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: T.muted }} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: T.muted }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 13 }} />
              <Line type="monotone" dataKey="weight" stroke={T.pink} strokeWidth={2.5} dot={{ r: 3, fill: T.pink }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 style={{ fontSize: 22, margin: '24px 0 10px' }}>Timeline</h2>
      {entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 30 }}>📸</div>
          <p className="muted" style={{ marginTop: 6 }}>No entries yet. Log your weight and a photo to start tracking change over time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...entries].reverse().map((e) => (
            <div key={e.id} className="card" style={styles.entry}>
              {photoUrls[e.id] && <img src={photoUrls[e.id]} alt="progress" style={styles.thumb} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{format(new Date(e.logged_at), 'EEEE d MMM yyyy')}</div>
                <div style={styles.stats}>
                  {e.weight_kg != null && <span>⚖️ {e.weight_kg}kg</span>}
                  {e.waist_cm != null && <span>Waist {e.waist_cm}</span>}
                  {e.hips_cm != null && <span>Hips {e.hips_cm}</span>}
                  {e.arms_cm != null && <span>Arms {e.arms_cm}</span>}
                </div>
                {e.notes && <div className="muted" style={{ fontSize: 12.5, marginTop: 5 }}>{e.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={styles.lbl}>{label}</span>
      <input className="input" type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

const styles = {
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 },
  lbl: { display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', marginBottom: 5 },
  error: { color: '#c0263a', fontSize: 13, background: '#fdecef', padding: '9px 11px', borderRadius: 10, marginTop: 10 },
  chartHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  chartVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, lineHeight: 1, color: T.pink },
  entry: { display: 'flex', gap: 12, padding: 14, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 },
  stats: { display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12.5, color: 'var(--muted)', marginTop: 4, fontWeight: 600 },
};
