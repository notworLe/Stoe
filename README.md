---
title: "Maison de Lua — Editorial Ao Dai Rental Platform (Melbourne, AUD)"
doc_type: readme
project: retail-system
layer: fullstack
author: notworLe
ai_assisted: true
ai_agent: Antigravity
created: 2026-11-08
updated: 2026-11-22
last_updated_by: Antigravity
version: 2.0.0
status: active
reviewers: []
related_docs:
  - docs/BUSINESS_REQUIREMENT.md
  - .agents/log/DECISION_LOG.md
  - .agents/log/AI_THINKING.md
tags: [readme, maison-de-lua, ao-dai-rental, aud, nextjs, fastapi, postgresql, admin]
---

# Maison de Lua (`maisondelua`) — Editorial Ao Dai Rental Platform

Fullstack Vietnamese Ao Dai rental storefront and studio admin platform in **Melbourne, Australia** — 100% English, priced exclusively in **Australian Dollars (AUD)**.

---

## 1. Core Capabilities

### Customer (Guest) Flow
1. **Browse Archive (`/product`) & Garment Detail (`/product/[slug]`)**:
   - Filter by Occasion, Size, Colour, and Price (AUD).
   - Inspect unique garment code (`AD-12`), model height reference, and 3-point cm size guide (Bust, Waist, Hip, Length).
2. **Delivery Method (`Pick in Person` vs `Transport Post`)**:
   - **Pick in Person** (Melbourne Studio, `$0.00 AUD`): Supports **all rental packages — 1, 2, 4, and 8 days**.
   - **Transport Post** (Australia Post Express, configurable fee default `$16.95 AUD`): Supports **4-day and 8-day packages only** (1-day and 2-day disabled/rejected on both Frontend and Backend).
3. **Mandatory 1-Day Same-Garment Turnaround Gap**:
   - Consecutive bookings of the same garment require at least **1 full calendar day gap** for eco-steaming, inspection, and UV sanitization (enforced on calendar UI and PostgreSQL checkout validation).
4. **Guest Checkout & Automated AUD Email Invoice (`/checkout`)**:
   - No login required: Guest details + Australian shipping address (required for `Transport Post`) → AUD Payment (`Card`, `Bank Transfer / PayID`, or `Pay at Studio`) → Tax Invoice (`INV-MDL-...`) dispatched by email (SMTP if configured, or saved HTML invoice preview).

### Admin Studio Console (`/admin`)
Default seeded login: `admin@maisondelua.com.au` / `admin123` (configurable via `ADMIN_EMAIL` / `ADMIN_PASSWORD`).
1. **Website Settings**: Edit brand name (`Maison de Lua`), handle (`maisondelua`), logo (`/images/image.png` or upload new file), Hero/About/Spotlight/MetadataBar content, studio contact/bank/PayID, and AUD fee rules.
2. **Ao Dai Catalog CRUD**: Create, edit, upload garment photos, configure AUD 4-day base rates, size measurements & availability, and archive/delete garments.
3. **Bookings Operations**: Search/filter bookings, view delivery schedules & 1-day care gaps, and update booking statuses (`pending`, `confirmed`, `active`, `returned`, `cancelled`).
4. **Transactions & Invoices**: Track AUD paid/pending/refunded revenue, update payment statuses, preview emailed HTML invoices, and resend invoice emails.

---

## 2. Quick Start (Windows PowerShell — No Docker Required)

```powershell
# 1. Configure PostgreSQL credentials in .env (copied from .env.example)
.\runs\setup.ps1

# 2. Start Backend (8000) + Frontend (3000) together
.\runs\start-app.ps1
# (Or open 2 separate PowerShell windows: .\runs\start-app.ps1 -NewWindows)

# 3. Stop all local servers cleanly (ports 8000 & 3000)
.\runs\stop-app.ps1
```
- Individual runners: `.\runs\backend.ps1`, `.\runs\frontend.ps1`, `.\runs\test.ps1`
- Storefront: `http://localhost:3000`
- Admin Console: `http://localhost:3000/admin` (`admin@maisondelua.com.au` / `admin123`)
- Backend API & Swagger Docs: `http://localhost:8000/docs`

### Optional: Production Deployment (Render Docker Backend + Vercel Frontend + Supabase)
- Full setup guide (Supabase PostgreSQL Session Pooler, Supabase Storage CDN, Render Blueprint [`render.yaml`](render.yaml), and Vercel Frontend): see [`docs/DEPLOY_RENDER_SUPABASE.md`](docs/DEPLOY_RENDER_SUPABASE.md).

### Optional: Docker Compose (Frontend + Backend + PostgreSQL 17)
```bash
cp .env.example .env
docker compose up --build
```

---

## 3. Verification & Tests

```bash
# Backend lint & test suite
cd backend && uv run ruff check . && uv run pytest -v

# Frontend lint, typecheck & production build
cd frontend && npm run lint && npx tsc --noEmit && npm run build
```

---

## Change History

| Version | Date | Author | Agent | Summary |
| :--- | :--- | :--- | :--- | :--- |
| 2.1.0 | 2026-11-22 | notworLe | Antigravity | Added Render (Docker Backend) + Vercel (Frontend) + Supabase Storage deployment config and guide |
| 2.0.0 | 2026-11-22 | notworLe | Antigravity | Rebuilt fullstack Maison de Lua platform (English, AUD, FastAPI + PostgreSQL, Guest Checkout + Invoice Email, Admin Console) |
| 1.1.0 | 2026-11-11 | notworLe | Antigravity | Added system overview, folder structure, Mermaid architecture, and booking features |
| 1.0.0 | 2026-11-10 | notworLe | Antigravity | Added local start script and Docker Compose instructions |
| 0.1.0 | 2026-11-08 | notworLe | Antigravity | Initial project setup |
