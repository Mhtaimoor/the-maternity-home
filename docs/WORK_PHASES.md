# The Maternity Home — Recommended Work Phases

**Purpose:** Step-by-step build order for the custom storefront, admin portal, and API.  
**Source plan:** [PROJECT_PLAN.md](./PROJECT_PLAN.md)  
**Rule:** Finish a phase’s exit criteria before starting the next (unless noted as parallel-safe).

**Total engineering estimate (MVP through launch):** ~21–32 working days  
*(Domain, merchant approval, courier onboarding, and owner assets can add calendar time.)*

---

## Phase overview

| Phase | Name | Focus | Estimate | Depends on |
|------:|------|--------|----------|------------|
| 0 | Foundation | Repo, apps scaffold, Docker, CI | 1 day | — |
| 1 | Core backend | Schema, admin auth, RBAC | 2–3 days | 0 |
| 2 | Catalogue ops | Products, categories, inventory (API + admin) | 3–4 days | 1 |
| 3 | Storefront catalogue | Browse, search, PDP, cart | 3–4 days | 2 |
| 4 | Checkout & orders | Place order, reserve stock, confirm, track | 3–4 days | 3 |
| 5 | Order desk | Admin fulfilment + delivery + COD | 2–3 days | 4 |
| 6 | Growth ops | Content, discounts, dashboard, reports | 2–3 days | 5 |
| 7 | Payments & notify | Digital gateway + email/status messages | 3–5 days | 5 (can overlap 6) |
| 8 | Launch | Hardening, QA, backups, go-live | 2–3 days | 6 + 7 MVP |

**MVP go-live path:** Phases **0 → 5** (+ minimal content/policies from Phase 6) are enough to take real COD orders. Phases 6–7 deepen ops; Phase 8 ships.

```
0 Foundation
    ↓
1 Core backend (auth + schema)
    ↓
2 Catalogue (admin can load products)
    ↓
3 Storefront shopping (browse → cart)
    ↓
4 Checkout (customer can place order)
    ↓
5 Order desk (staff can fulfil)  ← first usable shop
    ↓
   ┌──────────────┴──────────────┐
6 Content / promos / reports    7 Gateway + notifications
   └──────────────┬──────────────┘
                  ↓
8 Launch hardening
```

---

## Phase 0 — Foundation

**Goal:** Runnable monorepo and local infrastructure. Nothing customer-facing yet.

### Work
- [x] Scaffold `apps/web`, `apps/admin`, `apps/api` (Next.js + NestJS + TypeScript)
- [x] pnpm workspaces + `packages/shared`
- [ ] Confirm `docker-compose.yml` (Postgres + Redis) starts cleanly *(requires Docker Desktop on the machine)*
- [x] Shared lint/format config; GitHub Actions: install + typecheck stub
- [x] `.env.example` wired; document `pnpm install` / `docker compose up`

### Exit criteria
- [ ] API health route responds locally  
- [ ] Both Next apps boot (empty shells OK)  
- [ ] CI runs on push  

### Owner input needed
None critical.

---

## Phase 1 — Core backend

**Goal:** Secure data layer and staff login.

### Work
- [ ] Prisma schema: users/roles, products stubs, orders stubs, audit log
- [ ] Migrations + seed script (owner admin user)
- [ ] Admin auth: register/login (or seed-only), JWT access + refresh, Argon2
- [ ] RBAC guards: Owner, Order staff, Content manager
- [ ] Rate-limited login; OpenAPI skeleton

### Exit criteria
- Admin can log in and hit a protected “me” endpoint  
- Role denied correctly for a restricted route  
- Schema migrations apply from empty DB  

### Owner input needed
Preferred admin email for seed account.

---

## Phase 2 — Catalogue operations

**Goal:** Staff can manage the real product catalogue without code.

### Work
- [ ] API: categories, products, variants, images upload (local/S3), stock adjustments
- [ ] Admin UI: product list/create/edit, categories reorder, inventory adjustments + reasons
- [ ] Low-stock threshold + active/draft visibility
- [ ] Cost price admin-only; selling/sale price on variants as needed

### Exit criteria
- Create a product with image, variant, and stock in admin  
- Stock adjustment writes an inventory movement row  
- Draft products hidden from public catalogue endpoints  

### Owner input needed
Real (or sample) SKUs, prices, pack sizes, product photos.

---

## Phase 3 — Storefront catalogue

**Goal:** Shoppers can discover products and build a cart.

### Work
- [ ] Home: brand hero, categories, featured/best sellers placeholders
- [ ] Shop / category filters + sort; search
- [ ] Product detail: photos, price, variants, stock, Add to Cart
- [ ] Cart: qty, remove, subtotal (Redis/session persistence)
- [ ] Mobile-first layout; PKR formatting; WhatsApp support link

### Exit criteria
- Browse → PDP → cart works on phone-width viewport  
- Out-of-stock / draft items cannot be added  
- Cart survives refresh  

