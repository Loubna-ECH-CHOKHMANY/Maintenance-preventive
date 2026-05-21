import React, { useState, useEffect, useCallback } from 'react';
import { interventionsAPI, machinesAPI, utilisateursAPI } from '../services/api';
import { ChevronLeft, ChevronRight, Plus, RefreshCw } from 'lucide-react';

const STATUT_CFG = {
  PLANIFIEE:  { color: '#3b82f6', bg: 'rgba(59,130,246,.15)', label: 'Planifiée' },
  EN_COURS:   { color: '#f59e0b', bg: 'rgba(245,158,11,.15)', label: 'En cours' },
  TERMINEE:   { color: '#10b981', bg: 'rgba(16,185,129,.15)', label: 'Terminée' },
  ANNULEE:    { color: '#64748b', bg: 'rgba(100,116,139,.15)', label: 'Annulée' },
  EN_RETARD:  { color: '#ef4444', bg: 'rgba(239,68,68,.15)',  label: 'En retard' },
};
const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const MOIS_NOMS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function getMonday(d) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d); m.setDate(d.getDate() + diff); return m;
}
function isSameDay(a, b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

function EventChip({ inv, onClick }) {
  const s = STATUT_CFG[inv.statut] || STATUT_CFG.PLANIFIEE;
  return (
    <div onClick={e => { e.stopPropagation(); onClick(inv); }} style={{ background: s.bg, borderLeft: `3px solid ${s.color}`, borderRadius: 5, padding: '3px 7px', marginBottom: 3, cursor: 'pointer', fontSize: 11, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <span style={{ color: s.color, fontWeight: 600 }}>{new Date(inv.datePlanifiee).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</span>
      {' '}{inv.machineNom}
    </div>
  );
}

function CreateModal({ onClose, onSave, machines, techs, defaultDate }) {
  const [f, setF] = useState({ machineId:'', technicienId:'', datePlanifiee: defaultDate||'' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setF(x=>({...x,[k]:e.target.value}));
  const submit = async e => {
    e.preventDefault(); setSaving(true);
    try { await interventionsAPI.create({...f, machineId:+f.machineId, technicienId:f.technicienId?+f.technicienId:null}); onSave(); }
    catch(err){ alert(err.response?.data?.message||'Erreur'); }
    finally { setSaving(false); }
  };
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>➕ Planifier une intervention</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group"><label>Machine *</label><select value={f.machineId} onChange={set('machineId')} required><option value="">-- Choisir --</option>{machines.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div className="form-group"><label>Technicien</label><select value={f.technicienId} onChange={set('technicienId')}><option value="">-- Non assigné --</option>{techs.filter(t=>['TECHNICIEN','CHEF_EQUIPE'].includes(t.role)).map(t=><option key={t.id} value={t.id}>{t.nomComplet}</option>)}</select></div>
          <div className="form-group"><label>Date & heure *</label><input type="datetime-local" value={f.datePlanifiee} onChange={set('datePlanifiee')} required/></div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving?'…':'💾 Planifier'}</button></div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ inv, onClose, onAnnuler }) {
  const s = STATUT_CFG[inv.statut]||STATUT_CFG.PLANIFIEE;
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>📋 Intervention #{inv.id}</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[['Machine',inv.machineNom],['Technicien',inv.technicienNom||'Non assigné'],['Date',inv.datePlanifiee?new Date(inv.datePlanifiee).toLocaleString('fr-FR'):'—'],['Durée',inv.dureeEffectiveMinutes?`${inv.dureeEffectiveMinutes} min`:'—']].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:'var(--surface)',borderRadius:8}}>
              <span style={{fontSize:12,color:'var(--muted2)'}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600}}>{v}</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'center',marginTop:4}}>
            <span className="badge" style={{background:s.bg,color:s.color}}>{s.label}</span>
          </div>
          {inv.observationsTechnicien && <div style={{fontSize:12,color:'var(--muted2)',padding:'8px 12px',background:'var(--surface)',borderRadius:8}}>{inv.observationsTechnicien}</div>}
        </div>
        {['PLANIFIEE','EN_RETARD'].includes(inv.statut) && (
          <div style={{marginTop:14}}>
            <button className="btn btn-danger btn-sm" onClick={()=>onAnnuler(inv)}>❌ Annuler cette intervention</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanningPage() {
  const [interventions, setInterventions] = useState([]);
  const [machines, setMachines] = useState([]);
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('semaine');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [clickedDate, setClickedDate] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes,mRes,uRes] = await Promise.all([interventionsAPI.getAll(), machinesAPI.getAll(), utilisateursAPI.getAll()]);
      setInterventions(iRes.data); setMachines(mRes.data); setTechs(uRes.data);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(()=>{ load(); },[load]);

  const filtered = interventions.filter(i => (!filterTech||String(i.technicienId)===filterTech) && (!filterStatut||i.statut===filterStatut));
  const getForDay = d => filtered.filter(i => i.datePlanifiee && isSameDay(new Date(i.datePlanifiee), d));

  const handleAnnuler = async inv => {
    const j = prompt('Motif :'); if(!j) return;
    try { await interventionsAPI.annuler(inv.id, j); setSelected(null); setModal(null); load(); } catch { alert('Erreur'); }
  };

  const renderWeek = () => {
    const mon = getMonday(currentDate);
    const days = Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return d; });
    return (
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
        {days.map((day,i)=>{
          const isToday = isSameDay(day,new Date());
          const dayInvs = getForDay(day);
          return (
            <div key={i} style={{minHeight:130,background:'var(--surface)',border:`1px solid ${isToday?'var(--accent)':'var(--border)'}`,borderRadius:10,overflow:'hidden',cursor:'pointer'}}
              onClick={()=>{ const dt=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}T08:00`; setClickedDate(dt); setModal('create'); }}>
              <div style={{padding:'7px 9px',borderBottom:'1px solid var(--border)',background:isToday?'rgba(59,130,246,.1)':'transparent',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,color:'var(--muted2)',fontWeight:500}}>{JOURS[i]}</span>
                <span style={{fontWeight:700,color:isToday?'var(--accent)':'var(--white)',fontSize:14}}>{day.getDate()}</span>
              </div>
              <div style={{padding:5}}>{dayInvs.map(inv=><EventChip key={inv.id} inv={inv} onClick={inv=>{setSelected(inv);setModal('detail');}}/>)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMois = () => {
    const year=currentDate.getFullYear(), month=currentDate.getMonth();
    const firstDay=new Date(year,month,1), lastDay=new Date(year,month+1,0);
    const startPad=(firstDay.getDay()+6)%7;
    const cells=[];
    for(let i=0;i<startPad;i++) cells.push(null);
    for(let d=1;d<=lastDay.getDate();d++) cells.push(new Date(year,month,d));
    return (
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,marginBottom:4}}>
          {JOURS.map(j=><div key={j} style={{textAlign:'center',fontSize:11,color:'var(--muted2)',padding:'5px 0',fontWeight:600}}>{j}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
          {cells.map((day,i)=>{
            if(!day) return <div key={`e${i}`}/>;
            const isToday=isSameDay(day,new Date());
            const dayInvs=getForDay(day);
            return (
              <div key={i} style={{minHeight:80,background:'var(--surface)',border:`1px solid ${isToday?'var(--accent)':'var(--border)'}`,borderRadius:7,overflow:'hidden',cursor:'pointer'}}
                onClick={()=>{const dt=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}T08:00`;setClickedDate(dt);setModal('create');}}>
                <div style={{padding:'4px 7px',textAlign:'right',fontWeight:700,fontSize:13,color:isToday?'var(--accent)':'var(--text)'}}>{day.getDate()}</div>
                <div style={{padding:'0 3px'}}>
                  {dayInvs.slice(0,2).map(inv=><EventChip key={inv.id} inv={inv} onClick={inv=>{setSelected(inv);setModal('detail');}}/>)}
                  {dayInvs.length>2&&<div style={{fontSize:10,color:'var(--muted)',textAlign:'center'}}>+{dayInvs.length-2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListe = () => {
    const sorted=[...filtered].sort((a,b)=>new Date(a.datePlanifiee)-new Date(b.datePlanifiee));
    if(!sorted.length) return <div className="empty"><div className="empty-icon">📅</div>Aucune intervention</div>;
    return (
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date planifiée</th><th>Machine</th><th>Technicien</th><th>Statut</th><th>Durée</th></tr></thead>
          <tbody>{sorted.map(i=>{const s=STATUT_CFG[i.statut]||STATUT_CFG.PLANIFIEE;return(
            <tr key={i.id} style={{cursor:'pointer'}} onClick={()=>{setSelected(i);setModal('detail');}}>
              <td style={{fontSize:12}}><div style={{fontWeight:600}}>{i.datePlanifiee?new Date(i.datePlanifiee).toLocaleDateString('fr-FR'):'—'}</div><div style={{color:'var(--muted)'}}>{i.datePlanifiee?new Date(i.datePlanifiee).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):''}</div></td>
              <td><strong>{i.machineNom}</strong></td>
              <td style={{fontSize:12}}>{i.technicienNom||<span style={{color:'var(--muted)'}}>—</span>}</td>
              <td><span className="badge" style={{background:s.bg,color:s.color}}>{s.label}</span></td>
              <td style={{fontSize:12,color:'var(--muted2)'}}>{i.dureeEffectiveMinutes?`${i.dureeEffectiveMinutes} min`:'—'}</td>
            </tr>
          );})}
          </tbody>
        </table>
      </div>
    );
  };

  const prevPeriod=()=>{ const d=new Date(currentDate); view==='semaine'?d.setDate(d.getDate()-7):d.setMonth(d.getMonth()-1); setCurrentDate(d); };
  const nextPeriod=()=>{ const d=new Date(currentDate); view==='semaine'?d.setDate(d.getDate()+7):d.setMonth(d.getMonth()+1); setCurrentDate(d); };
  const periodLabel=view==='semaine'?`Semaine du ${getMonday(currentDate).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}`:`${MOIS_NOMS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      <div className="page-header">
        <div><h1 className="page-title">📅 Planning</h1><p className="page-subtitle">Calendrier interactif des interventions</p></div>
        <div className="page-actions">
          <select value={filterTech} onChange={e=>setFilterTech(e.target.value)} style={{maxWidth:180}}><option value="">Tous techniciens</option>{techs.filter(t=>['TECHNICIEN','CHEF_EQUIPE'].includes(t.role)).map(t=><option key={t.id} value={t.id}>{t.nomComplet}</option>)}</select>
          <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)} style={{maxWidth:140}}><option value="">Tous statuts</option>{Object.entries(STATUT_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={14}/></button>
          <button className="btn btn-primary btn-sm" onClick={()=>{setClickedDate('');setModal('create');}}><Plus size={14}/> Planifier</button>
        </div>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div style={{display:'flex',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
          {[['semaine','Semaine'],['mois','Mois'],['liste','Liste']].map(([k,l])=>(
            <button key={k} className={`btn btn-sm ${view===k?'btn-primary':'btn-ghost'}`} style={{borderRadius:0,border:'none'}} onClick={()=>setView(k)}>{l}</button>
          ))}
        </div>
        {view!=='liste'&&(
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={prevPeriod}><ChevronLeft size={16}/></button>
            <span style={{fontWeight:600,fontSize:14,color:'var(--white)',minWidth:220,textAlign:'center'}}>{periodLabel}</span>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={nextPeriod}><ChevronRight size={16}/></button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setCurrentDate(new Date())}>Aujourd'hui</button>
          </div>
        )}
        <div style={{display:'flex',gap:10,marginLeft:'auto',flexWrap:'wrap'}}>
          {Object.entries(STATUT_CFG).map(([k,v])=>(
            <div key={k} style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--muted2)'}}><div style={{width:8,height:8,borderRadius:2,background:v.color}}/>{v.label}</div>
          ))}
        </div>
      </div>

      <div className="card" style={{padding:view==='liste'?0:16}}>
        {loading?<div className="loading"><div className="loading-spinner"/></div>:view==='semaine'?renderWeek():view==='mois'?renderMois():renderListe()}
      </div>

      {view!=='liste'&&(
        <div className="grid-4">
          {Object.entries(STATUT_CFG).map(([k,v])=>{
            const count=filtered.filter(i=>i.statut===k).length;
            return <div key={k} style={{display:'flex',alignItems:'center',gap:10,background:'var(--card)',border:'1px solid var(--border)',borderRadius:10,padding:'11px 14px'}}>
              <div style={{width:10,height:10,borderRadius:3,background:v.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:12,color:'var(--muted2)'}}>{v.label}</span>
              <span style={{fontFamily:'Rajdhani',fontSize:20,fontWeight:700,color:v.color}}>{count}</span>
            </div>;
          })}
        </div>
      )}

      {modal==='create'&&<CreateModal machines={machines} techs={techs} defaultDate={clickedDate} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}}/>}
      {modal==='detail'&&selected&&<DetailModal inv={selected} onClose={()=>{setSelected(null);setModal(null);}} onAnnuler={handleAnnuler}/>}
    </div>
  );
}
