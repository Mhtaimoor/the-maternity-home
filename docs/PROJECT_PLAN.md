# The Maternity Home — Custom Website & Admin Portal Plan (Revised)

**Business:** The Maternity Home — maternity, postpartum, newborn and baby essentials  
**Market:** Pakistan (launch from Lahore) · **Currency:** PKR · **Language:** English first, Urdu later  
**Prepared:** 15 November 2026  
**Status:** Supersedes the hosted-platform recommendation in the original plan. This project is a **full custom build** (storefront + admin + API + database) owned in this repository.

---

## 1. Why this plan changes the original

The original document recommended Shopify or managed WooCommerce. The client requirement is different:

| Original plan | This revised plan |
|---|---|
| Hosted commerce platform | **Custom application** in this repo |
| Theme/plugins for admin | **Dedicated admin portal** we design and build |
| Limited control over checkout/order rules | Full control over COD, wallets, stock, and Pakistan delivery |
| Static HTML prototype only | Production storefront + backend + admin |

Everything — client website, admin panel, API, and database schema — lives in **`the-maternity-home`**.

---

## 2. Project vision (unchanged goals, new delivery method)

Build a trustworthy, mobile-first online shop where customers browse products, place orders, and track them. Owners and staff manage products, stock, orders, customers, discounts, and content through a secure admin portal — without editing code.

**Priorities**

1. Accurate catalogue, prices, variants, and stock  
2. Smooth mobile cart → checkout → confirmation  
3. Admin order desk (confirm → pack → dispatch → deliver)  
4. Pakistan-ready payments (COD first; digital wallet/gateway next)  
5. Role-based security and privacy for customer data  

---

## 3. Recommended technology stack (custom)

### 3.1 Monorepo layout

```
the-maternity-home/
├── apps/
│   ├── web/          # Customer storefront (Next.js)
│   ├── admin/        # Admin portal (Next.js)
│   └── api/          # Backend API (NestJS)
├── packages/
│   ├── shared/       # Shared types, Zod schemas, constants
│   └── ui/           # Optional shared UI primitives
├── docs/             # Plans, ADRs, runbooks
└── docker-compose.yml
```

### 3.2 Stack choices

| Layer | Choice | Why |
|---|---|---|
| Storefront | **Next.js (App Router) + TypeScript + Tailwind** | SEO, mobile performance, image optimization |
| Admin | **Next.js + TypeScript + Tailwind** | Same skills as storefront; separate app for security boundaries |
| API | **NestJS + TypeScript** | Modular monolith, RBAC guards, OpenAPI, queues |
| Database | **PostgreSQL + Prisma** | Strong consistency for orders/stock; migrations |
| Cache / jobs | **Redis + BullMQ** | Carts, rate limits, stock reservation expiry, notifications |
| Media | **S3-compatible storage** (Cloudflare R2 / AWS S3) | Product images; never commit binaries to git |
| Auth (admin) | **JWT access + refresh**, Argon2 hashes, optional 2FA | Server-side only; no passwords in frontend code |
| Auth (customer) | Guest checkout first; optional accounts later | Faster MVP |
| Payments | COD + bank transfer; then **PayFast / Safepay / JazzCash / Easypaisa** | Stripe not practical for PK domestic merchants |
| Hosting | API + DB on VPS/Render; storefront/admin on Vercel or same VPS | Keep secrets server-side |
| Tooling | pnpm workspaces, ESLint, Prettier, GitHub Actions | One repo, one CI |

**Decision locked for MVP:** modular monolith (one API), not microservices.

---

## 4. User roles and permissions

| Role | Allowed | Restricted from |
|---|---|---|
| Visitor | Browse, search, filter, policies, contact | Admin, other customers’ data |
| Customer | Place orders; secure order lookup | Other customers’ orders |
| Owner / Admin | Products, stock, orders, customers, promos, reports, settings, staff | — |
| Order staff | Confirm, pack, dispatch, status updates | Payment settings, staff permissions |
| Content manager | Banners, FAQs, policies, About | Customer PII, payments, staff |

All admin routes require authenticated sessions. Permissions enforced on the **API**, not only in the UI.

---

