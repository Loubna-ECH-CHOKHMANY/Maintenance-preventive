import React, { useState, useEffect, useCallback } from 'react';
import { kpiAPI, machinesAPI } from '../services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, Cell
} from 'recharts';
import { BarChart3, RefreshCw, TrendingUp, Clock, Activity, Zap, Filter } from 'lucide-react';

const PERIODS = [
  { k: 'semaine', l: 'Semaine' },
  { k: 'mois', l: 'Mois' },
  { k: 'trimestre', l: 'Trimestre' },
  { k: 'annee', l: 'Année' },
];

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--white)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

function KpiCard({ label, value, unit, color, desc, icon: Icon }) {
  return (
    <div className="card" style={{ borderTop: `2px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.8px', fontWeight: 600 }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>
        {typeof value === 'number' ? value.toFixed(1) : value ?? '—'}
        <span style={{ fontSize: 14, fontFamily: 'DM Sans', fontWeight: 400, color: 'var(--muted2)', marginLeft: 4 }}>{unit}</span>
      </div>
      {desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, lineHeight: 1.4 }}>{desc}</div>}
    </div>
  );
}

function GaugeBar({ label, value, color }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="progress-bar" style={{ height: 8 }}>
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function KpiPage() {
  const [kpis, setKpis] = useState([]);
  const [machines, setMachines] = useState([]);
  const [periode, setPeriode] = useState('mois');
  const [machineFilter, setMachineFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [kRes, mRes] = await Promise.all([kpiAPI.getAll(periode), machinesAPI.getAll()]);
      setKpis(kRes.data);
      setMachines(mRes.data);
      if (kRes.data.length > 0 && !selected) setSelected(kRes.data[0]);
    } catch { }
    finally { setLoading(false); }
  }, [periode]);

  useEffect(() => { load(); }, [load]);

  const displayed = machineFilter ? kpis.filter(k => k.machineId === +machineFilter) : kpis;
  const sel = selected || kpis[0];

  // Chart data
  const barData = displayed.map(k => ({
    name: k.machineNom?.length > 12 ? k.machineNom.substring(0, 12) + '…' : k.machineNom,
    MTBF: k.mtbf, MTTR: k.mttr, OEE: k.oee, TRS: k.trs,
  }));

  const radarData = sel ? [
    { subject: 'Disponibilité', A: sel.disponibilite, full: 100 },
    { subject: 'Performance', A: sel.performance, full: 100 },
    { subject: 'Qualité', A: sel.qualite || 95, full: 100 },
    { subject: 'Planning', A: sel.tauxRealisationPlanning, full: 100 },
    { subject: 'OEE', A: sel.oee, full: 100 },
  ] : [];

  const paretoData = kpis
    .map(k => ({ name: k.machineNom?.substring(0, 10), pannes: k.nombrePannes || 0 }))
    .sort((a, b) => b.pannes - a.pannes);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 KPI & Performance</h1>
          <p className="page-subtitle">MTBF · MTTR · OEE · TRS · Disponibilité machines</p>
        </div>
        <div className="page-actions">
          <select value={periode} onChange={e => setPeriode(e.target.value)} style={{ maxWidth: 140 }}>
            {PERIODS.map(p => <option key={p.k} value={p.k}>{p.l}</option>)}
          </select>
          <select value={machineFilter} onChange={e => setMachineFilter(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">Toutes les machines</option>
            {machines.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /></button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="loading-spinner" /><div>Calcul des indicateurs...</div></div>
      ) : kpis.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">📊</div><div>Données insuffisantes pour calculer les KPI</div></div></div>
      ) : (
        <>
          {/* Machine selector */}
          {kpis.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {kpis.map((k, i) => (
                <button key={k.machineId} className={`btn ${sel?.machineId === k.machineId ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                  onClick={() => setSelected(k)}>
                  {k.machineNom}
                </button>
              ))}
            </div>
          )}

          {/* KPI Cards for selected machine */}
          {sel && (
            <div className="grid-4">
              <KpiCard label="MTBF" value={sel.mtbf} unit="h" color="var(--success)" icon={Clock}
                desc="Temps moyen entre pannes. Plus c'est élevé, mieux c'est." />
              <KpiCard label="MTTR" value={sel.mttr} unit="h" color="var(--warning)" icon={Zap}
                desc="Temps moyen de réparation. Plus c'est bas, mieux c'est." />
              <KpiCard label="OEE / TRS" value={sel.oee} unit="%" color="var(--accent)" icon={Activity}
                desc="Efficacité globale = Dispo × Perf × Qualité" />
              <KpiCard label="Disponibilité" value={sel.disponibilite} unit="%" color="var(--accent3)" icon={TrendingUp}
                desc="Temps machine disponible vs temps total planifié" />
            </div>
          )}

          {/* Main charts row */}
          <div className="grid-2">
            {/* Radar */}
            {sel && (
              <div className="card">
                <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 16, color: 'var(--white)' }}>
                  Radar performance — {sel.machineNom}
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" stroke="var(--muted2)" fontSize={11} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--border)" fontSize={10} />
                    <Radar name="Performance" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
                {sel && (
                  <div style={{ marginTop: 10 }}>
                    <GaugeBar label="Disponibilité" value={sel.disponibilite} color="var(--success)" />
                    <GaugeBar label="Performance" value={sel.performance} color="var(--accent)" />
                    <GaugeBar label="Qualité" value={sel.qualite || 95} color="var(--accent3)" />
                    <GaugeBar label="OEE global" value={sel.oee} color="var(--warning)" />
                  </div>
                )}
              </div>
            )}

            {/* OEE comparaison machines */}
            <div className="card">
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 16, color: 'var(--white)' }}>
                OEE comparatif machines
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--muted)" fontSize={11} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="var(--muted)" fontSize={11} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="OEE" radius={[0, 4, 4, 0]}>
                    {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MTBF / MTTR chart + Pareto */}
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 16, color: 'var(--white)' }}>
                MTBF vs MTTR (heures)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} />
                  <YAxis stroke="var(--muted)" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="MTBF" name="MTBF (h)" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MTTR" name="MTTR (h)" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pareto pannes */}
            <div className="card">
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 16, color: 'var(--white)' }}>
                Pareto — Nombre de pannes par machine
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={paretoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} />
                  <YAxis stroke="var(--muted)" fontSize={10} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pannes" name="Pannes" radius={[4, 4, 0, 0]}>
                    {paretoData.map((_, i) => <Cell key={i} fill={i === 0 ? 'var(--danger)' : i === 1 ? 'var(--warning)' : 'var(--accent)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, color: 'var(--white)' }}>Tableau récapitulatif — Période : {PERIODS.find(p => p.k === periode)?.l}</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Machine</th><th>MTBF (h)</th><th>MTTR (h)</th><th>OEE %</th><th>TRS %</th>
                    <th>Disponibilité</th><th>Performance</th><th>Pannes</th><th>Planning</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((k, i) => {
                    const oeeColor = k.oee >= 80 ? 'var(--success)' : k.oee >= 60 ? 'var(--warning)' : 'var(--danger)';
                    return (
                      <tr key={k.machineId} style={{ cursor: 'pointer' }} onClick={() => setSelected(k)}>
                        <td><strong style={{ color: 'var(--white)' }}>{k.machineNom}</strong></td>
                        <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>{k.mtbf?.toFixed(1) ?? '—'}</span></td>
                        <td><span style={{ color: 'var(--warning)', fontWeight: 600 }}>{k.mttr?.toFixed(1) ?? '—'}</span></td>
                        <td><span style={{ color: oeeColor, fontWeight: 700 }}>{k.oee?.toFixed(1) ?? '—'}%</span></td>
                        <td><span style={{ color: oeeColor }}>{k.trs?.toFixed(1) ?? '—'}%</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ width: 60, height: 5 }}>
                              <div className="progress-fill" style={{ width: `${k.disponibilite || 0}%`, background: 'var(--success)' }} />
                            </div>
                            <span style={{ fontSize: 12 }}>{k.disponibilite?.toFixed(1) ?? '—'}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>{k.performance?.toFixed(1) ?? '—'}%</td>
                        <td style={{ color: k.nombrePannes > 3 ? 'var(--danger)' : 'var(--muted2)', fontWeight: 600 }}>{k.nombrePannes ?? 0}</td>
                        <td style={{ fontSize: 12 }}>{k.tauxRealisationPlanning?.toFixed(1) ?? '—'}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
