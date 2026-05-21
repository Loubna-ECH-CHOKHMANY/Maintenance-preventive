import React,{useState,useEffect} from 'react';
import {utilisateursAPI} from '../services/api';
import {useAuth} from '../context/AuthContext';

const ROLE={ADMIN:['badge-danger','🔴 Admin'],RESPONSABLE_MAINTENANCE:['badge-warning','🟡 Responsable'],CHEF_EQUIPE:['badge-info','🔵 Chef équipe'],TECHNICIEN:['badge-success','🟢 Technicien']};
const SPEC_ICON={MECANIQUE:'⚙️',ELECTRIQUE:'⚡',HYDRAULIQUE:'💧',PNEUMATIQUE:'💨'};

function Modal({u,onClose,onSave}){
  const [f,setF]=useState(u||{nomComplet:'',matricule:'',email:'',motDePasse:'',role:'TECHNICIEN',specialites:[],certifications:[],actif:true});
  const [saving,setSaving]=useState(false);
  const set=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const togSpec=s=>setF(x=>({...x,specialites:x.specialites.includes(s)?x.specialites.filter(v=>v!==s):[...x.specialites,s]}));
  const submit=async e=>{e.preventDefault();setSaving(true);
    try{u?.id?await utilisateursAPI.update(u.id,f):await utilisateursAPI.create(f);onSave();}
    catch(err){alert(err.response?.data?.message||'Erreur');}finally{setSaving(false);}
  };
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><h3>{u?'✏️ Modifier':'➕ Nouvel utilisateur'}</h3><button onClick={onClose} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:22}}>×</button></div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="grid-2">
            <div className="form-group"><label>Nom complet *</label><input value={f.nomComplet} onChange={set('nomComplet')} required/></div>
            <div className="form-group"><label>Matricule *</label><input value={f.matricule} onChange={set('matricule')} required/></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>Email *</label><input type="email" value={f.email} onChange={set('email')} required/></div>
            <div className="form-group"><label>Rôle *</label><select value={f.role} onChange={set('role')}>{['ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE','TECHNICIEN'].map(r=><option key={r}>{r}</option>)}</select></div>
          </div>
          {!u&&<div className="form-group"><label>Mot de passe *</label><input type="password" value={f.motDePasse} onChange={set('motDePasse')} required/></div>}
          <div className="form-group">
            <label>Spécialités</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
              {['MECANIQUE','ELECTRIQUE','HYDRAULIQUE','PNEUMATIQUE'].map(s=>(
                <button key={s} type="button" onClick={()=>togSpec(s)} style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${f.specialites.includes(s)?'var(--accent)':'var(--border)'}`,background:f.specialites.includes(s)?'rgba(0,212,255,.1)':'transparent',color:f.specialites.includes(s)?'var(--accent)':'var(--muted)',cursor:'pointer',fontSize:12}}>
                  {SPEC_ICON[s]} {s}
                </button>
              ))}
            </div>
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

export default function TechniciensPage(){
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(null);
  const [filterRole,setFilterRole]=useState('');
  const {hasRole}=useAuth();

  const load=()=>utilisateursAPI.getAll().then(r=>setItems(r.data)).catch(console.error).finally(()=>setLoading(false));
  useEffect(()=>{load();},[]);
  const del=async id=>{if(!confirm('Supprimer cet utilisateur ?'))return;await utilisateursAPI.delete(id);load();};
  const filtered=filterRole?items.filter(u=>u.role===filterRole):items;

  if(loading)return<div className="loading">⚙️ Chargement…</div>;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div className="page-header">
        <div><h1 className="page-title">👷 Techniciens & Utilisateurs</h1><p className="page-subtitle">{items.length} utilisateur(s)</p></div>
        {hasRole('ADMIN')&&<button onClick={()=>setModal({})} className="btn btn-primary">➕ Nouvel utilisateur</button>}
      </div>
      <div style={{display:'flex',gap:12}}>
        <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} style={{width:240}}>
          <option value="">Tous les rôles</option>{['ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE','TECHNICIEN'].map(r=><option key={r}>{r}</option>)}
        </select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:14}}>
        {filtered.map(u=>(
          <div key={u.id} className="card" style={{display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent2),#ff9a7a)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,color:'#fff',flexShrink:0}}>{u.nomComplet?.[0]}</div>
              <div style={{flex:1,overflow:'hidden'}}>
                <div style={{fontWeight:600,fontSize:14,color:'var(--white)'}}>{u.nomComplet}</div>
                <div style={{fontSize:12,color:'var(--muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</div>
              </div>
              <div style={{display:'flex',gap:5}}>
                {hasRole('ADMIN','RESPONSABLE_MAINTENANCE')&&<button onClick={()=>setModal(u)} className="btn btn-secondary btn-sm">✏️</button>}
                {hasRole('ADMIN')&&<button onClick={()=>del(u.id)} className="btn btn-danger btn-sm">🗑️</button>}
              </div>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:7,alignItems:'center'}}>
              <span className={`badge ${ROLE[u.role]?.[0]}`}>{ROLE[u.role]?.[1]||u.role}</span>
              <span style={{fontSize:11,color:'var(--muted)'}}>#{u.matricule}</span>
              {!u.actif&&<span className="badge badge-secondary">Inactif</span>}
            </div>
            {u.specialites?.length>0&&(
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {u.specialites.map(s=>(
                  <span key={s} style={{fontSize:11,background:'rgba(0,212,255,.07)',color:'var(--accent)',border:'1px solid rgba(0,212,255,.15)',borderRadius:12,padding:'2px 8px'}}>{SPEC_ICON[s]} {s}</span>
                ))}
              </div>
            )}
            {u.nombreInterventions>0&&(
              <div style={{fontSize:12,color:'var(--muted)',paddingTop:8,borderTop:'1px solid var(--border)'}}>📋 {u.nombreInterventions} intervention(s)</div>
            )}
          </div>
        ))}
        {!filtered.length&&<div className="empty" style={{gridColumn:'1/-1'}}>Aucun utilisateur</div>}
      </div>
      {modal!==null&&<Modal u={modal?.id?modal:null} onClose={()=>setModal(null)} onSave={()=>{setModal(null);load();}}/>}
    </div>
  );
}
