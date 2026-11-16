# Implementation defaults (no owner blockers)

| Topic | Default chosen | Notes |
|---|---|---|
| Database | SQLite (`DATABASE_URL=file:./dev.db`) | Docker/Postgres unavailable on build machine; `docker-compose.yml` still provides Postgres/Redis when Docker is installed |
| Cart store | In-memory Map | Swap to Redis when `REDIS_URL` is available |
| Admin seed | `owner@thematernityhome.pk` / `Admin123!` | Change immediately in production |
| Order staff seed | `orders@thematernityhome.pk` / `Staff123!` | RBAC-limited |
| Payments | `PAYMENT_PROVIDER=mock` | COD + bank transfer live; gateway uses `/payments/mock/*` until JazzCash/PayFast/Safepay credentials exist |
| Notifications | Log + NotificationLog table | Email/SMS providers not configured |
| Delivery cities | Lahore, Islamabad, Karachi, Faisalabad | Editable in admin |
| Coupon | `WELCOME10` (10% off, min Rs 1500) | Demo only |
| Contacts | WhatsApp/phone `+92 3454105452` (`wa.me/923454105452`) | Update seed/settings if the number changes |

## Run locally

```bash
pnpm install
cp .env.example .env   # already SQLite by default
# ensure apps/api/.env has DATABASE_URL=file:./dev.db
pnpm --filter @tmh/api prisma:generate
pnpm --filter @tmh/api exec prisma migrate deploy
pnpm --filter @tmh/api db:seed
pnpm dev:api    # :4000
pnpm dev:web    # :3000
pnpm dev:admin  # :3001
```
