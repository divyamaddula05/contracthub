# ContractHub — Project Summary

## Overview

ContractHub is a production-ready contract and document workflow system that centralizes contract versioning, role-based approvals, and audit logging. It replaces ad-hoc email/WhatsApp workflows with a secure, auditable lifecycle for enterprise contracts.

## Key Goals

- Versioned contract uploads (immutable versions)
- Role-based access control (ADMIN, CLIENT, REVIEWER)
- Approval workflow (DRAFT → SUBMITTED → APPROVED/REJECTED)
- Comprehensive audit logs for compliance
- Secure JWT authentication and file handling

## Architecture & Tech Stack

- Frontend: React (Vite), Axios, Tailwind CSS
- Backend: Node.js, Express, JWT auth, Multer for uploads
- Database: MongoDB (Mongoose used locally for models)
- Storage: Local `/uploads` (production: S3 or similar recommended)

## Project Structure

```
backend/
  src/
    controllers/
    routes/
    middleware/
    models/
    config/
    utils/
    uploads/
  app.js
  server.js
  .env

frontend/
  src/
    components/
    pages/
    api/
    App.jsx
  package.json
```

## User Roles & Permissions

- **ADMIN**: create contracts, upload versions, view audit logs
- **CLIENT**: review contracts, download versions, approve/reject
- **REVIEWER**: reserved for future review features

All protected routes are guarded by JWT authentication and middleware role checks.

## Contract Lifecycle

- **DRAFT**: created by ADMIN; no versions yet
- **SUBMITTED**: ADMIN uploaded a PDF; awaiting client review
- **APPROVED**: CLIENT approved the current version
- **REJECTED**: CLIENT rejected with a reason; ADMIN revises and uploads a new version

Every upload creates a new `ContractVersion` record and is immutable. Previous versions remain downloadable.

## API Endpoints (Summary)

- `POST /api/auth/register` — register user (CLIENT registration public)
- `POST /api/auth/login` — returns JWT token
- `GET /api/auth/me` — returns current user (protected)

- `POST /api/contracts` — ADMIN creates contract
- `GET /api/contracts` — get contracts (role-filtering on frontend)
- `POST /api/contracts/:id/upload` — ADMIN uploads PDF (Multer)
- `GET /api/contracts/:id/versions` — list versions
- `PUT /api/contracts/:id/approve` — CLIENT approves contract
- `PUT /api/contracts/:id/reject` — CLIENT rejects contract (reason)
- `GET /api/contracts/:id/logs` — ADMIN views audit logs

## Audit Logging

All significant actions are logged to the `auditlogs` collection via `logAction` utility: `CONTRACT_CREATED`, `FILE_UPLOADED`, `CONTRACT_APPROVED`, `CONTRACT_REJECTED`. Logs include user, contract, metadata, and timestamps.

## File Handling

- `Multer` stores PDFs under `backend/uploads/` with timestamped filenames.
- File input validated to accept only `.pdf` extensions.
- Files served statically via `/uploads` route.

## Security

- Passwords hashed with `bcryptjs`.
- JWTs signed with `JWT_SECRET` in `.env`.
- Role-based middleware prevents unauthorized access.
- No secrets committed to repo; environment-driven config.

## Frontend Highlights

- Clean, Tailwind-based UI with `StatusBadge`, `VersionList`, and `ContractCard` components.
- Role-based dashboards for ADMIN and CLIENT.
- Axios interceptor injects JWT for authenticated API calls.

## Running Locally (Quick)

1. Backend
```bash
cd contracthub/backend
npm install
# set .env with PORT, MONGO_URI, JWT_SECRET
node src/server.js
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
```

3. Create test users (helper)
```bash
cd contracthub/backend
node create-users.js
# admin@test.com / client@test.com  password123
```

## Deployment Notes

- Backend: compatible with Render / Railway. Set `MONGO_URI` to Atlas and `JWT_SECRET` in environment.
- Frontend: deploy to Vercel / Netlify; configure `VITE_API_URL` to production API.
- Replace local uploads with S3 (or other object storage) for production scale.

## Next Steps / Improvements

- Migrate DB calls to MongoDB Atlas Data API if required by policy
- Replace local file storage with S3 and signed URLs
- Add email notifications and webhooks
- Implement pagination & search for contracts
- Add automated tests (unit + e2e)

## Contact & Notes

This `PROJECT_SUMMARY.md` provides a high-level overview for developers and stakeholders. For detailed testing steps, see `TESTING_GUIDE.md` in the repository.

---

File regenerated on: 2026-02-08
