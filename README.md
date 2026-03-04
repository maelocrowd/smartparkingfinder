# Smart Corridor Parking Finder (Web + Mobile-ready)

Smart Corridor Parking Finder is a mobile-first web application for discovering parking facilities along a corridor, viewing them on an interactive map, and analysing usage via an admin dashboard.

- **Frontend**: React, Vite, TypeScript, Leaflet, React Router
- **Backend**: Flask, Flask-SQLAlchemy, SQLite (PostgreSQL-ready)
- **Maps & Geo**: GeoJSON parking data, OpenStreetMap tiles, OSRM routing, heatmap for activity

---

## Features

- **Public map**
  - Loads parking facilities from a GeoJSON `FeatureCollection` (Point geometries).
  - Interactive Leaflet map (mouse + touch zoom, OSM base layer).
  - **Search with autosuggest** by name/address and zoom-to-feature.
  - **Nearby parking** using browser geolocation and Haversine distance.
  - **Routing**
    - Nearby: route from user location to nearest parking.
    - Route-to-selected: geolocate and route from user to a selected search result.
  - Click parking markers to see details (name, address, capacity/status if present).

- **User tracking & analytics**
  - Anonymous users identified by UUID stored in `localStorage`.
  - Activities logged to SQLite via REST:
    - `APP_LOAD`, `SEARCH`, `NEARBY_SEARCH`, `IDENTIFY`, `GEOLOCATION`.

- **Admin dashboard**
  - Token-protected (`ADMIN_TOKEN`) admin endpoints.
  - Total users, activity breakdown (bar + pie charts).
  - Top facilities by IDENTIFY clicks.
  - Activity heatmap (geolocated events + parking-click density).

- **Deployment-friendly**
  - Backend in a single Flask app (`wsgi:app`), Dockerfile included.
  - Frontend built with Vite for static hosting behind a reverse proxy.

---

## Project Structure

- `backend/`
  - `app/`
    - `__init__.py` – Flask app factory, loads `.env`, registers blueprints.
    - `config.py` – environment-based configuration.
    - `models.py` – `User`, `UserActivity` SQLAlchemy models.
    - `geojson_loader.py` – loads & validates parking GeoJSON.
    - `services/`
      - `parking_service.py` – list/search/nearby parking (Haversine).
      - `activity_service.py` – activity logging.
      - `admin_service.py` – totals, summaries, top facilities, heatmap points.
    - `routes/`
      - `parking_routes.py` – `/api/parking`, `/api/parking/nearby`.
      - `activity_routes.py` – `/api/activity`.
      - `admin_routes.py` – `/api/admin/*`.
    - `middleware/auth.py` – `ADMIN_TOKEN` check.
  - `wsgi.py` – entrypoint for Gunicorn/Flask.
  - `requirements.txt` – backend dependencies.
  - `Dockerfile` – production container for the API.
  - `.env.example` – sample environment file.

- `frontend/`
  - `src/`
    - `main.tsx` – React entry (router: `/` map, `/admin` dashboard).
    - `AppShell.tsx` – layout (header, footer, navigation).
    - `routes/`
      - `MapPage.tsx` – public map UI and routing logic.
      - `AdminDashboardPage.tsx` – admin KPIs, charts, heatmap.
    - `components/`
      - `MapView.tsx` – Leaflet map with markers and route polyline.
      - `SearchBar.tsx` – autosuggest search + logging.
      - `NearbyButton.tsx` – nearby parking via geolocation.
      - `RouteToSelectedButton.tsx` – route from user to selected parking.
      - `admin/StatsCards.tsx`, `ActivityChart.tsx`, `ActivityPieChart.tsx`,
        `TopFacilitiesTable.tsx`, `ActivityHeatmap.tsx`.
    - `services/`
      - `api.ts` – fetch helpers.
      - `parkingApi.ts`, `activityApi.ts`, `adminApi.ts`, `routingApi.ts`.
    - `hooks/`
      - `useUserUUID.ts` – persistent anonymous user ID.
      - `useGeolocation.ts` – wrap `navigator.geolocation`.
    - `styles.css` – dark, mobile-first styling.
  - `vite.config.ts` – dev server and `/api` proxy to backend.
  - `package.json`, `tsconfig.json`.

---

## Backend Setup (Flask API)

### 1. Create and configure `.env`

In `backend/.env` (you can copy from `.env.example`):

```env
FLASK_APP=wsgi:app
FLASK_ENV=development

ADMIN_TOKEN=your-strong-admin-token
PARKING_GEOJSON=C:\Users\YOU\Cooridor Parking App\backend\data\parking.geojson

# optional: override default SQLite file
# DATABASE_URL=sqlite:///app.db
```

Adjust the path to your GeoJSON file.

### 2. Install and run

```powershell
cd "C:\Users\YOU\Cooridor Parking App\backend"
python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

# create DB tables once
python -c "from app import create_app, db; app = create_app(); ctx = app.app_context(); ctx.push(); db.create_all(); ctx.pop()"

# run API on http://127.0.0.1:8000
python -m flask run --host 0.0.0.0 --port 8000
```

Test:

- `GET http://127.0.0.1:8000/api/parking` – returns parking FeatureCollection.
- `GET http://127.0.0.1:8000/api/admin/total-users` – with `Authorization: Bearer <ADMIN_TOKEN>`.

---

## Frontend Setup (React + Vite)

### 1. Install dependencies

```powershell
cd "C:\Users\YOU\Cooridor Parking App\frontend"
npm install
```

### 2. Dev server

```powershell
npm run dev
```

By default:

- Frontend: `http://localhost:5173`
- Vite proxies `/api/*` to `http://127.0.0.1:8000` (configured in `vite.config.ts`).

### 3. Usage

- Visit `/`:
  - Explore the map, search with suggestions, click markers.
  - Use **Nearby Parking** to locate nearest facility and show a route.
  - Use **Route to Selected** after a search to route to a chosen parking.

- Visit `/admin`:
  - Enter the **same `ADMIN_TOKEN`** as in `backend/.env`.
  - View KPIs, bar/pie charts, top facilities and heatmap.

---

## API Overview

- `GET /api/parking`
  - Optional `?search=keyword` (case-insensitive name/address).
  - Returns GeoJSON `FeatureCollection`.

- `GET /api/parking/nearby?lat=<float>&lon=<float>&radius=<meters>`
  - Returns parking features within radius (meters) sorted by distance, with `distance` in properties.

- `POST /api/activity`
  - Body: `{ user_uuid, activity_type, timestamp?, latitude?, longitude?, parking_id?, search_query? }`.

- `GET /api/admin/total-users` (Bearer token)
- `GET /api/admin/activity-summary` (Bearer token)
- `GET /api/admin/top-facilities?limit=10` (Bearer token)
- `GET /api/admin/activity-heatmap` (Bearer token)

---

## Deployment Notes

- **Backend Docker**:
  - Build from `backend/Dockerfile`.
  - Provide env vars (`ADMIN_TOKEN`, `PARKING_GEOJSON`, `DATABASE_URL`) via container environment.

- **Frontend build**:
  - From `frontend`:
    ```bash
    npm run build
    ```
  - Serve `frontend/dist` via Nginx or any static host, proxying `/api` to the Flask service.

- **Production considerations**:
  - Use HTTPS at the reverse proxy.
  - Configure CORS origins appropriately in backend config.
  - Point OSRM routing to a stable service or self-hosted instance if necessary.

---

## Attribution

- Map tiles: © OpenStreetMap contributors.
- Routing: OSRM Project.
- **Powered by [GeoNexus](https://sites.google.com/view/geonexus/home)**.

