import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI, kpiAPI, stockAPI, pannesAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { RefreshCw, TrendingUp, AlertTriangle, Package, Clock, Cpu, Activity, CheckCircle, Zap } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: 'var(--muted2)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color || 'var(--white)', fontWeight: 600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

function KPICard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card animate-in" style={{ borderTop: `2px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value ?? '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function AlertRow({ icon, title, sub, color, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(30,53,96,.4)' }}>
      <div style={{ fontSize: 16, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
      </div>
      {badge && <span className="badge" style={{ background: `${color}20`, color, fontSize: 10, flexShrink: 0 }}>{badge}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const [data,          setData]          = useState(null);
  const [kpis,          setKpis]          = useState([]);
  const [stockAlertes,  setStockAlertes]  = useState([]);
  const [pannesOuvertes,setPannesOuvertes]= useState([]);
  const [loading,       setLoading]       = useState(true);
  const [lastRefresh,   setLastRefresh]   = useState(new Date());

  const load = useCallback(async () => {
    try {
      const [dRes, kRes, sRes, pRes] = await Promise.all([
        dashboardAPI.get(),
        kpiAPI.getAll('mois').catch(() => ({ data: [] })),
        stockAPI.getAlertes().catch(() => ({ data: [] })),
        pannesAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setData(dRes.data);
      setKpis(kRes.data);
      setStockAlertes(sRes.data);
      setPannesOuvertes(pRes.data.filter(p => ['DECLAREE', 'EN_COURS'].includes(p.statut)));
      setLastRefresh(new Date());
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, [load]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
      <div className="loading-spinner" />
      <div style={{ color: 'var(--muted2)', fontSize: 13 }}>Chargement du tableau de bord…</div>
    </div>
  );

  if (!data) return <div className="loading">Impossible de charger le tableau de bord</div>;

  const barData = [
    { name: 'Planifiées', v: data.interventionsPlanifiees || 0, fill: '#3b82f6' },
    { name: 'En cours',   v: data.interventionsEnCours    || 0, fill: '#f59e0b' },
    { name: 'Terminées',  v: data.interventionsTerminees  || 0, fill: '#10b981' },
    { name: 'En retard',  v: data.interventionsEnRetard   || 0, fill: '#ef4444' },
  ];

  const pieData = [
    { name: 'En service',    value: data.machinesEnService    || 0 },
    { name: 'Maintenance',   value: data.machinesEnMaintenance|| 0 },
    { name: 'Hors service',  value: data.machinesHorsService  || 0 },
  ].filter(x => x.value > 0);

  const avgOEE  = kpis.length ? (kpis.reduce((s, k) => s + (k.oee  || 0), 0) / kpis.length).toFixed(1) : '—';
  const avgMTBF = kpis.length ? (kpis.reduce((s, k) => s + (k.mtbf || 0), 0) / kpis.length).toFixed(1) : '—';

  const critiques = pannesOuvertes.filter(p => p.urgence === 'CRITIQUE');
  const ruptures  = stockAlertes.filter(s => s.enRupture);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Tableau de bord</h1>
          <p className="page-subtitle">
            Vue industrielle temps réel · Mis à jour à {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Critical alert banner */}
      {(critiques.length > 0 || ruptures.length > 0) && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--danger)' }}>
            <strong>Alertes critiques — </strong>
            {critiques.length > 0 && `${critiques.length} panne(s) critique(s) en attente · `}
            {ruptures.length  > 0 && `${ruptures.length} rupture(s) de stock`}
          </span>
        </div>
      )}

      {/* KPI Row 1 */}
      <div className="grid-4">
        <KPICard icon={Cpu}          label="Machines"          value={data.totalMachines}           color="var(--accent)"  sub={`${data.machinesEnService} en service`} />
        <KPICard icon={CheckCircle}  label="Terminées ce mois" value={data.interventionsTerminees}   color="var(--success)" />
        <KPICard icon={Clock}        label="En retard"          value={data.interventionsEnRetard}    color="var(--danger)"  />
        <KPICard icon={TrendingUp}   label="Taux réalisation"  value={`${data.tauxRealisationPlanning ?? 0}%`} color="var(--warning)" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid-4">
        <KPICard icon={Activity}     label="OEE moyen"         value={`${avgOEE}%`}                 color="var(--accent3)" sub="Efficacité globale" />
        <KPICard icon={Zap}          label="MTBF moyen"        value={`${avgMTBF}h`}               color="var(--accent2)" sub="Entre pannes" />
        <KPICard icon={AlertTriangle} label="Pannes ouvertes"  value={pannesOuvertes.length}
          color={pannesOuvertes.length ? 'var(--danger)' : 'var(--success)'}
          sub={critiques.length > 0 ? `⚠️ ${critiques.length} critique(s)` : 'Aucune critique'} />
        <KPICard icon={Package}      label="Stock en alerte"   value={stockAlertes.length}
          color={stockAlertes.length ? 'var(--warning)' : 'var(--success)'}
          sub={`${ruptures.length} rupture(s)`} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 16 }}>Interventions du mois</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} />
              <YAxis stroke="var(--muted)" fontSize={11} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="v" name="Interventions" radius={[5, 5, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 12 }}>Statut machines</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={4} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {pieData.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i] }} />
                  <span style={{ flex: 1, color: 'var(--muted2)' }}>{p.name}</span>
                  <span style={{ fontWeight: 700 }}>{p.value}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="empty" style={{ padding: '20px 0' }}>Aucune machine</div>
          )}
        </div>
      </div>

      {/* Bottom 3 panels */}
      <div className="grid-3">
        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 12, color: 'var(--warning)' }}>⚠️ Prochaines (7j)</h3>
          {data.prochainesInterventions?.length
            ? data.prochainesInterventions.slice(0, 5).map(i =>
                <AlertRow key={i.id} icon="📅" title={i.machineNom}
                  sub={i.datePlanifiee ? new Date(i.datePlanifiee).toLocaleDateString('fr-FR', { weekday:'short', day:'numeric', month:'short' }) : '—'}
                  color="var(--warning)" badge={i.statut} />
              )
            : <div className="empty" style={{ padding: '20px 0' }}>✅ Aucune prévue</div>
          }
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 12, color: 'var(--danger)' }}>🚨 Pannes ouvertes</h3>
          {pannesOuvertes.length
            ? pannesOuvertes.slice(0, 5).map(p =>
                <AlertRow key={p.id}
                  icon={p.urgence === 'CRITIQUE' ? '🔴' : p.urgence === 'HAUTE' ? '🟠' : '🟡'}
                  title={p.titre} sub={p.machineNom}
                  color={p.urgence === 'CRITIQUE' ? 'var(--danger)' : 'var(--warning)'}
                  badge={p.urgence} />
              )
            : <div className="empty" style={{ padding: '20px 0', color: 'var(--success)' }}>✅ Aucune panne</div>
          }
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 12, color: 'var(--accent)' }}>📦 Stock critique</h3>
          {stockAlertes.length
            ? stockAlertes.slice(0, 5).map(p =>
                <AlertRow key={p.id}
                  icon={p.enRupture ? '🔴' : '⚠️'}
                  title={p.designation}
                  sub={`${p.quantiteStock} ${p.unite || 'unités'} · min: ${p.seuilAlerteMin}`}
                  color={p.enRupture ? 'var(--danger)' : 'var(--warning)'}
                  badge={p.enRupture ? 'RUPTURE' : 'ALERTE'} />
              )
            : <div className="empty" style={{ padding: '20px 0', color: 'var(--success)' }}>✅ Stock nominal</div>
          }
        </div>
      </div>

      {/* Retard table */}
      {data.interventionsEnRetardList?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 12, color: 'var(--danger)' }}>
            🕐 Interventions en retard ({data.interventionsEnRetardList.length})
          </h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Machine</th><th>Prévue le</th><th>Technicien</th><th>Dépassement</th></tr></thead>
              <tbody>
                {data.interventionsEnRetardList.map(i => {
                  const heures = i.datePlanifiee
                    ? Math.floor((Date.now() - new Date(i.datePlanifiee)) / 3600000)
                    : 0;
                  return (
                    <tr key={i.id}>
                      <td><strong>{i.machineNom}</strong></td>
                      <td style={{ color: 'var(--danger)', fontSize: 12 }}>
                        {i.datePlanifiee ? new Date(i.datePlanifiee).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' }) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted2)' }}>{i.technicienNom || '—'}</td>
                      <td>
                        <span className="badge badge-danger" style={{ fontSize: 10 }}>
                          +{heures}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
