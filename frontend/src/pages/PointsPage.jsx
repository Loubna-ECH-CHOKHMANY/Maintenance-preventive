import React,{useState,useEffect} from 'react';
import {pointsAPI,machinesAPI} from '../services/api';
import {useAuth} from '../context/AuthContext';

const FREQ={QUOTIDIENNE:'🔴 Quotidienne',HEBDOMADAIRE:'🟠 Hebdo',MENSUELLE:'🟡 Mensuelle',TRIMESTRIELLE:'🟢 Trimestrielle',SEMESTRIELLE:'🔵 Semestrielle',ANNUELLE:'🟣 Annuelle',PAR_HEURES:'⚙️ Par heures'};
const OPS={GRAISSAGE:'🟤 Graissage',VIDANGE_HUILE:'🫙 Vidange huile',VERIFICATION_COURROIE:'🔗 Vérif. courroie',VERIFICATION_ROULEMENT:'⚙️ Vérif. roulement',CONTROLE_FILTRES:'🔍 Contrôle filtres',SERRAGE_VISSERIE:'🔩 Serrage visserie'};

function Modal({p,onClose,onSave,machines}){
  const [f,setF]=useState(p||{machineId:'',typeOperation:'GRAISSAGE',description:'',localisationSurMachine:'',typeConsommable:'',referenceConsommable:'',quantiteNecessaire:'',uniteQuantite:'',frequence:'MENSUELLE',intervalleHeures:''});
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const submit=async e=>{e.preventDefault();setSaving(true);
    try{const d={...f,machineId:parseInt(f.machineId)};p?.id?await pointsAPI.update(p.id,d):await pointsAPI.create(d);onSave();}
    catch(err){alert(err.response?.data?.message||'Erreur');}finally{setSaving(false);}
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{p?'✏️ Modifier point':'➕ Nouveau point'}</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:13}}>
          <div className="form-group"><label>Machine *</label><select value={f.machineId} onChange={set('machineId')} required><option value="">-- Sélectionner --</option>{machines.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}</select></div>
          <div className="grid-2">
            <div className="form-group"><label>Type opération *</label><select value={f.typeOperation} onChange={set('typeOperation')}>{Object.entries(OPS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
            <div className="form-group"><label>Fréquence *</label><select value={f.frequence} onChange={set('frequence')}>{Object.entries(FREQ).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
          </div>
          <div className="form-group"><label>Description</label><textarea value={f.description} onChange={set('description')} rows={2}/></div>
          <div className="form-group"><label>Localisation sur la machine</label><input value={f.localisationSurMachine} onChange={set('localisationSurMachine')}/></div>
          <div className="grid-3">
            <div className="form-group"><label>Consommable</label><input value={f.typeConsommable} onChange={set('typeConsommable')}/></div>
            <div className="form-group"><label>Quantité</label><input type="number" value={f.quantiteNecessaire} onChange={set('quantiteNecessaire')}/></div>
            <div className="form-group"><label>Unité</label><input value={f.uniteQuantite} onChange={set('uniteQuantite')}/></div>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'…':'💾 Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PointsPage(){
  const [items,setItems]=useState([]);
  const [machines,setMachines]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [filterM,setFilterM]=useState('');
  const {hasRole}=useAuth();

  const load=async()=>{
    try{const[p,m]=await Promise.all([pointsAPI.getAll(),machinesAPI.getAll()]);setItems(p.data);setMachines(m.data);}
    catch(e){console.error(e);}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  const del=async id=>{if(!confirm('Supprimer ?'))return;await pointsAPI.delete(id);load();};
  const filtered=filterM?items.filter(p=>String(p.machineId)===filterM):items;
  const today=new Date();

  if(loading)return<div className="loading">⚙️ Chargement…</div>;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div className="page-header">
        <div><h1 className="page-title">🔧 Points de Maintenance</h1><p className="page-subtitle">{items.length} point(s) défini(s)</p></div>
        {hasRole('ADMIN','RESPONSABLE_MAINTENANCE')&&<button onClick={()=>setModal({})} className="btn btn-primary">➕ Nouveau point</button>}
      </div>
      <div style={{display:'flex',gap:12}}>
        <select value={filterM} onChange={e=>setFilterM(e.target.value)} style={{width:240}}>
          <option value="">Toutes les machines</option>{machines.map(m=><option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
      </div>
      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <table>
          <thead><tr><th>Machine</th><th>Opération</th><th>Description</th><th>Consommable</th><th>Fréquence</th><th>Prochaine date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(p=>{
              const nd=p.prochaineDatePrevue?new Date(p.prochaineDatePrevue):null;
              const overdue=nd&&nd<today;
              const soon=nd&&!overdue&&(nd-today)/86400000<=7;
              return(
                <tr key={p.id}>
                  <td style={{fontWeight:600,fontSize:13}}>{p.machineNom}</td>
                  <td style={{fontSize:13}}>{OPS[p.typeOperation]||p.typeOperation}</td>
                  <td style={{fontSize:12,color:'var(--muted)',maxWidth:200}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.description||p.localisationSurMachine||'—'}</div></td>
                  <td style={{fontSize:12,color:'var(--muted)'}}>{p.typeConsommable?`${p.typeConsommable}${p.quantiteNecessaire?` (${p.quantiteNecessaire} ${p.uniteQuantite||''})`:''}`:'—'}</td>
                  <td style={{fontSize:12}}>{FREQ[p.frequence]||p.frequence}</td>
                  <td>{nd?<span style={{fontSize:12,fontWeight:600,color:overdue?'var(--danger)':soon?'var(--warning)':'var(--text)'}}>{overdue?'⚠️ ':soon?'⏰ ':''}{nd.toLocaleDateString('fr-FR')}</span>:'—'}</td>
                  <td>{hasRole('ADMIN','RESPONSABLE_MAINTENANCE')&&<div style={{display:'flex',gap:6}}><button onClick={()=>setModal(p)} className="btn btn-secondary btn-sm">✏️</button><button onClick={()=>del(p.id)} className="btn btn-danger btn-sm">🗑️</button></div>}</td>
                </tr>
              );
            })}
            {!filtered.length&&<tr><td colSpan={7}><div className="empty">Aucun point de maintenance</div></td></tr>}
          </tbody>
        </table>
      </div>
      {modal!==null&&<Modal p={modal?.id?modal:null} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}} machines={machines}/>}
    </div>
  );
}
