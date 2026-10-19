# CivicResolve • Municipal Grievance Redressal System

CivicResolve is an integrated public grievance redressal portal empowering citizens with transparent, SLA-monitored civic resolution across all 38 districts of Tamil Nadu.

## Features
- **Citizen Portal**: Geotagged complaint submissions with photo proof and interactive Leaflet OpenStreetMap.
- **AI Classification**: TF-IDF NLP model automatically detects municipal department and predicts priority.
- **Geospatial Duplicate Detection & Multi-Citizen Surge Auto-Escalation**: Aggregates community reports within a 1.5km radius and automatically escalates duplicate clusters to Senior Officers with Critical Priority.
- **Statewide Map**: Real-time interactive Hotspot Map spanning all 38 districts of Tamil Nadu with live GPS tracking.
- **Multi-Stakeholder Portals**: Dedicated workspaces for Citizens, Field Officers, Senior Officers (Department Directors), and Municipal System Admins.
- **Audit Ledger**: Complete timestamped audit trail of status transitions, officer re-assignments, and SLA countdowns.

---

## Quick Start (For Team Members)

### 1. Clone the Repository
```bash
git clone <YOUR_REPO_URL>
cd <REPO_FOLDER>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment (For Team Members)

### Build & Run Locally
```bash
# Build production bundles (React client + Express backend)
npm run build

# Start production server
npm start
```
Server runs on `http://localhost:3000` (or `PORT` environment variable).

---

## Deploy to Cloud Platforms

### 1. Deploy on Render / Railway
1. Create a new **Web Service** and select your GitHub repository.
2. Configure:
   - **Environment**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Click **Deploy**. Both the client and API are served together.

### 2. Deploy with Docker (Cloud Run / AWS / VPS)
```bash
docker build -t civicresolve .
docker run -p 3000:3000 civicresolve
```
