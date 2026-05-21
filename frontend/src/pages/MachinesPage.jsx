import React,{useState,useEffect} from 'react';
import {machinesAPI} from '../services/api';
import {useAuth} from '../context/AuthContext';

const STATUT={EN_SERVICE:['badge-success','✅ En service'],EN_MAINTENANCE:['badge-warning','🔧 En maintenance'],HORS_SERVICE:['badge-danger','❌ Hors service'],EN_REPARATION:['badge-info','🔨 En réparation']};
const TYPES={HYDRAULIQUE:'💧',PNEUMATIQUE:'💨',ELECTRIQUE:'⚡',CNC:'🖥️'};
const EMPTY={nom:'',typeMachine:'HYDRAULIQUE',marque:'',modele:'',numeroSerie:'',anneeFabrication:'',dateMiseEnService:'',atelier:'',zone:'',ligneProduction:'',statut:'EN_SERVICE',compteurHoraire:0};

function Modal({m,onClose,onSave}){
  const [f,setF]=useState(m||EMPTY);
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const submit=async e=>{e.preventDefault();setSaving(true);
    try{m?.id?await machinesAPI.update(m.id,f):await machinesAPI.create(f);onSave();}
    catch(err){alert(err.response?.data?.message||'Erreur');}
    finally{setSaving(false);}
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{m?'✏️ Modifier':'➕ Nouvelle machine'}</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="grid-2">
            <div className="form-group"><label>Nom *</label><input value={f.nom} onChange={set('nom')} required/></div>
            <div className="form-group"><label>Type *</label><select value={f.typeMachine} onChange={set('typeMachine')}>{['HYDRAULIQUE','PNEUMATIQUE','ELECTRIQUE','CNC'].map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Marque</label><input value={f.marque} onChange={set('marque')}/></div>
            <div className="form-group"><label>Modèle</label><input value={f.modele} onChange={set('modele')}/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>N° Série *</label><input value={f.numeroSerie} onChange={set('numeroSerie')} required/></div>
            <div className="form-group"><label>Statut *</label><select value={f.statut} onChange={set('statut')}>{Object.keys(STATUT).map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid-3">
            <div className="form-group"><label>Atelier</label><input value={f.atelier} onChange={set('atelier')}/></div>
            <div className="form-group"><label>Zone</label><input value={f.zone} onChange={set('zone')}/></div>
            <div className="form-group"><label>Ligne</label><input value={f.ligneProduction} onChange={set('ligneProduction')}/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Année fabrication</label><input type="number" value={f.anneeFabrication} onChange={set('anneeFabrication')}/></div>
            <div className="form-group"><label>Compteur (h)</label><input type="number" value={f.compteurHoraire} onChange={set('compteurHoraire')}/></div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:6}}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'…':'💾 Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MachinesPage(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState('');
  const [filterSt,setFilterSt]=useState('');
  const {hasRole}=useAuth();

  const load=()=>machinesAPI.getAll().then(r=>setItems(r.data)).catch(console.error).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);

  const del=async id=>{if(!confirm('Supprimer cette machine ?'))return;await machinesAPI.delete(id);load();};
  const filtered=items.filter(m=>(!search||m.nom.toLowerCase().includes(search.toLowerCase())||m.numeroSerie.toLowerCase().includes(search.toLowerCase()))&&(!filterSt||m.statut===filterSt));

  if(loading)return<div className="loading">⚙️ Chargement…</div>;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div className="page-header">
        <div><h1 className="page-title">⚙️ Machines</h1><p className="page-subtitle">{items.length} machine(s) enregistrée(s)</p></div>
        {hasRole('ADMIN','RESPONSABLE_MAINTENANCE')&&<button onClick={()=>setModal({})} className="btn btn-primary">➕ Nouvelle machine</button>}
      </div>
      <div style={{display:'flex',gap:12}}>
        <input placeholder="🔍 Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:300}}/>
        <select value={filterSt} onChange={e=>setFilterSt(e.target.value)} style={{width:200}}>
          <option value="">Tous les statuts</option>{Object.keys(STATUT).map(s=><option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table>
          <thead><tr><th>Nom</th><th>Type</th><th>Marque / Modèle</th><th>N° Série</th><th>Localisation</th><th>Compteur</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(m=>(
              <tr key={m.id}>
                <td><div style={{fontWeight:600,fontSize:13}}>{m.nom}</div>{m.nombrePointsMaintenance>0&&<div style={{fontSize:11,color:'var(--muted)'}}>{m.nombrePointsMaintenance} points</div>}</td>
                <td>{TYPES[m.typeMachine]} <span style={{fontSize:12,color:'var(--muted)'}}>{m.typeMachine}</span></td>
                <td style={{fontSize:12,color:'var(--muted)'}}>{[m.marque,m.modele].filter(Boolean).join(' ')}</td>
                <td style={{fontSize:12,fontFamily:'monospace',color:'var(--accent)'}}>{m.numeroSerie}</td>
                <td style={{fontSize:12,color:'var(--muted)'}}>{[m.atelier,m.zone].filter(Boolean).join(' / ')||'—'}</td>
                <td style={{fontWeight:600,fontSize:13}}>{m.compteurHoraire?.toLocaleString()} h</td>
                <td><span className={`badge ${STATUT[m.statut]?.[0]}`}>{STATUT[m.statut]?.[1]}</span></td>
                <td>
                  {hasRole('ADMIN','RESPONSABLE_MAINTENANCE')&&(
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>setModal(m)} className="btn btn-secondary btn-sm">✏️</button>
                      <button onClick={()=>del(m.id)} className="btn btn-danger btn-sm">🗑️</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length&&<tr><td colSpan={8}><div className="empty">Aucune machine trouvée</div></td></tr>}
          </tbody>
        </table>
      </div>
      {modal!==null&&<Modal m={modal?.id?modal:null} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}}/>}
    </div>
  );
}