## 5. Client-facing website (storefront)

| Page | Must do |
|---|---|
| Home | Brand hero, shop-by-category, featured / best sellers, trust, WhatsApp CTA |
| Shop / category | Filter (category, price, size, brand, in-stock), sort |
| Product detail | Photos, SKU, price/sale, variants, stock, delivery note, Add to Cart |
| Search | Names, categories, brands; empty-state suggestions |
| Cart | Qty, remove, subtotal, delivery estimate, total |
| Checkout | Guest: name, phone, optional email, city, address, notes, payment method |
| Order confirmation | Order number, items, total, payment choice, next steps |
| Track order | Order number + verified phone (or signed private link) |
| About / Contact | Story, phone, WhatsApp, email, hours, form |
| Policies / FAQ | Shipping, returns, exchanges, cancellations, privacy, terms |

**UX modifications vs static prototype**

- Live stock and prices from API (no hardcoded HTML)  
- Cart persisted (cookie/session + Redis)  
- Checkout validation server-side  
- Mobile-first layouts; WhatsApp deep link for support  
- PKR formatting (`Rs` / `PKR`) and Pakistan city/area delivery rules  

---

## 6. Admin portal modules

| Module | Functions |
|---|---|
| Dashboard | Today’s orders, pending, sales, low-stock, best sellers, shortcuts |
| Products | CRUD, images, SKU, category, brand, prices, variants, visibility |
| Categories | Add, rename, reorder, hide, assign products |
| Inventory | Adjustments + reasons; restore stock on cancel per policy |
| Orders | Filter/search; confirm → pack → dispatch → deliver / cancel / refund; notes; packing slip |
| Customers | Restricted contact + order history; export only when needed |
| Discounts | Coupons (fixed/%), dates, min order, usage limits, categories |
| Delivery | Zones/rates, free-delivery threshold, ETAs, courier + tracking |
| Payments | Enabled methods, status, references; COD reconciliation |
| Content | Banners, featured products, About, FAQ, contact, policies |
| Reports | Sales by date, status breakdown, best sellers, stock valuation |
| Staff & settings | Accounts, roles, store details, notification templates |

**Admin UX rules**

- Separate subdomain/path (`admin.thematernityhome…` or `/admin` app)  
- Never indexable by search engines (`noindex`)  
- Audit log for price, stock, refund, and status changes  

---

## 7. Catalogue model

**Categories (MVP):** Maternity & postpartum · Newborn essentials · Diapers & hygiene · Feeding · Gifts & bundles  

Each product stores: name, SKU, slug, category, brand, description, cost (admin only), selling price, optional sale price, images, variants, stock, low-stock threshold, weight (optional), active/draft, timestamps.

Variants: size / pack / colour, own SKU, price adjustment, stock.

---

## 8. Order workflow & inventory policy

### 8.1 Status machine

`New → Confirmed → Processing → Packed → Dispatched → Delivered`  
Side paths: `Cancelled`, `Returned`, `Refunded`

### 8.2 Stock policy (decision for this project)

**Reserve stock at order placement; release on cancel.**  
Same rule everywhere; block checkout if reserved+sold would oversell. Use DB transactions (+ Redis reservation TTL for abandoned checkouts if needed).

### 8.3 Snapshots

On place-order, snapshot product name, SKU, unit price, and delivery address so later catalogue edits never rewrite history.

---

## 9. Payments & delivery (Pakistan-specific updates)

### 9.1 Payments

| Phase | Methods |
|---|---|
| MVP | **COD** + **bank/wallet transfer** (admin marks paid after verification) |
| Phase 2 | One aggregator or wallet: **PayFast**, **Safepay**, **JazzCash**, or **Easypaisa** |

Notes from current market research:

- COD remains important for trust; reconcile carefully (courier withholding rules may apply under recent digital-goods tax guidance — verify with an adviser).  
- JazzCash / Easypaisa cover wallet users without cards.  
- PayFast / Safepay / XPay can unify cards + wallets.  
- **Stripe is not a practical direct option** for Pakistan-registered domestic merchants.  
- Never store raw card data; use hosted checkout / provider tokens.  
- Keep merchant keys in server env / secrets manager only.

