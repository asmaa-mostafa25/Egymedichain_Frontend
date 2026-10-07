# EGY-MediChain — Frontend

A pharmaceutical supply chain management web application. The frontend provides dashboards and workflows for tracking medicine flow across pharmacies, factories, suppliers/importers, and warehouses.

## Tech Stack

- **React** with **Vite**
- **ASP.NET** backend (consumed via REST API)
- **Zustand** for auth/state management
- **Tailwind CSS** (arbitrary values used for custom design tokens)

## Architecture

The frontend follows a service-layer architecture:

- `httpClient` — centralized HTTP client for API calls
- `toQuery` utilities — query string builders
- **Mapper functions** — transform backend DTOs into frontend-friendly shapes
- **Demo data fallbacks** — the app is fully connected to the live ASP.NET backend; fallback demo data only kicks in when an endpoint returns an empty response (not just on errors), as a safety net for edge cases. A **"Demo Data"** badge is shown whenever fallback data is active.

## Design System

| Token | Value |
|---|---|
| Primary (navy blue) | `#004399` |
| Secondary | `#9EBEF1` |

Status colors and other tokens are defined as CSS custom properties. Inline styles are used throughout components alongside Tailwind.

## Features

- **Authentication** — login page integrated with a Zustand auth store
- **Multi-step registration** — supports four entity types: Pharmacy, Factory, Supplier/Importer, Warehouse
- **Routing & navigation** — `AppRouter.jsx` for routes, `navigation.js` for the sidebar, `HomePage.jsx` with module cards
- **Dashboards** — per-entity dashboards (Pharmacy, Warehouse, Import Operations, Entities Management, System Users & Audit Logs, Alerts & Public Scans)
- **Row-level actions** — activate / deactivate / revoke with optimistic UI updates
- **Per-tab action menus** — entity-specific options via a kebab (MoreVertical) menu
- **Shared review modal** — `ReviewRequestModal.jsx`, reused across pages for approve/reject workflows
- **Loading & error states** — consistent handling across all dashboard pages wired to live endpoints

## Project Structure (key pieces)

```
src/
├── components/
│   └── ReviewRequestModal.jsx      # shared review/approve-reject modal
├── pages/
│   ├── HomePage.jsx
│   ├── PharmacyDashboard.jsx
│   ├── WarehouseDashboard.jsx
│   ├── ImportOperations.jsx
│   ├── EntitiesManagement.jsx
│   ├── SystemUsersAuditLogs.jsx
│   └── AlertsPublicScans.jsx
├── router/
│   └── AppRouter.jsx
├── navigation/
│   └── navigation.js
├── services/                       # httpClient, toQuery, mappers, demo data
└── store/                          # Zustand auth store
```

## Integration Pattern

Each dashboard page follows the same pattern when wiring to the backend:

1. Call the real endpoint per the Swagger/OpenAPI spec
2. Show loading and error states
3. Fall back to demo data on empty (200 OK, empty array) responses
4. Display a "Demo Data" badge when fallback is active
5. Apply optimistic UI updates for row-level actions

## Getting Started

```bash
# install dependencies
npm install

# run the dev server
npm run dev

# build for production
npm run build
```

## Notes

- The frontend is live-connected to the ASP.NET backend across all dashboard pages. Backend endpoints are tracked against a Swagger/OpenAPI spec; some pages (e.g. Warehouse Dashboard) have had their spec audited for gaps — missing endpoints, untyped response schemas, missing DTO fields, undocumented enums/validation.
- Design tokens were extracted from reference screenshots provided for the Ministry of Health portal.
