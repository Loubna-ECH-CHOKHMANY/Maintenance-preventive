import axios from 'axios';

const API = axios.create({ baseURL: '/api', timeout: 30000 });

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('gmpp_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

API.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refresh = localStorage.getItem('gmpp_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refreshToken: refresh });
          localStorage.setItem('gmpp_token', data.token);
          localStorage.setItem('gmpp_refresh', data.refreshToken);
          orig.headers.Authorization = `Bearer ${data.token}`;
          return API(orig);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:   d => API.post('/auth/login', d),
  refresh: d => API.post('/auth/refresh', d),
  logout:  () => API.post('/auth/logout'),
};

export const machinesAPI = {
  getAll:         () => API.get('/machines'),
  getById:        id => API.get(`/machines/${id}`),
  create:         d  => API.post('/machines', d),
  update:         (id,d) => API.put(`/machines/${id}`, d),
  delete:         id => API.delete(`/machines/${id}`),
  updateCompteur: (id,h) => API.patch(`/machines/${id}/compteur?heures=${h}`),
};

export const pointsAPI = {
  getAll:      () => API.get('/points-maintenance'),
  getByMachine: id => API.get(`/points-maintenance/machine/${id}`),
  create:      d  => API.post('/points-maintenance', d),
  update:      (id,d) => API.put(`/points-maintenance/${id}`, d),
  delete:      id => API.delete(`/points-maintenance/${id}`),
};

export const interventionsAPI = {
  getAll:    () => API.get('/interventions'),
  getById:   id => API.get(`/interventions/${id}`),
  create:    d  => API.post('/interventions', d),
  update:    (id,d) => API.put(`/interventions/${id}`, d),
  delete:    id => API.delete(`/interventions/${id}`),
  confirmer: (id,d) => API.post(`/interventions/${id}/confirmer`, d),
  valider:   id => API.post(`/interventions/${id}/valider`),
  annuler:   (id,j) => API.post(`/interventions/${id}/annuler?justification=${encodeURIComponent(j)}`),
  byMachine: id => API.get(`/interventions/machine/${id}`),
  byPeriode: (s,e) => API.get(`/interventions/periode?start=${encodeURIComponent(s)}&end=${encodeURIComponent(e)}`),
};

export const utilisateursAPI = {
  getAll:  () => API.get('/utilisateurs'),
  create:  d  => API.post('/utilisateurs', d),
  update:  (id,d) => API.put(`/utilisateurs/${id}`, d),
  delete:  id => API.delete(`/utilisateurs/${id}`),
};

export const dashboardAPI = { get: () => API.get('/dashboard') };

export const pannesAPI = {
  getAll:      () => API.get('/pannes'),
  getById:     id => API.get(`/pannes/${id}`),
  getByMachine: id => API.get(`/pannes/machine/${id}`),
  declarer:    d  => API.post('/pannes', d),
  resoudre:    (id,d) => API.put(`/pannes/${id}/resoudre`, d),
  valider:     id => API.put(`/pannes/${id}/valider`),
  delete:      id => API.delete(`/pannes/${id}`),
};

export const stockAPI = {
  getPieces:      () => API.get('/stock/pieces'),
  getPiece:       id => API.get(`/stock/pieces/${id}`),
  getAlertes:     () => API.get('/stock/pieces/alertes'),
  getRuptures:    () => API.get('/stock/pieces/ruptures'),
  getResume:      () => API.get('/stock/resume'),
  createPiece:    d  => API.post('/stock/pieces', d),
  updatePiece:    (id,d) => API.put(`/stock/pieces/${id}`, d),
  deletePiece:    id => API.delete(`/stock/pieces/${id}`),
  mouvement:      (id, type, quantite, motif, userId) =>
    API.post(`/stock/pieces/${id}/mouvement?type=${type}&quantite=${quantite}${motif?`&motif=${encodeURIComponent(motif)}`:''}&userId=${userId||''}`),
  getHistorique:  id => API.get(`/stock/pieces/${id}/historique`),
};

export const kpiAPI = {
  getAll:     (periode='mois') => API.get(`/kpi/machines?periode=${periode}`),
  getMachine: (id, periode='mois') => API.get(`/kpi/machines/${id}?periode=${periode}`),
};

export const notificationsAPI = {
  getMes:     userId => API.get(`/notifications/user/${userId}`),
  getNonLues: userId => API.get(`/notifications/user/${userId}/non-lues`),
  getCount:   userId => API.get(`/notifications/user/${userId}/count`),
  marquerLue: id => API.put(`/notifications/${id}/lire`),
  marquerToutes: userId => API.put(`/notifications/user/${userId}/lire-tout`),
};

export const auditAPI = {
  getAll: (page=0,size=50) => API.get(`/audit?page=${page}&size=${size}`),
  getByUser: email => API.get(`/audit/utilisateur/${email}`),
};

export const exportAPI = {
  interventionsCSV:   () => API.get('/export/interventions/csv', { responseType:'blob' }),
  interventionsExcel: () => API.get('/export/interventions/excel', { responseType:'blob' }),
  stockCSV:           () => API.get('/export/stock/csv', { responseType:'blob' }),
  stockExcel:         () => API.get('/export/stock/excel', { responseType:'blob' }),
  rapportPDF:         (titre='Rapport GMPP') => API.get(`/export/rapport/pdf?titre=${encodeURIComponent(titre)}`, { responseType:'blob' }),
};

export const qrAPI = {
  machine:      id => API.get(`/qrcode/machine/${id}`, { responseType:'blob' }),
  intervention: id => API.get(`/qrcode/intervention/${id}`, { responseType:'blob' }),
};

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default API;
