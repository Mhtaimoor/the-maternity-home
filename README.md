# The Maternity Home

Custom e-commerce storefront and admin portal for **The Maternity Home** — maternity, postpartum, newborn and baby essentials (Pakistan / PKR).

## Repository

- GitHub: https://github.com/Mhtaimoor/the-maternity-home  
- Revised plan (Markdown): [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)  
- Revised plan (Word): [docs/The_Maternity_Home_Revised_Project_Plan.docx](docs/The_Maternity_Home_Revised_Project_Plan.docx)  
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
│   ├── web/       # Storefront
│   ├── admin/     # Admin portal
│   └── api/       # NestJS API
├── packages/
│   └── shared/    # Shared types / schemas
├── docs/          # Project plans
└── docker-compose.yml
```

## Status

Phase 0 — repository and revised plan created. Application scaffolding and implementation start next.

## License

Private project for The Maternity Home client work unless otherwise stated.
