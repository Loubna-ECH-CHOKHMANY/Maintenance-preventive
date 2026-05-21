import React, { useState } from 'react';
import { exportAPI, downloadBlob } from '../services/api';
import { FileText, Download, FileSpreadsheet, File, CheckCircle, Loader } from 'lucide-react';

const REPORTS = [
  {
    id: 'interventions-excel',
    title: 'Interventions — Excel',
    desc: 'Historique complet des interventions avec statuts, techniciens, durées.',
    icon: FileSpreadsheet,
    color: 'var(--success)',
    tag: 'XLSX',
    fn: () => exportAPI.interventionsExcel(),
    file: 'interventions.xlsx',
  },
  {
    id: 'interventions-csv',
    title: 'Interventions — CSV',
    desc: 'Export CSV pour intégration dans Excel ou autre logiciel tiers.',
    icon: File,
    color: 'var(--accent2)',
    tag: 'CSV',
    fn: () => exportAPI.interventionsCSV(),
    file: 'interventions.csv',
  },
  {
    id: 'stock-excel',
    title: 'Stock Pièces — Excel',
    desc: 'Inventaire complet avec alertes stock, prix, quantités, emplacements.',
    icon: FileSpreadsheet,
    color: 'var(--warning)',
    tag: 'XLSX',
    fn: () => exportAPI.stockExcel(),
    file: 'stock-pieces.xlsx',
  },
  {
    id: 'stock-csv',
    title: 'Stock Pièces — CSV',
    desc: 'Données stock au format CSV pour traitement externe.',
    icon: File,
    color: 'var(--accent)',
    tag: 'CSV',
    fn: () => exportAPI.stockCSV(),
    file: 'stock-pieces.csv',
  },
  {
    id: 'rapport-pdf',
    title: 'Rapport Global — PDF',
    desc: 'Rapport complet GMPP : interventions, KPI, résumé des activités de maintenance.',
    icon: FileText,
    color: 'var(--danger)',
    tag: 'PDF',
    fn: () => exportAPI.rapportPDF('Rapport GMPP Pro'),
    file: 'rapport-gmpp.pdf',
  },
];

function ReportCard({ report }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  const handleDownload = async () => {
    setStatus('loading');
    try {
      const res = await report.fn();
      downloadBlob(res.data, report.file);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const Icon = report.icon;
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, borderTop: `2px solid ${report.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${report.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} style={{ color: report.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', fontFamily: 'Rajdhani' }}>{report.title}</h3>
            <span className="badge" style={{ background: `${report.color}20`, color: report.color, fontSize: 9, letterSpacing: 1 }}>{report.tag}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.5 }}>{report.desc}</p>
        </div>
      </div>

      <button
        className="btn"
        style={{ background: status === 'done' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : report.color, color: report.color === 'var(--warning)' ? '#000' : '#fff', justifyContent: 'center' }}
        onClick={handleDownload}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? (
          <><Loader size={14} className="spin" /> Génération en cours...</>
        ) : status === 'done' ? (
          <><CheckCircle size={14} /> Téléchargé !</>
        ) : status === 'error' ? (
          <>⚠️ Erreur — Réessayer</>
        ) : (
          <><Download size={14} /> Télécharger {report.tag}</>
        )}
      </button>
    </div>
  );
}

export default function ReportsPage() {
  const [customTitle, setCustomTitle] = useState('Rapport GMPP Pro');
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleCustomPDF = async () => {
    setDownloading(true);
    try {
      const res = await exportAPI.rapportPDF(customTitle);
      downloadBlob(res.data, `${customTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch { alert('Erreur génération PDF'); }
    finally { setDownloading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">📄 Rapports & Exports</h1>
          <p className="page-subtitle">Générez et téléchargez les rapports GMPP en PDF, Excel et CSV</p>
        </div>
      </div>

      {/* Custom PDF */}
      <div className="card" style={{ borderTop: '2px solid var(--accent3)' }}>
        <h3 style={{ fontFamily: 'Rajdhani', fontSize: 17, marginBottom: 14, color: 'var(--white)' }}>🎯 Rapport PDF personnalisé</h3>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label>Titre du rapport</label>
            <input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Titre personnalisé..." />
          </div>
          <button className="btn btn-primary" onClick={handleCustomPDF} disabled={downloading || !customTitle}>
            {downloading ? <><Loader size={14} className="spin" /> Génération...</> : done ? <><CheckCircle size={14} /> Généré !</> : <><FileText size={14} /> Générer PDF</>}
          </button>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid-2">
        {REPORTS.map(r => <ReportCard key={r.id} report={r} />)}
      </div>

      {/* Info */}
      <div className="card" style={{ background: 'rgba(59,130,246,.05)', border: '1px solid rgba(59,130,246,.2)' }}>
        <h3 style={{ fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 10, color: 'var(--accent)' }}>ℹ️ À propos des exports</h3>
        <div style={{ fontSize: 12, color: 'var(--muted2)', lineHeight: 1.8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <div>• Les exports Excel incluent une mise en forme conditionnelle (alertes en rouge)</div>
          <div>• Le rapport PDF contient les interventions + KPI du mois en cours</div>
          <div>• Les CSV sont encodés en UTF-8 pour compatibilité maximale</div>
          <div>• Les données reflètent l'état en temps réel au moment du téléchargement</div>
        </div>
      </div>
    </div>
  );
}
