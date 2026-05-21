# GMPP Pro v2.0 — Gestion de Maintenance Préventive Planifiée

## 🚀 Démarrage rapide

```bash
# 1. Copier le fichier .env
cp .env.example .env

# 2. Lancer tout le stack
docker-compose up --build

# 3. Accès
# Frontend : http://localhost:3000
# Swagger  : http://localhost:8080/api/swagger-ui.html
# pgAdmin  : http://localhost:5050
```

## 👥 Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@gmpp.ma | Admin@2024 | Administrateur |
| responsable@gmpp.ma | Resp@2024 | Responsable Maintenance |
| chef@gmpp.ma | Chef@2024 | Chef d'Équipe |
| tech1@gmpp.ma | Tech@2024 | Technicien |
| tech2@gmpp.ma | Tech@2024 | Technicien |

## 📦 Modules

| Module | Description |
|--------|-------------|
| Dashboard | KPI live, alertes, graphiques temps réel |
| Machines | CRUD complet + compteur horaire + QR code |
| Points maintenance | Périodicités, consommables, fréquences |
| Interventions | Workflow complet (planifier → confirmer → valider) |
| Planning | Calendrier semaine/mois/liste avec création rapide |
| Pannes correctives | Déclaration → Résolution → Validation avec workflow visuel |
| Stock pièces | Inventaire, mouvements entrée/sortie, alertes seuil |
| KPI & Performance | MTBF, MTTR, OEE, TRS, Pareto pannes, radar |
| Rapports | Export PDF, Excel, CSV |
| Notifications | Centre temps réel via WebSocket + polling |
| QR Code | Génération et téléchargement PNG |
| Audit logs | Traçabilité complète (admin only) |
| Multilingue | Français, English, العربية |
| Dark/Light mode | Commutable en temps réel |

## 🏗️ Architecture

- **Backend** : Java 17 + Spring Boot 3.2 + Spring Security + JWT
- **Frontend** : React 18 + Recharts + Lucide Icons
- **Base de données** : PostgreSQL 15
- **Exports** : iText7 (PDF) + Apache POI (Excel) + OpenCSV
- **QR Code** : Google ZXing
- **WebSocket** : Spring WebSocket
- **Déploiement** : Docker + Docker Compose
- **Backup** : pg_dump quotidien automatique
