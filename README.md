
<a id="disaster-response-system"></a>

<p align="center">
  <img src="frontend/frontend/public/banner.png" alt="Disaster Response System Banner" width="85%">
</p>

<h1 align="center">Disaster Response System 🚨</h1>
<p align="center">
  A Real-Time Disaster Management Platform for Citizens, Volunteers & Administrators
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.137-009688?logo=fastapi">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python">
  <img src="https://img.shields.io/badge/WebSockets-native-8A2BE2">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql">
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite">
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38BDF8?logo=tailwindcss">
  <img src="https://img.shields.io/badge/Docker-supported-2496ED?logo=docker">
  <img src="https://img.shields.io/badge/license-MIT-green">
</p>

**Disaster Response System** is a full-stack web application designed to coordinate emergency response in real time — connecting citizens who report incidents, volunteers who respond on the ground, and administrators who manage resources, assignments, and alerts from a central command dashboard.
Built with FastAPI, React 19, PostgreSQL, and WebSockets, it provides role-based dashboards, live notifications, interactive maps, and a complete incident lifecycle management system.

## Table of Contents
- [💡 About the Project](#about-the-project)
- [🎥 Demo Video](#demo-video)
- [⚡ Quick Start](#quick-start)
- [✨ Features](#features)
- [🗂️ Project Structure](#project-structure)
- [🖥️ Tech Stack](#tech-stack)
- [📄 Pages & Dashboards](#pages--dashboards)
- [🔌 API Modules](#api-modules)
- [🔔 Real-Time WebSockets](#real-time-websockets)
- [🚀 Getting Started](#getting-started)
- [🛠️ Run with Docker](#run-with-docker)
- [🔒 Environment Variables](#environment-variables)
- [🚀 Future Enhancements](#future-enhancements)
- [🤝 Contributing](#contributing)
- [🙏 Acknowledgements](#acknowledgements)
- [📜 License](#license)

---

## 🎥 Demo Video

👉 [Click here to watch the demo](https://drive.google.com/file/d/1hV92IAF-IkvePqFrULZXeqYs8qe1UJpQ/view?usp=sharing)

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## ⚡ Quick Start

```bash
# Backend (use Python 3.10+ — 3.11+ recommended; 3.9 will fail)
cd Disaster_Management_System/backend
py -3.12 -m venv .venv        # Windows — or: python3.11 -m venv .venv
.venv\Scripts\activate        # Windows | source .venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (new terminal)
cd Disaster_Management_System/frontend/frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The backend API runs at [http://localhost:8000](http://localhost:8000). API docs at [http://localhost:8000/docs](http://localhost:8000/docs). 🚀

**Demo accounts** (auto-seeded when `ENV=development`):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `Demo@1234` |
| Citizen | `citizen@demo.com` | `Demo@1234` |
| Volunteer | `volunteer@demo.com` | `Demo@1234` |

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 💡 About the Project

**Disaster Response System** is a role-driven emergency coordination platform. It allows:

- **Citizens** to report incidents with location, images, and severity—and track their status in real time
- **Volunteers** to browse available incidents nearby, accept assignments, and get live alerts
- **Administrators** to manage the full pipeline—from incident triage and volunteer assignment to resource dispatch and analytics reporting

The platform uses **JWT-based authentication** with role-specific protected routes, a **notification engine** with severity-based WebSocket push, **Leaflet maps** for geospatial incident plotting, and **Recharts** for analytics dashboards.

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## ✨ Features

- **Role-Based Access Control** — Separate dashboards and protected routes for Citizens, Volunteers, and Admins
- **Incident Reporting & Lifecycle** — Citizens submit incidents (title, description, lat/lng, type, severity, photo upload). Full status flow: `REPORTED → VERIFIED → IN_PROGRESS → RESOLVED → ARCHIVED`
- **Real-Time WebSocket Notifications** — Native FastAPI WebSockets push live alerts to all connected dashboards via `useNotifications` + `NotificationCenter` (see [Real-Time WebSockets](#real-time-websockets))
- **Notification Engine** — Severity-based delivery rules (`LOW` = silent, `MEDIUM` / `CRITICAL` = WebSocket popup) with 2-minute per-event rate limiting
- **Interactive Maps** — Leaflet + React-Leaflet map views for Citizens, Volunteers, and Admins; reverse geocoding via OpenStreetMap Nominatim
- **Nearby Incident Search** — Server-side Haversine radius search (up to 500 km)
- **Volunteer Assignment System** — Admins assign/release volunteers to incidents; volunteers can self-assign from available incidents; assignment history logged
- **Resource Management** — Track quantity, availability, and status (`available`, `partially_used`, `in_use`); assign/release resources to incidents
- **Alerts Management** — Admins broadcast alerts with type, target audience (`all` / `citizen` / `volunteer`), and active/inactive state
- **Analytics Dashboard** — Admin aggregate stats for incidents, volunteers, resources, and alerts (Recharts)
- **JWT Authentication** — Secure token-based login with role-aware redirects and route protection
- **Demo User Seeding** — Auto-creates admin, citizen, and volunteer demo accounts in development
- **Zustand State Management** — Lightweight global state for auth and notification UI
- **React Query Caching** — Efficient server-state syncing with stale-time and retry configuration
- **Docker Support** — Containerised backend + PostgreSQL via `docker-compose`
- **DB Migrations** — Alembic-managed schema versioning + lightweight startup migrations for existing DBs

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🗂️ Project Structure


```
Disaster_Management_System/
│
├── README.md                          # Project documentation
│
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry — CORS, routers, startup seed
│   │   ├── auth/                      # JWT login, register, role guards
│   │   ├── users/                     # User model + /me profile route
│   │   ├── citizens/                  # Citizen profile model (linked to users)
│   │   ├── incidents/                 # Incident CRUD, photos, lifecycle, nearby
│   │   ├── volunteers/                # Volunteer profiles, assign/release
│   │   ├── resources/                 # Resource inventory and allocation
│   │   ├── alerts/                    # Alert broadcast system
│   │   ├── assignments/               # Assignment history + DB/in-memory store
│   │   ├── analytics/                 # Aggregate stats endpoints
│   │   ├── notifications/             # Real-time WebSocket notifications
│   │   │   ├── ws_routes.py           # /ws/admin, /ws/citizen, /ws/volunteer
│   │   │   ├── ws_manager.py          # Shared connection pool + broadcast
│   │   │   ├── engine.py              # notify() — severity rules + rate limit
│   │   │   ├── severity.py            # LOW / MEDIUM / CRITICAL delivery rules
│   │   │   └── rate_limit.py          # 2-minute cooldown per event key
│   │   ├── common/                    # Shared pagination, filtering, schemas
│   │   └── core/                      # config, database, security, demo seed
│   │
│   ├── alembic/                       # Alembic migration config (env.py)
│   ├── alembic.ini                    # Alembic settings
│   ├── uploads/                       # Runtime incident photo storage
│   ├── requirements.txt               # Pinned Python dependencies
│   ├── Dockerfile                     # Backend Docker image
│   ├── docker-compose.yml             # Backend + PostgreSQL
│   ├── .env                           # Environment variables (not committed)
│   ├── adminlogin.py                  # Manual admin seeder script
│   ├── cleanup_volunteers.py          # DB cleanup utility
│   └── test_e2e.py                    # End-to-end API smoke tests
│
└── frontend/
    └── frontend/                      # Main React app (Vite)
        ├── public/                    # Static assets (banner, favicon, images)
        ├── index.html                 # Vite HTML entry
        ├── package.json
        ├── vite.config.js             # Dev server + /api proxy
        ├── vercel.json                # Vercel deploy config
        ├── eslint.config.js
        └── src/
            ├── main.jsx               # React entry point
            ├── App.jsx                # React Query + Toaster + Router
            ├── App.css / index.css    # Global styles
            │
            ├── api/                   # Axios service layer
            │   ├── axiosInstance.js   # JWT interceptors, base URL
            │   ├── authService.js     # Login, register
            │   ├── incidentService.js # Incident CRUD + image upload
            │   ├── volunteerService.js# Volunteer profile + assignments
            │   ├── resourceService.js # Resource fetch + management
            │   ├── alertService.js    # Alert fetch + management
            │   └── geocodeService.js  # OpenStreetMap Nominatim geocoding
            │
            ├── assets/                # Bundled images (hero, icons)
            │
            ├── components/
            │   ├── NotificationCenter.jsx
            │   ├── auth/                # LoginModal, RegisterModal
            │   └── ui/                  # Button, Input, Badge, Modal, etc.
            │
            ├── hooks/
            │   └── useNotifications.js  # WebSocket hook — connects on login
            │
            ├── layouts/
            │   └── DashboardLayout.jsx  # Sidebar nav + notification bell
            │
            ├── pages/
            │   ├── LandingPage.jsx
            │   ├── NotFound.jsx
            │   ├── citizen/
            │   │   ├── CitizenDashboard.jsx
            │   │   ├── CitizenOverview.jsx
            │   │   ├── ReportIncident.jsx
            │   │   ├── MyIncidents.jsx
            │   │   ├── IncidentDetail.jsx
            │   │   ├── NearbyIncidents.jsx
            │   │   ├── CitizenAlerts.jsx
            │   │   └── CitizenProfile.jsx
            │   ├── volunteer/
            │   │   ├── VolunteerDashboard.jsx
            │   │   ├── VolunteerOverview.jsx
            │   │   ├── AvailableIncidents.jsx
            │   │   ├── MyAssignments.jsx      # uses GET /assignments/volunteer/{id}
            │   │   ├── IncidentDetails.jsx
            │   │   ├── VolunteerMapView.jsx
            │   │   ├── Alerts.jsx
            │   │   └── VolunteerProfile.jsx
            │   └── admin/
            │       ├── AdminDashboard.jsx
            │       ├── AdminOverview.jsx      # uses GET /assignments/
            │       ├── IncidentManagement.jsx # uses GET /assignments/
            │       ├── IncidentDetails.jsx    # uses GET /assignments/incident/{id}
            │       ├── VolunteerManagement.jsx
            │       ├── ResourceManagement.jsx
            │       ├── ResourceDetails.jsx
            │       ├── AlertsManagement.jsx
            │       ├── Analytics.jsx
            │       └── AdminMapView.jsx
            │
            ├── routes/
            │   ├── AppRouter.jsx        # Lazy routes + role redirects
            │   └── ProtectedRoute.jsx   # Role-guarded route wrapper
            │
            ├── store/
            │   ├── authStore.js         # User, token, isAuthenticated
            │   └── uiStore.js           # Notifications, modals, sidebar
            │
            └── utils/
                └── helpers.js           # getRolePath, formatters
```

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🖥️ Tech Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) `0.137` — high-performance async Python web framework
- **Language**: Python `3.10+` (`3.11+` recommended; `3.9` is not supported)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) `2.0` + [Alembic](https://alembic.sqlalchemy.org/) for migrations
- **Database**: [PostgreSQL 15](https://www.postgresql.org/)
- **Auth**: JWT via `python-jose` + `passlib` + `bcrypt`
- **Real-Time**: Native FastAPI WebSockets + `websockets` package (via `uvicorn[standard]`)
- **File Uploads**: `python-multipart` (incident photos stored in `uploads/incidents/`)
- **Server**: Uvicorn `0.49` (ASGI)

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management**: [Zustand v5](https://zustand-demo.pmnd.rs/)
- **Server State**: [@tanstack/react-query v5](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/) with JWT interceptors
- **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet v5](https://react-leaflet.js.org/)
- **Charts**: [Recharts v3](https://recharts.org/)
- **Forms**: [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup) validation
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/) + [React Icons](https://react-icons.github.io/)
- **Toast Notifications**: [react-hot-toast](https://react-hot-toast.com/)

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **CORS**: FastAPI CORSMiddleware configured for `localhost:5173` + optional `FRONTEND_URL`
- **Dev Proxy**: Vite proxies `/api` → `http://127.0.0.1:8000` (frontend uses `baseURL: '/api/v1'`)

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 📄 Pages & Dashboards

Routes below match the **sidebar navigation** in each role's dashboard.

### 🌐 Public
| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Hero, features, auth modals (`?auth=login` or `?auth=register`) |
| `/login`, `/register` | Redirects | Redirect to landing page with auth modal |

### 👤 Citizen (`/citizen/*`)
| Route | Page | Description |
|---|---|---|
| `/citizen/dashboard` | Overview | Summary stats, recent incidents, quick actions |
| `/citizen/report` | Report Incident | Form to submit new incidents with image upload |
| `/citizen/incidents` | My Incidents | List of all incidents submitted by the citizen |
| `/citizen/incidents/:id` | Incident Detail | Full detail view with status updates |
| `/citizen/nearby` | Nearby Incidents | Map view of incidents in the citizen's area |
| `/citizen/alerts` | Alerts | Live emergency alerts broadcast |
| `/citizen/profile` | Profile | View and update citizen profile |

### 🦺 Volunteer (`/volunteer/*`)
| Route | Page | Description |
|---|---|---|
| `/volunteer/dashboard` | Overview | Dashboard with assignments, stats, and quick actions |
| `/volunteer/available` | Available Incidents | Browse open incidents available to accept |
| `/volunteer/assignments` | My Assignments | All current and past assignments |
| `/volunteer/assignments/:id` | Assignment Detail | Incident view from an assignment |
| `/volunteer/incidents/:id` | Incident Details | Full incident view from volunteer perspective |
| `/volunteer/map` | Map View | Leaflet map showing geolocated incidents |
| `/volunteer/alerts` | Alerts | Emergency alert feed |
| `/volunteer/profile` | Profile | Volunteer profile management |

### 🛡️ Admin (`/admin/*`)
| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | Overview | Command centre — system-wide stats and KPIs |
| `/admin/incidents` | Incident Management | View, filter, update, and assign all incidents |
| `/admin/incidents/:id` | Incident Details | Deep-dive incident management with assignment controls |
| `/admin/volunteers` | Volunteer Management | Manage volunteers, view profiles, check availability |
| `/admin/resources` | Resource Management | Track and allocate emergency resources |
| `/admin/resources/:id` | Resource Details | Detailed resource view with assignment history |
| `/admin/alerts` | Alert Management | Broadcast and manage system-wide alerts |
| `/admin/analytics` | Analytics | Aggregate charts — incident, volunteer, resource, and alert stats |
| `/admin/map` | Map View | System-wide incident map for command overview |

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🔌 API Modules

All REST routes are mounted under the prefix `/api/v1`.

| Module | Prefix | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Register (citizen/volunteer/admin), login, login-json |
| Users | `/api/v1/users` | Current user profile (`GET /me`) |
| Incidents | `/api/v1/incidents` | CRUD, lifecycle (verify/start/resolve/archive), photos, nearby search |
| Volunteers | `/api/v1/volunteers` | Volunteer profiles, assign/release incidents |
| Resources | `/api/v1/resources` | Resource inventory, assign/release to incidents |
| Alerts | `/api/v1/alerts` | Create, list, deactivate, and delete broadcast alerts |
| Assignments | `/api/v1/assignments` | Assignment history by incident, volunteer, or resource |
| Analytics | `/api/v1/analytics` | Admin aggregate stats (incidents, volunteers, resources, alerts) |
| Health | `/health`, `/test-db` | Root-level health check and DB connectivity test |

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🔔 Real-Time WebSockets

This project uses **real native WebSockets** (not polling or SSE). Connections are accepted by FastAPI and push JSON notifications to connected dashboards in real time.

### Endpoints

| Role | WebSocket URL |
|---|---|
| Admin | `ws://localhost:8000/api/v1/ws/admin` |
| Citizen | `ws://localhost:8000/api/v1/ws/citizen` |
| Volunteer | `ws://localhost:8000/api/v1/ws/volunteer` |

### How it works

```
Incident / Alert created
        ↓
notifications/engine.py → notify()
        ↓
Severity rules + 2-min rate limit
        ↓
ws_manager.py → broadcast({ title, message, severity })
        ↓
All active WebSocket clients receive JSON
        ↓
Frontend useNotifications hook → uiStore → NotificationCenter bell
```

1. **Backend** — `ws_routes.py` accepts connections per role; `ConnectionManager` keeps a **single shared** socket pool and `broadcast()` sends JSON to every connected client (all roles receive the same push).
2. **Notification engine** — `notify()` is called from incident and alert routes. Delivery depends on severity:
   - `LOW` — no WebSocket popup
   - `MEDIUM` / `CRITICAL` — WebSocket popup to all connected clients
3. **Rate limiting** — Same event key is throttled to once every 2 minutes (in-process).
4. **Frontend** — `useNotifications.js` (called from `DashboardLayout` on login) opens `new WebSocket(...)` and pushes incoming messages into the `NotificationCenter` via Zustand `uiStore`.

### What triggers a push?

- New incident reported
- Incident verified, started, or resolved
- Admin creates a broadcast alert

### Verify it's working

1. Start backend + frontend and log in as any role.
2. Check backend logs for: `WebSocket /api/v1/ws/{role} [accepted]` and `connection open`.
3. From another tab (admin), create an alert or report an incident — the notification bell should update live.

> **Note:** WebSocket URL is currently hardcoded to `ws://localhost:8000` in `useNotifications.js`. For production, make this configurable via an env variable.

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🚀 Getting Started

### Prerequisites
- Python `3.10+` (`3.11+` recommended — **Python 3.9 will not work** with pinned `uvicorn`/`click`)
- Node.js `18+` and npm
- PostgreSQL `15+`
- Git

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Disaster_Management_System/backend
   ```

2. Create and activate a virtual environment (**use Python 3.10+**):
   ```bash
   py -3.12 -m venv .venv          # Windows
   python3.11 -m venv .venv        # macOS/Linux
   .venv\Scripts\activate          # Windows
   source .venv/bin/activate       # macOS/Linux
   ```

3. Install dependencies (pinned versions in `requirements.txt`):
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file:
   ```env
   APP_NAME=Disaster Response System
   ENV=development
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/disaster_db
   SECRET_KEY=your_secret_key
   ADMIN_SECRET_KEY=your_admin_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   FRONTEND_URL=http://localhost:5173
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

   API is live at [http://localhost:8000](http://localhost:8000) | Docs at [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd Disaster_Management_System/frontend/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

   App is live at [http://localhost:5173](http://localhost:5173)

   Optional: set `VITE_API_BASE_URL` (defaults to `/api/v1`; Vite dev proxy handles `/api` → backend).

### Seed Admin Account (optional)

Demo users are auto-created when `ENV=development`. To manually seed an admin:

```bash
cd backend
python adminlogin.py
```

| Demo Account | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `Demo@1234` |
| Citizen | `citizen@demo.com` | `Demo@1234` |
| Volunteer | `volunteer@demo.com` | `Demo@1234` |

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🛠️ Run with Docker

Run the entire backend stack (FastAPI + PostgreSQL) with Docker Compose:

### Build and start:
```bash
cd backend
docker-compose up --build
```

### Stop containers:
```bash
docker-compose down
```

The backend will be available at `http://localhost:8000` and PostgreSQL at port `5432`.

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🔒 Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

| Variable | Description | Example |
|---|---|---|
| `APP_NAME` | Application name | `Disaster Response System` |
| `ENV` | Environment mode (`development` seeds demo users) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/disaster_db` |
| `SECRET_KEY` | JWT signing secret (**required**) | `supersecretkey123` |
| `ADMIN_SECRET_KEY` | Admin registration secret (**required**) | `superadmin123` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry duration | `60` |
| `FRONTEND_URL` | Extra CORS origin for production frontend | `http://localhost:5173` |

### Frontend (optional)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Axios API base path | `/api/v1` |

> ⚠️ **Never commit your `.env` file to version control.** It is already listed in `.gitignore`.

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🚀 Future Enhancements

- 📱 Mobile application (React Native) for field volunteers
- 📧 Email & SMS alert integration (SendGrid, Twilio)
- 🔑 Password reset flow in the login UI
- 📝 Report Wrong Info — flag incorrect incident data
- 🗺️ Real-time volunteer GPS tracking on the map
- 📊 Exportable PDF/CSV reports from the analytics dashboard
- 🤖 AI-based incident severity classification
- 🌍 Multi-language support (Hindi, Telugu, English)
- 🔐 OAuth2 social login (Google, Microsoft)

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#disaster-response-system">⬆ Back to top</a>)</p>

---

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) — Modern, high-performance Python web framework
- [React](https://react.dev/) — The UI library powering all dashboards
- [PostgreSQL](https://www.postgresql.org/) — Reliable relational database engine
- [Leaflet](https://leafletjs.com/) — Open-source interactive maps
- [Recharts](https://recharts.org/) — Composable charting for analytics
- [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight global state management
- [TanStack Query](https://tanstack.com/query) — Powerful server-state synchronization
- [Docker](https://www.docker.com/) — Container platform for consistent environments

---

## 📜 License

Distributed under the MIT License.

---

*This project is maintained by **Bellamkonda Thishitha Sai, Gudiwada Sruthi**. For support, please open an issue in the repository.*