### Owner input needed
Logo, brand colours (if ready), WhatsApp number (placeholder OK).

---

## Phase 4 — Checkout & customer orders

**Goal:** Guest can place a paid-method order; stock is reserved; customer can look it up.

### Work
- [ ] Checkout form: name, phone, optional email, city, address, notes, payment method
- [ ] Server validation + delivery-area check (basic city list)
- [ ] Create order with line/price/address snapshots; unique order number
- [ ] **Reserve stock** on place; block oversell in a DB transaction
- [ ] Confirmation page; Track order (order # + phone)
- [ ] COD + bank/wallet transfer as selectable methods (mark unpaid until verified)

### Exit criteria
- Test order appears in DB with correct totals and snapshots  
- Concurrent checkout cannot oversell the last unit  
- Track lookup never returns another customer’s order  

### Owner input needed
Delivery cities and rates (even a short Lahore-first list).

---

## Phase 5 — Admin order desk

**Goal:** Staff can fulfil and close the loop for COD.

### Work
- [ ] Orders list: search/filter by status, date, phone
- [ ] Status workflow: New → Confirmed → Processing → Packed → Dispatched → Delivered
- [ ] Cancel / refund paths; **release reserved stock** on cancel
- [ ] Internal notes; packing slip print/PDF
- [ ] Delivery settings: zones, rates, free-delivery threshold
- [ ] Enter courier name + tracking; show on customer track page
- [ ] COD / transfer reconciliation (mark paid after verification)

### Exit criteria
- Staff can take an order from New to Delivered  
- Cancel restores stock  
- Tracking visible to customer  
- Order staff cannot open payment/staff settings  

### Owner input needed
Courier process (manual booking steps); who will use which staff role.

---

## Phase 6 — Content, promotions & reporting

**Goal:** Non-dev content edits, basic promos, and operational visibility.

### Work
- [ ] Content: banners, About, FAQ, Contact, shipping/returns/privacy/terms
- [ ] Coupons: fixed/% , dates, min order, usage limits, category rules
- [ ] Dashboard: today’s orders, pending, sales, low-stock, best sellers
- [ ] Reports: sales by date, orders by status, stock valuation

### Exit criteria
- Policies published and linked in storefront footer  
- Valid coupon changes checkout total; invalid rejected  
- Dashboard matches a known test day’s orders  

### Owner input needed
Approved policy wording; promo rules for launch (if any).

**Note:** For a faster first launch, ship **static policy pages only** here and defer coupons/reports to a post-launch patch.

---

## Phase 7 — Digital payments & notifications

**Goal:** Prepaid options and reliable status messages.

### Work
- [ ] Integrate one provider: PayFast **or** Safepay **or** JazzCash **or** Easypaisa
- [ ] Hosted/redirect checkout; webhook/IPN verification; idempotent payment records
- [ ] Email (or SMS) on: placed, confirmed, dispatched, cancelled
- [ ] Notification templates editable in admin (optional)
- [ ] Never store raw card data; secrets only in server env

### Exit criteria
- Sandbox payment succeeds and marks order paid once  
- Failed/cancelled payment does not leave stock wrongly deducted  
- Customer receives confirmation after place-order  

### Owner input needed
Merchant account approval, credentials, settlement details.

**Parallel-safe:** Can start after Phase 5 while Phase 6 finishes. Launch can go live on **COD-only** if merchant approval is pending.

---

## Phase 8 — Hardening & launch

**Goal:** Production-ready shop.

### Work
- [ ] HTTPS, domain DNS, env secrets on host
- [ ] Mobile + desktop QA against [MVP checklist](./PROJECT_PLAN.md#15-mvp-acceptance-checklist)
- [ ] Permission, cancel, payment-failure, and double-submit tests
- [ ] Backups (DB + media) and a tested restore
- [ ] Remove placeholders; final contacts and prices
- [ ] Monitoring/logging basics; admin `noindex`

### Exit criteria
- Full MVP checklist checked  
- Restore drill succeeded once  
- Owner sign-off on a dry-run order  

### Owner input needed
Domain, final contacts, launch window approval.

---

## After launch (not in MVP)

Do these only after real orders are stable:

1. Customer accounts / order history login  
2. Courier API automation  
3. Abandoned-cart reminders  
4. Product reviews / loyalty  
5. Urdu interface  
6. Advanced analytics  

---

## Recommended working rhythm

| Cadence | Practice |
|---|---|
| Per phase | One PR (or stacked PRs) that meets exit criteria |
| Daily | Keep admin seed + 2–3 demo products usable |
| Before Phase 4 | Freeze stock policy (already locked: reserve on place) |
| Before Phase 8 | Owner assets freeze (photos, prices, policies) |

---

## Current status

| Phase | Status |
|------:|--------|
| 0 Foundation | In progress — apps scaffolded; verify health/boot + Docker, then mark complete |
| 1–8 | Not started |

**Next action:** Verify `pnpm install`, `pnpm dev:api` → `/health`, web/admin shells, then Phase 1.
