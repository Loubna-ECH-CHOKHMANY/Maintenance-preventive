import React,{useState,useEffect} from 'react';
import {interventionsAPI,machinesAPI,utilisateursAPI,pointsAPI} from '../services/api';
import {useAuth} from '../context/AuthContext';

const STATUT={PLANIFIEE:['badge-info','📋 Planifiée'],EN_COURS:['badge-warning','⚡ En cours'],TERMINEE:['badge-success','✅ Terminée'],ANNULEE:['badge-secondary','❌ Annulée'],EN_RETARD:['badge-danger','⏰ En retard']};

function CreateModal({onClose,onSave,machines,techs}){
  const [f,setF]=useState({machineId:'',pointMaintenanceId:'',technicienId:'',datePlanifiee:''});
  const [pms,setPms]=useState([]);
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  useEffect(()=>{if(f.machineId){pointsAPI.getByMachine(f.machineId).then(r=>setPms(r.data)).catch(()=>setPms([]));}else{setPms([]);}},[f.machineId]);
  const submit=async e=>{e.preventDefault();setSaving(true);
    try{await interventionsAPI.create({...f,machineId:parseInt(f.machineId),technicienId:f.technicienId?parseInt(f.technicienId):null,pointMaintenanceId:f.pointMaintenanceId?parseInt(f.pointMaintenanceId):null});onSave();}
    catch(err){alert(err.response?.data?.message||'Erreur');}finally{setSaving(false);}
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>➕ Nouvelle intervention</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group"><label>Machine *</label><select value={f.machineId} onChange={set('machineId')} required><option value="">-- Choisir --</option>{machines.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div className="form-group"><label>Point de maintenance</label><select value={f.pointMaintenanceId} onChange={set('pointMaintenanceId')}><option value="">-- Optionnel --</option>{pms.map(p=><option key={p.id} value={p.id}>{p.typeOperation} – {p.localisationSurMachine||p.description||'sans desc'}</option>)}</select></div>
          <div className="form-group"><label>Technicien</label><select value={f.technicienId} onChange={set('technicienId')}><option value="">-- Non assigné --</option>{techs.filter(t=>['TECHNICIEN','CHEF_EQUIPE'].includes(t.role)).map(t=><option key={t.id} value={t.id}>{t.nomComplet}</option>)}</select></div>
          <div className="form-group"><label>Date planifiée *</label><input type="datetime-local" value={f.datePlanifiee} onChange={set('datePlanifiee')} required/></div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'…':'💾 Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmerModal({item,onClose,onSave}){
  const [f,setF]=useState({observations:'',etatConstate:'NORMAL',dureeMinutes:''});
  const [saving,setSaving]=useState(false);
  const submit=async e=>{e.preventDefault();setSaving(true);
    try{await interventionsAPI.confirmer(item.id,{...f,dureeMinutes:f.dureeMinutes?parseInt(f.dureeMinutes):null});onSave();}
    catch(err){alert(err.response?.data?.message||'Erreur');}finally{setSaving(false);}
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>✅ Confirmer l'intervention</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <div style={{padding:'10px 14px',background:'rgba(0,212,255,.05)',borderRadius:8,marginBottom:16,fontSize:13}}>Machine : <strong>{item.machineNom}</strong></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group"><label>État constaté *</label>
            <select value={f.etatConstate} onChange={e=>setF(x=>({...x,etatConstate:e.target.value}))}>
              {[['NORMAL','✅ Normal'],['USURE_DETECTEE','⚠️ Usure détectée'],['ANOMALIE_TROUVEE','🔴 Anomalie trouvée'],['REPARATION_NECESSAIRE','🔧 Réparation nécessaire']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Durée effective (minutes)</label><input type="number" value={f.dureeMinutes} onChange={e=>setF(x=>({...x,dureeMinutes:e.target.value}))}/></div>
          <div className="form-group"><label>Observations *</label><textarea value={f.observations} onChange={e=>setF(x=>({...x,observations:e.target.value}))} rows={3} required placeholder="Décrivez ce qui a été fait…"/></div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-success" disabled={saving}>{saving?'…':'✅ Confirmer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InterventionsPage(){
  const [items,setItems]=useState([]);
  const [machines,setMachines]=useState([]);
  const [techs,setTechs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [createModal,setCreateModal]=useState(false);
  const [confirmItem,setConfirmItem]=useState(null);
  const [filterSt,setFilterSt]=useState('');
  const {hasRole}=useAuth();

  const load=async()=>{
    try{const[iv,m,u]=await Promise.all([interventionsAPI.getAll(),machinesAPI.getAll(),utilisateursAPI.getAll()]);setItems(iv.data);setMachines(m.data);setTechs(u.data);}
    catch(e){console.error(e);}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const filtered=filterSt?items.filter(i=>i.statut===filterSt):items;

  if(loading)return<div className="loading">⚙️ Chargement…</div>;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div className="page-header">
        <div><h1 className="page-title">📋 Interventions</h1><p className="page-subtitle">{items.length} intervention(s)</p></div>
        {hasRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')&&<button onClick={()=>setCreateModal(true)} className="btn btn-primary">➕ Nouvelle</button>}
      </div>

      {/* Filtres statut */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button onClick={()=>setFilterSt('')} className={`btn btn-sm ${!filterSt?'btn-primary':'btn-secondary'}`}>Tous ({items.length})</button>
        {Object.entries(STATUT).map(([k,[cls,lbl]])=>{
          const n=items.filter(i=>i.statut===k).length;
          return<button key={k} onClick={()=>setFilterSt(filterSt===k?'':k)} className={`btn btn-sm ${filterSt===k?'btn-primary':'btn-secondary'}`}>{lbl} ({n})</button>;
        })}
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table>
          <thead><tr><th>#</th><th>Machine</th><th>Opération</th><th>Technicien</th><th>Date planifiée</th><th>Statut</th><th>État</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(i=>(
              <tr key={i.id}>
                <td style={{fontSize:11,color:'var(--muted)'}}>{i.id}</td>
                <td style={{fontWeight:600,fontSize:13}}>{i.machineNom}</td>
                <td style={{fontSize:12,color:'var(--muted)'}}>{i.typeOperation||'—'}</td>
                <td style={{fontSize:13}}>{i.technicienNom||<span style={{color:'var(--muted)'}}>—</span>}</td>
                <td>
                  <div style={{fontSize:12}}>{new Date(i.datePlanifiee).toLocaleDateString('fr-FR')}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{new Date(i.datePlanifiee).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
                </td>
                <td><span className={`badge ${STATUT[i.statut]?.[0]}`}>{STATUT[i.statut]?.[1]}</span></td>
                <td style={{fontSize:12,color:'var(--muted)'}}>{i.etatConstate||'—'}</td>
                <td>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {(i.statut==='PLANIFIEE'||i.statut==='EN_COURS'||i.statut==='EN_RETARD')&&!i.confirmeParTechnicien&&(
                      <button onClick={()=>setConfirmItem(i)} className="btn btn-success btn-sm">✅</button>
                    )}
                    {i.confirmeParTechnicien&&!i.valideParResponsable&&hasRole('ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE')&&(
                      <button onClick={async()=>{await interventionsAPI.valider(i.id);load();}} className="btn btn-primary btn-sm">👍</button>
                    )}
                    {hasRole('ADMIN','RESPONSABLE_MAINTENANCE')&&i.statut!=='ANNULEE'&&i.statut!=='TERMINEE'&&(
                      <button onClick={async()=>{const j=prompt('Justification annulation :');if(j){await interventionsAPI.annuler(i.id,j);load();}}} className="btn btn-secondary btn-sm">❌</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length&&<tr><td colSpan={8}><div className="empty">Aucune intervention</div></td></tr>}
          </tbody>
        </table>
      </div>
      {createModal&&<CreateModal onClose={()=>setCreateModal(false)} onSave={()=>{setCreateModal(false);load();}} machines={machines} techs={techs}/>}
      {confirmItem&&<ConfirmerModal item={confirmItem} onClose={()=>setConfirmItem(null)} onSave={()=>{setConfirmItem(null);load();}}/>}
    </div>
  );
}
