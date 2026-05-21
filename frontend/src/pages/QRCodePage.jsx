import React, { useState, useEffect } from 'react';
import { qrAPI, machinesAPI, interventionsAPI } from '../services/api';
import { QrCode, Download, Cpu, ClipboardList, RefreshCw } from 'lucide-react';

export default function QRCodePage() {
  const [machines, setMachines] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('machine');
  const [selectedId, setSelectedId] = useState('');
  const [qrSrc, setQrSrc] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  useEffect(() => {
    Promise.all([machinesAPI.getAll(), interventionsAPI.getAll()])
      .then(([mRes, iRes]) => { setMachines(mRes.data); setInterventions(iRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (!selectedId) return;
    setGenerating(true); setQrSrc(null);
    try {
      const res = tab === 'machine' ? await qrAPI.machine(selectedId) : await qrAPI.intervention(selectedId);
      const url = URL.createObjectURL(res.data);
      setQrSrc(url);
      const item = tab === 'machine'
        ? machines.find(m => m.id === +selectedId)
        : interventions.find(i => i.id === +selectedId);
      setSelectedLabel(tab === 'machine' ? item?.nom : `Intervention #${selectedId} — ${item?.machineNom || ''}`);
    } catch { alert('Erreur génération QR code'); }
    finally { setGenerating(false); }
  };

  const download = () => {
    if (!qrSrc) return;
    const a = document.createElement('a');
    a.href = qrSrc;
    a.download = `qr-${tab}-${selectedId}.png`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📱 QR Code</h1>
          <p className="page-subtitle">Générer des QR codes pour machines et interventions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 14, color: 'var(--white)' }}>Paramètres</h3>

            <div className="tabs" style={{ marginBottom: 14 }}>
              <button className={`tab-btn ${tab === 'machine' ? 'active' : ''}`} onClick={() => { setTab('machine'); setSelectedId(''); setQrSrc(null); }}>
                <Cpu size={13} style={{ display: 'inline', marginRight: 4 }} />Machine
              </button>
              <button className={`tab-btn ${tab === 'intervention' ? 'active' : ''}`} onClick={() => { setTab('intervention'); setSelectedId(''); setQrSrc(null); }}>
                <ClipboardList size={13} style={{ display: 'inline', marginRight: 4 }} />Intervention
              </button>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label>{tab === 'machine' ? 'Machine' : 'Intervention'}</label>
              {loading ? <select disabled><option>Chargement...</option></select> : (
                <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setQrSrc(null); }}>
                  <option value="">-- Sélectionner --</option>
                  {tab === 'machine'
                    ? machines.map(m => <option key={m.id} value={m.id}>{m.nom} ({m.numeroSerie})</option>)
                    : interventions.slice(0, 50).map(i => <option key={i.id} value={i.id}>#{i.id} — {i.machineNom} ({i.statut})</option>)
                  }
                </select>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              onClick={generate} disabled={!selectedId || generating}>
              {generating ? <><RefreshCw size={14} className="spin" /> Génération...</> : <><QrCode size={14} /> Générer QR Code</>}
            </button>
          </div>

          {/* Info card */}
          <div className="card" style={{ background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.2)' }}>
            <h4 style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 8 }}>ℹ️ Utilisation</h4>
            <ul style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.8, paddingLeft: 14 }}>
              <li>Imprimez le QR code sur l'étiquette machine</li>
              <li>Le technicien scanne depuis mobile</li>
              <li>Redirection vers la fiche de la machine</li>
              <li>Accès direct aux interventions en cours</li>
              <li>Confirmation rapide sur le terrain</li>
            </ul>
          </div>
        </div>

        {/* QR Display */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          {qrSrc ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: 'fadeIn .3s ease' }}>
              <div style={{ padding: 20, background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
                <img src={qrSrc} alt="QR Code" style={{ display: 'block', width: 280, height: 280 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--white)', marginBottom: 4 }}>{selectedLabel}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>QR Code généré · Prêt à imprimer</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={download}>
                  <Download size={14} /> Télécharger PNG
                </button>
                <button className="btn btn-secondary" onClick={() => { setQrSrc(null); setSelectedId(''); }}>
                  Nouveau QR
                </button>
              </div>
              {/* Print hint */}
              <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', maxWidth: 280 }}>
                Format recommandé pour impression : étiquette 5×5 cm minimum pour une lecture optimale
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
              <QrCode size={64} style={{ margin: '0 auto 16px', opacity: .3 }} />
              <div style={{ fontSize: 14, marginBottom: 6 }}>Sélectionnez {tab === 'machine' ? 'une machine' : 'une intervention'}</div>
              <div style={{ fontSize: 12 }}>puis cliquez sur "Générer QR Code"</div>
            </div>
          )}
        </div>
      </div>

      {/* Machine QR gallery */}
      {tab === 'machine' && machines.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: 16, marginBottom: 14, color: 'var(--white)' }}>
            Générer QR pour toutes les machines
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {machines.map(m => (
              <button key={m.id} className="btn btn-ghost btn-sm"
                onClick={() => { setSelectedId(String(m.id)); }}>
                <QrCode size={12} /> {m.nom}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
