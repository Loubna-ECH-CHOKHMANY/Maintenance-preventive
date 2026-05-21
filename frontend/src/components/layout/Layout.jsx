import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsAPI } from '../../services/api';
import { t, languages } from '../../i18n/index.js';
import {
  LayoutDashboard, Cpu, Wrench, ClipboardList, Calendar,
  AlertTriangle, Package, BarChart3, Users, FileText,
  Shield, Bell, LogOut, Settings, Sun, Moon, Menu, X,
  Globe, ChevronDown
} from 'lucide-react';

const navItems = [
  { section: null, items: [
    { path:'/dashboard', icon: LayoutDashboard, key:'nav.dashboard', roles:['ADMIN','RESPONSABLE_MAINTENANCE'] },
  ]},
  { section: 'Maintenance', items: [
    { path:'/machines',      icon: Cpu,           key:'nav.machines',      roles:['ADMIN','RESPONSABLE_MAINTENANCE','CHEF_EQUIPE'] },
    { path:'/points',        icon: Wrench,         key:'nav.points',        roles:['ADMIN','RESPONSABLE_MAINTENANCE'] },
    { path:'/interventions', icon: ClipboardList,  key:'nav.interventions', roles:[] },
    { path:'/planning',      icon: Calendar,       key:'nav.planning',      roles:[] },
    { path:'/pannes',        icon: AlertTriangle,  key:'nav.pannes',        roles:[] },
  ]},
  { section: 'Ressources', items: [
    { path:'/stock',         icon: Package,        key:'nav.stock',         roles:[] },
    { path:'/techniciens',   icon: Users,          key:'nav.techniciens',   roles:['ADMIN'] },
  ]},
  { section: 'Analyse', items: [
    { path:'/kpi',           icon: BarChart3,      key:'nav.kpi',           roles:['ADMIN','RESPONSABLE_MAINTENANCE'] },
    { path:'/rapports',      icon: FileText,       key:'nav.rapports',      roles:['ADMIN','RESPONSABLE_MAINTENANCE'] },
  ]},
  { section: 'Système', items: [
    { path:'/notifications', icon: Bell,           key:'nav.notifications', roles:[] },
    { path:'/audit',         icon: Shield,         key:'nav.audit',         roles:['ADMIN'] },
  ]},
];

export default function Layout() {
  const { user, lang, theme, logout, changeLang, changeTheme } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      notificationsAPI.getCount(user.userId)
        .then(r => setNotifCount(r.data.count))
        .catch(() => {});
      const iv = setInterval(() => {
        notificationsAPI.getCount(user.userId)
          .then(r => setNotifCount(r.data.count))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(iv);
    }
  }, [user]);

  const canAccess = (roles) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(user?.role);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentLang = languages.find(l => l.code === lang);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚙</div>
          <div>
            <div className="sidebar-logo-text">GMPP Pro</div>
            <div className="sidebar-logo-sub">v2.0 Industrial</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <div className="sidebar-section-label">{group.section}</div>
              )}
              {group.items.filter(item => canAccess(item.roles)).map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={16} />
                  <span>{t(lang, item.key)}</span>
                  {item.key === 'nav.notifications' && notifCount > 0 && (
                    <span className="nav-badge">{notifCount > 99 ? '99+' : notifCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User panel */}
        <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)' }}>
          <div style={{ padding:'10px 12px', background:'var(--card2)', borderRadius:'var(--radius)', marginBottom:8 }}>
            <div style={{ fontWeight:600, fontSize:13, color:'var(--white)', marginBottom:2 }}>{user?.nomComplet}</div>
            <div style={{ fontSize:11, color:'var(--muted)' }}>{user?.role?.replace('_',' ')}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:'100%',justifyContent:'flex-start'}} onClick={handleLogout}>
            <LogOut size={14} /> {lang === 'ar' ? 'خروج' : lang === 'en' ? 'Logout' : 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="topbar-title" />

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Lang selector */}
            <div style={{ position:'relative' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setLangOpen(!langOpen)}
                style={{ gap:4 }}>
                <Globe size={14} /> {currentLang?.label} <ChevronDown size={12} />
              </button>
              {langOpen && (
                <div style={{
                  position:'absolute', top:'100%', right:0, marginTop:4, zIndex:200,
                  background:'var(--card)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', overflow:'hidden', minWidth:120
                }}>
                  {languages.map(l => (
                    <button key={l.code} className="btn btn-ghost btn-sm"
                      style={{ width:'100%', justifyContent:'flex-start', borderRadius:0, padding:'8px 12px' }}
                      onClick={() => { changeLang(l.code); setLangOpen(false); }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button className="btn btn-ghost btn-icon"
              onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <button className="btn btn-ghost btn-icon notif-bell"
              onClick={() => navigate('/notifications')}>
              <Bell size={16} />
              {notifCount > 0 && <span className="notif-count">{notifCount > 9 ? '9+' : notifCount}</span>}
            </button>
          </div>
        </header>

        <div className="page-content animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
