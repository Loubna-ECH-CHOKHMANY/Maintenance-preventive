import React, { useState, useEffect, useCallback } from 'react';
import { pannesAPI, machinesAPI, utilisateursAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Plus, Search, RefreshCw, X, CheckCircle, Clock, Zap, ChevronRight, Wrench, User } from 'lucide-react';

const URGENCE_CFG = {
  CRITIQUE: { cls: 'badge-danger', color: 'var(--danger)', label: '🔴 Critique', order: 0 },
  HAUTE:    { cls: 'badge-warning', color: 'var(--warning)', label: '🟠 Haute', order: 1 },
  MOYENNE:  { cls: 'badge-info',   color: 'var(--accent)', label: '🔵 Moyenne', order: 2 },
  BASSE:    { cls: 'badge-secondary', color: 'var(--muted2)', label: '⚪ Basse', order: 3 },
};
const STATUT_CFG = {
  DECLAREE: { cls: 'badge-danger', label: '🚨 Déclarée' },
  EN_COURS: { cls: 'badge-warning', label: '⚡ En cours' },
  RESOLUE:  { cls: 'badge-info', label: '✅ Résolue' },
  VALIDEE:  { cls: 'badge-success', label: '✔️ Validée' },
  ANNULEE:  { cls: 'badge-secondary', label: '❌ Annulée' },
};

