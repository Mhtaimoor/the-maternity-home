# The Maternity Home

Custom e-commerce storefront and admin portal for **The Maternity Home** — maternity, postpartum, newborn and baby essentials (Pakistan / PKR).

## Repository

- GitHub: https://github.com/Mhtaimoor/the-maternity-home  
- Revised plan (Markdown): [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)  
- Revised plan (Word): [docs/The_Maternity_Home_Revised_Project_Plan.docx](docs/The_Maternity_Home_Revised_Project_Plan.docx)  
- Work phases (recommended order): [docs/WORK_PHASES.md](docs/WORK_PHASES.md)  
- Original planning input (outside repo): `Desktop/Projects/The_Maternity_Home_Website_Project_Plan.docx`

## What’s changing vs the original plan

The original recommended Shopify or managed WooCommerce. This project builds **everything in-repo**:

| App | Role |
|---|---|
| `apps/web` | Customer storefront (Next.js) |
| `apps/admin` | Staff admin portal (Next.js) |
| `apps/api` | Backend API (NestJS + PostgreSQL) |

## Stack (locked for MVP)

- **Frontend:** Next.js + TypeScript + Tailwind  
- **Backend:** NestJS + Prisma + PostgreSQL  
- **Cache/jobs:** Redis + BullMQ  
- **Payments:** COD + bank/wallet transfer first; then PayFast / Safepay / JazzCash / Easypaisa  
- **Auth:** Guest checkout for customers; JWT + RBAC for admin  

## Monorepo layout

```
the-maternity-home/
├── apps/
│   ├── web/       # Storefront (http://localhost:3000)
│   ├── admin/     # Admin portal (http://localhost:3001)
│   └── api/       # NestJS API (http://localhost:4000)
├── packages/
│   └── shared/    # Shared types / schemas
├── docs/          # Project plans
└── docker-compose.yml
```

## Local setup

Prerequisites: **Node 20+**, **pnpm 9+** (`npm i -g pnpm@9`). Docker is optional (Postgres/Redis); local default is **SQLite**.

```bash
pnpm install
cp .env.example .env
cp .env apps/api/.env
pnpm --filter @tmh/api prisma:generate
pnpm --filter @tmh/api exec prisma migrate deploy
pnpm --filter @tmh/api db:seed
pnpm dev:api    # http://localhost:4000  (docs: /docs)
pnpm dev:web    # http://localhost:3000
pnpm dev:admin  # http://localhost:3001
```

Seeded admin: `owner@thematernityhome.pk` / `Admin123!`  
See [docs/DEFAULTS.md](docs/DEFAULTS.md) and [docs/WORK_PHASES.md](docs/WORK_PHASES.md).

## Status

Phases 0–8 MVP implemented in-repo (storefront, admin, API, COD checkout, order desk, content, coupons, mock payments). Production domain/SSL/merchant gateway credentials remain owner-side.

## License

Private project for The Maternity Home client work unless otherwise stated.