### 9.2 Delivery

- MVP: manual courier booking; admin enters courier name + tracking  
- Publish cities, rates, ETAs, failed-delivery and return-shipping rules  
- Later: courier API automation if provider supports it  

---

## 10. Data model (core tables)

Users/roles · Products · Variants · Product images · Categories · Inventory movements · Customers · Addresses · Orders · Order items · Payments · Coupons · Coupon redemptions · Delivery zones · Content pages/banners · Audit logs · Notification outbox  

---

## 11. Notifications

| Trigger | Content |
|---|---|
| Placed | Order #, items, total, payment method, support contact |
| Confirmed | Prep / delivery estimate |
| Dispatched | Courier + tracking |
| Delivered | Confirmation + feedback invite |
| Cancelled / refunded | Reason + next steps |

Channels: email first; SMS/WhatsApp Business API later (click-to-chat ≠ automation).

---

## 12. Security, privacy, reliability

- HTTPS everywhere  
- Unique staff accounts, strong passwords, RBAC, optional 2FA  
- Rate-limit login and checkout  
- Server-side validation on all mutations  
- Collect only fulfilment-needed PII; publish privacy policy  
- Automated DB + media backups; test restore  
- Audit trail for money and stock actions  

---

## 13. What changes from the original plan (summary)

1. **Custom monorepo** instead of Shopify / WooCommerce.  
2. **Separate storefront + admin apps** sharing one NestJS API.  
3. **PostgreSQL as source of truth** for catalogue, stock, orders.  
4. **Stock reservation at checkout** as the locked inventory rule.  
5. **Pakistan payment path:** COD + transfer → local gateway/wallets (not Stripe).  
6. **Manual courier tracking first**; API later.  
7. **Guest checkout MVP**; customer accounts deferred.  
8. **Urdu UI deferred**; English only at launch.  
9. **Prototype HTML** is a design reference only — not production code.  
10. **CI/CD, Docker Compose, and env templates** included from day one.

---

## 14. Build phases (revised estimates)

| Phase | Work | Estimate |
|---|---|---|
| 0 | Repo, monorepo scaffold, Docker Postgres/Redis, CI skeleton | 1 day |
| 1 | Domain schema, Prisma models, auth (admin), RBAC | 2–3 days |
| 2 | Catalogue API + admin products/categories/inventory | 3–4 days |
| 3 | Storefront browse/search/PDP/cart | 3–4 days |
| 4 | Checkout, order creation, stock reservation, confirmation/track | 3–4 days |
| 5 | Admin orders desk + delivery settings + COD reconciliation | 2–3 days |
| 6 | Content pages, discounts, dashboard/reports | 2–3 days |
| 7 | Payment Phase 2 (gateway) + notifications | 3–5 days (provider-dependent) |
| 8 | Hardening, mobile QA, backups, launch | 2–3 days |

Domain, merchant approval, and courier onboarding can add calendar time outside engineering.

---

## 15. MVP acceptance checklist

- [ ] Storefront works on mobile and desktop  
- [ ] Browse, search, filter; live prices/variants/stock  
- [ ] Cart totals recalculate; checkout validates fields  
- [ ] Test order appears in admin with unique order number  
- [ ] Admin can confirm → pack → dispatch → deliver / cancel  
- [ ] Cancel restores reserved stock  
- [ ] Admin can manage products/inventory without code  
- [ ] Order lookup cannot leak other customers’ data  
- [ ] Payment marked paid only after trusted confirmation  
- [ ] Courier tracking savable and visible to customer  
- [ ] Staff roles block restricted actions  
- [ ] Policies published; HTTPS live; no placeholder contacts  

---

## 16. Inputs still needed from the owner

Brand logo/assets · Domain · Business WhatsApp/phone · Support email · Real SKUs/prices/stock/photos · Delivery cities & rates · Payment merchant choice · Approved policy wording · Business/tax registration advice  

---

## 17. Final recommendation

Ship a focused custom MVP: accurate catalogue and stock, mobile checkout with COD, secure admin order desk, clear delivery/return policies, and WhatsApp support. Add wallet/gateway automation and courier APIs only after real orders prove the workflow.