function WorkflowBadge({ statut }) {
  const steps = ['DECLAREE', 'EN_COURS', 'RESOLUE', 'VALIDEE'];
  const idx = steps.indexOf(statut);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i <= idx ? (i === idx ? 'var(--accent)' : 'var(--success)') : 'var(--border)',
            boxShadow: i === idx ? '0 0 8px var(--accent)' : 'none',
            transition: 'all .3s'
          }} />
          {i < steps.length - 1 && <div style={{ width: 12, height: 1, background: i < idx ? 'var(--success)' : 'var(--border)' }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function DeclarerModal({ onClose, onSave, machines, techs }) {
  const [f, setF] = useState({ machineId: '', technicienId: '', titre: '', description: '', urgence: 'HAUTE' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await pannesAPI.declarer({ ...f, machineId: +f.machineId, technicienId: f.technicienId ? +f.technicienId : null });
      onSave();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>🚨 Déclarer une panne</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Titre de la panne *</label><input value={f.titre} onChange={set('titre')} required placeholder="ex: Pression insuffisante compresseur..." /></div>
          <div className="grid-2">
            <div className="form-group"><label>Machine concernée *</label>
              <select value={f.machineId} onChange={set('machineId')} required>
                <option value="">-- Choisir --</option>
                {machines.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Niveau d'urgence</label>
              <select value={f.urgence} onChange={set('urgence')}>
                {Object.entries(URGENCE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Technicien assigné</label>
            <select value={f.technicienId} onChange={set('technicienId')}>
              <option value="">-- Non assigné --</option>
              {techs.filter(t => ['TECHNICIEN','CHEF_EQUIPE'].includes(t.role)).map(t => <option key={t.id} value={t.id}>{t.nomComplet}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Description détaillée</label>
            <textarea value={f.description} onChange={set('description')} rows={3} placeholder="Symptômes observés, conditions d'apparition..." />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-danger" disabled={saving}>{saving ? '…' : '🚨 Déclarer la panne'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResoudreModal({ panne, onClose, onSave }) {
  const [f, setF] = useState({
    causesIdentifiees: '', actionsCorrectivesEffectuees: '', pieceUtilisees: '',
    coutReparation: '', tempsReparationMinutes: '', signatureTechnicien: ''
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setF(x => ({ ...x, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await pannesAPI.resoudre(panne.id, { ...f, coutReparation: f.coutReparation ? +f.coutReparation : null, tempsReparationMinutes: f.tempsReparationMinutes ? +f.tempsReparationMinutes : null });
      onSave();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>🔧 Résoudre la panne — {panne.machineNom}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 8, marginBottom: 14, fontSize: 12 }}>
          <strong>{panne.titre}</strong> — Urgence : <span style={{ color: URGENCE_CFG[panne.urgence]?.color }}>{panne.urgence}</span>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Causes identifiées *</label><textarea value={f.causesIdentifiees} onChange={set('causesIdentifiees')} rows={2} required placeholder="Cause racine de la panne..." /></div>
          <div className="form-group"><label>Actions correctives effectuées *</label><textarea value={f.actionsCorrectivesEffectuees} onChange={set('actionsCorrectivesEffectuees')} rows={3} required placeholder="Détail des réparations effectuées..." /></div>
          <div className="form-group"><label>Pièces utilisées</label><input value={f.pieceUtilisees} onChange={set('pieceUtilisees')} placeholder="ex: Joint SPI 40x60, Filtre hydraulique..." /></div>
          <div className="grid-2">
            <div className="form-group"><label>Temps de réparation (min)</label><input type="number" min="0" value={f.tempsReparationMinutes} onChange={set('tempsReparationMinutes')} /></div>
            <div className="form-group"><label>Coût réparation (MAD)</label><input type="number" step="0.01" min="0" value={f.coutReparation} onChange={set('coutReparation')} /></div>
          </div>
          <div className="form-group"><label>Signature technicien</label><input value={f.signatureTechnicien} onChange={set('signatureTechnicien')} placeholder="Nom complet du technicien" /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-success" disabled={saving}>{saving ? '…' : '✅ Marquer comme résolue'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ panne, onClose, onValider, canValider }) {
  const [validating, setValidating] = useState(false);
  const handleValider = async () => {
    setValidating(true);
    try { await pannesAPI.valider(panne.id); onValider(); } catch { } finally { setValidating(false); }
  };
  const dur = panne.tempsPanneMinutes ? `${Math.floor(panne.tempsPanneMinutes / 60)}h${panne.tempsPanneMinutes % 60}m` : '—';
  const rep = panne.tempsReparationMinutes ? `${Math.floor(panne.tempsReparationMinutes / 60)}h${panne.tempsReparationMinutes % 60}m` : '—';
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <h3>{panne.titre}</h3>
            <WorkflowBadge statut={panne.statut} />
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            {[['Machine', panne.machineNom], ['Technicien', panne.technicienNom || 'Non assigné'], ['Urgence', panne.urgence], ['Statut', STATUT_CFG[panne.statut]?.label], ['Déclaration', panne.dateDeclaration ? new Date(panne.dateDeclaration).toLocaleString('fr-FR') : '—'], ['Résolution', panne.dateFinIntervention ? new Date(panne.dateFinIntervention).toLocaleString('fr-FR') : '—'], ['Temps panne', dur], ['Temps réparation', rep]].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--surface)', padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>{l}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{v || '—'}</div>
              </div>
            ))}
          </div>
          {panne.coutReparation && <div style={{ background: 'rgba(16,185,129,.08)', padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--muted2)', fontSize: 12 }}>Coût de réparation</span>
            <strong style={{ color: 'var(--success)', fontSize: 16 }}>{panne.coutReparation.toLocaleString('fr-FR')} MAD</strong>
          </div>}
          {panne.description && <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>DESCRIPTION</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{panne.description}</div></div>}
          {panne.causesIdentifiees && <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>CAUSES IDENTIFIÉES</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{panne.causesIdentifiees}</div></div>}
          {panne.actionsCorrectivesEffectuees && <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>ACTIONS CORRECTIVES</div><div style={{ fontSize: 13, lineHeight: 1.6 }}>{panne.actionsCorrectivesEffectuees}</div></div>}
          {panne.pieceUtilisees && <div><div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>PIÈCES UTILISÉES</div><div style={{ fontSize: 13 }}>{panne.pieceUtilisees}</div></div>}
          {canValider && panne.statut === 'RESOLUE' && (
            <button className="btn btn-success" onClick={handleValider} disabled={validating} style={{ marginTop: 4 }}>
              <CheckCircle size={15} /> {validating ? 'Validation...' : 'Valider la résolution'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PannesPage() {
  const { user } = useAuth();
  const [pannes, setPannes] = useState([]);
  const [machines, setMachines] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterUrgence, setFilterUrgence] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, mRes, uRes] = await Promise.all([pannesAPI.getAll(), machinesAPI.getAll(), utilisateursAPI.getAll()]);
      setPannes(pRes.data.sort((a, b) => (URGENCE_CFG[a.urgence]?.order || 99) - (URGENCE_CFG[b.urgence]?.order || 99)));
      setMachines(mRes.data); setTechs(uRes.data);
    } catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const canValider = ['ADMIN','RESPONSABLE_MAINTENANCE'].includes(user?.role);

  const filtered = pannes.filter(p => {
    const q = search.toLowerCase();
    const ms = !q || p.machineNom?.toLowerCase().includes(q) || p.titre?.toLowerCase().includes(q) || p.technicienNom?.toLowerCase().includes(q);
    return ms && (!filterStatut || p.statut === filterStatut) && (!filterUrgence || p.urgence === filterUrgence);
  });

  const stats = {
    total: pannes.length,
    ouvertes: pannes.filter(p => ['DECLAREE','EN_COURS'].includes(p.statut)).length,
    critiques: pannes.filter(p => p.urgence === 'CRITIQUE').length,
    resolues: pannes.filter(p => p.statut === 'RESOLUE' || p.statut === 'VALIDEE').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔧 Maintenance Corrective</h1>
          <p className="page-subtitle">Déclaration, suivi et résolution des pannes</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14} /></button>
          <button className="btn btn-danger" onClick={() => setModal('declarer')}>
            <Plus size={15} /> Déclarer une panne
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <StatCard icon={AlertTriangle} label="Total pannes" value={stats.total} color="var(--muted2)" />
        <StatCard icon={Zap} label="Ouvertes" value={stats.ouvertes} color="var(--danger)" sub="En cours / Déclarées" />
        <StatCard icon={AlertTriangle} label="Critiques" value={stats.critiques} color="var(--warning)" />
        <StatCard icon={CheckCircle} label="Résolues" value={stats.resolues} color="var(--success)" />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 260 }}>
          <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input placeholder="Machine, titre, technicien..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterUrgence} onChange={e => setFilterUrgence(e.target.value)} style={{ maxWidth: 140 }}>
          <option value="">Toutes urgences</option>
          {Object.entries(URGENCE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--muted2)', marginLeft: 'auto' }}>{filtered.length} panne(s)</span>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="loading"><div className="loading-spinner" /><div>Chargement...</div></div>
      ) : filtered.length === 0 ? (
        <div className="card"><div className="empty"><div className="empty-icon">✅</div><div>Aucune panne{search ? ' trouvée' : ' enregistrée'}</div></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const urg = URGENCE_CFG[p.urgence] || URGENCE_CFG.BASSE;
            const stat = STATUT_CFG[p.statut] || {};
            return (
              <div key={p.id} className="card" style={{ borderLeft: `3px solid ${urg.color}`, padding: '14px 18px', cursor: 'pointer' }}
                onClick={() => { setSelected(p); setModal('detail'); }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className={`badge ${urg.cls}`}>{urg.label}</span>
                      <span className={`badge ${stat.cls}`}>{stat.label}</span>
                      <WorkflowBadge statut={p.statut} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--white)', marginBottom: 4 }}>{p.titre}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted2)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span>🏭 {p.machineNom}</span>
                      {p.technicienNom && <span><User size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {p.technicienNom}</span>}
                      <span><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {p.dateDeclaration ? new Date(p.dateDeclaration).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</span>
                      {p.coutReparation && <span style={{ color: 'var(--success)' }}>💰 {p.coutReparation.toLocaleString('fr-FR')} MAD</span>}
                    </div>
                    {p.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.4, maxWidth: 600, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    {p.statut === 'DECLAREE' || p.statut === 'EN_COURS' ? (
                      <button className="btn btn-warning btn-sm" onClick={e => { e.stopPropagation(); setSelected(p); setModal('resoudre'); }}>
                        <Wrench size={12} /> Résoudre
                      </button>
                    ) : p.statut === 'RESOLUE' && canValider ? (
                      <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); setSelected(p); setModal('detail'); }}>
                        <CheckCircle size={12} /> Valider
                      </button>
                    ) : null}
                    <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal === 'declarer' && <DeclarerModal machines={machines} techs={techs} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {modal === 'resoudre' && selected && <ResoudreModal panne={selected} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
      {modal === 'detail' && selected && <DetailModal panne={selected} canValider={canValider} onClose={() => setModal(null)} onValider={() => { setModal(null); load(); }} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 2 }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}
