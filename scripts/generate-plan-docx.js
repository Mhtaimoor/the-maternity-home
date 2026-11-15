const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, BorderStyle, ShadingType, LevelFormat } = require("docx");
const fs = require("fs");

const border = { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerShade = { type: ShadingType.CLEAR, fill: "1F4E46" };
const altShade = { type: ShadingType.CLEAR, fill: "F3F7F6" };

function p(t) { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, font: "Calibri", size: 22 })] }); }
function bullet(t) { return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: t, font: "Calibri", size: 22 })] }); }

function cell(text, opts = {}) {
  const { bold = false, header = false, width = 2340, shade } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: shade || (header ? headerShade : undefined),
    children: [new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text, font: "Calibri", size: 18, bold: bold || header, color: header ? "FFFFFF" : "222222" })]
    })]
  });
}

function twoCol(rows, w1 = 2800, w2 = 6560) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [w1, w2],
    rows: rows.map((r, i) => new TableRow({
      children: [
        cell(r[0], { bold: true, width: w1, header: i === 0, shade: i === 0 ? headerShade : (i % 2 === 0 ? altShade : undefined) }),
        cell(r[1], { width: w2, header: i === 0, shade: i === 0 ? headerShade : (i % 2 === 0 ? altShade : undefined) })
      ]
    }))
  });
}

function threeCol(rows, widths = [2800, 3280, 3280]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) => new TableRow({
      children: r.map((t, j) => cell(t, {
        bold: i === 0 || j === 0,
        width: widths[j],
        header: i === 0,
        shade: i === 0 ? headerShade : (i % 2 === 0 ? altShade : undefined)
      }))
    }))
  });
}

const doc = new Document({
  styles: {
    default: {
      document: { styles: [{ id: "Normal", run: { font: "Calibri", size: 22 } }] },
      heading1: { run: { font: "Calibri", size: 32, bold: true, color: "1F4E46" }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true } },
      heading2: { run: { font: "Calibri", size: 26, bold: true, color: "2D6A5A" }, paragraph: { spacing: { before: 280, after: 120 }, keepNext: true } },
      title: { run: { font: "Calibri", size: 48, bold: true, color: "1F4E46" }, paragraph: { spacing: { after: 120 } } }
    }
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: "left", style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  sections: [{
    properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
    children: [
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: "THE MATERNITY HOME", bold: true, font: "Calibri", size: 48, color: "1F4E46" })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Revised Project Plan — Custom Storefront, Admin Portal & Backend", font: "Calibri", size: 26, color: "2D6A5A" })] }),
      p("Prepared 15 November 2026 · Pakistan (Lahore) · PKR · English first"),
      p("This plan supersedes the hosted Shopify/WooCommerce recommendation in The_Maternity_Home_Website_Project_Plan.docx. The client website, admin panel, API, and database are all built inside the the-maternity-home repository."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Why the plan changed")] }),
      threeCol([
        ["Topic", "Original plan", "Revised plan"],
        ["Platform", "Shopify / WooCommerce", "Custom monorepo in this repo"],
        ["Admin", "Theme / plugins", "Dedicated admin app we build"],
        ["Checkout rules", "Platform defaults", "Full COD, wallet, stock control"],
        ["Prototype", "Static HTML only", "Live storefront + API + admin"]
      ]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Vision")] }),
      p("Mobile-first shop for maternity, postpartum, newborn and baby essentials. Customers browse, order, and track. Staff manage catalogue, stock, orders, discounts and content without editing code."),
      bullet("Accurate catalogue, prices, variants, stock"),
      bullet("Smooth mobile cart to checkout to confirmation"),
      bullet("Admin order desk: confirm, pack, dispatch, deliver"),
      bullet("Pakistan payments: COD first, then local gateway/wallets"),
      bullet("Role-based access and privacy for customer data"),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Technology stack")] }),
      twoCol([
        ["Layer", "Choice"],
        ["Monorepo", "pnpm workspaces: apps/web, apps/admin, apps/api"],
        ["Storefront", "Next.js App Router + TypeScript + Tailwind"],
        ["Admin", "Next.js + TypeScript + Tailwind (separate app)"],
        ["API", "NestJS modular monolith + OpenAPI"],
        ["Database", "PostgreSQL + Prisma"],
        ["Cache / jobs", "Redis + BullMQ"],
        ["Media", "S3-compatible (R2 / S3)"],
        ["Admin auth", "JWT access + refresh, Argon2, optional 2FA"],
        ["Customer auth", "Guest checkout MVP; accounts later"],
        ["Payments", "COD + transfer; then PayFast / Safepay / JazzCash / Easypaisa"],
        ["Not used", "Stripe for PK domestic; microservices for MVP"]
      ]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Roles")] }),
      threeCol([
        ["Role", "Allowed", "Restricted"],
        ["Visitor", "Browse, search, policies, contact", "Admin / private data"],
        ["Customer", "Orders + secure lookup", "Other customers orders"],
        ["Owner / Admin", "Full operations", "-"],
        ["Order staff", "Order status workflow", "Payments, staff settings"],
        ["Content manager", "Banners, FAQ, policies", "PII, payments, staff"]
      ], [2200, 3580, 3580]),
      p("Permissions are enforced on the API, not only in the UI."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Client website pages")] }),
      p("Home, Shop/Category, Product, Search, Cart, Checkout (guest), Confirmation, Track order, About/Contact, Policies/FAQ."),
      bullet("Live prices/stock from API (no hardcoded HTML)"),
      bullet("Persisted cart; server-side checkout validation"),
      bullet("PKR formatting and Pakistan delivery cities/rates"),
      bullet("WhatsApp click-to-chat for support"),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Admin portal modules")] }),
      p("Dashboard, Products, Categories, Inventory, Orders, Customers, Discounts, Delivery, Payments, Content, Reports, Staff and settings."),
      bullet("Separate admin app; noindex for search engines"),
      bullet("Audit log for price, stock, refund, and status changes"),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Catalogue")] }),
      p("Categories: Maternity and postpartum, Newborn essentials, Diapers and hygiene, Feeding, Gifts and bundles."),
      p("Products: name, SKU, slug, category, brand, description, cost (admin only), selling/sale price, images, variants, stock, low-stock threshold, active/draft, timestamps."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Orders and inventory")] }),
      p("Status: New to Confirmed to Processing to Packed to Dispatched to Delivered (also Cancelled / Returned / Refunded)."),
      p("Locked stock policy: reserve stock at order placement; release on cancel. Snapshot prices and address on place-order. Prevent overselling with DB transactions."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Payments and delivery (Pakistan)")] }),
      twoCol([
        ["Phase", "Approach"],
        ["MVP payments", "COD + bank/wallet transfer (admin verifies)"],
        ["Phase 2 payments", "PayFast, Safepay, JazzCash, or Easypaisa"],
        ["Not recommended", "Stripe for Pakistan-registered domestic merchants"],
        ["Delivery MVP", "Manual courier booking; enter tracking in admin"],
        ["Delivery later", "Courier API automation if available"],
        ["Security", "No card data stored; secrets only on server"]
      ]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("10. Core data records")] }),
      p("Users/roles, Products, Variants, Images, Categories, Inventory movements, Customers, Addresses, Orders, Order items, Payments, Coupons, Delivery zones, Content, Audit logs, Notification outbox."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("11. Notifications")] }),
      p("Triggers: placed, confirmed, dispatched, delivered, cancelled/refunded. Email first; SMS / WhatsApp Business API later. Click-to-chat is not automated messaging."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("12. Security")] }),
      bullet("HTTPS on storefront and admin"),
      bullet("Unique staff accounts, RBAC, rate-limited login"),
      bullet("Server-side validation; minimal PII collection"),
      bullet("Automated backups and tested restore"),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("13. Key modifications vs original")] }),
      bullet("Custom monorepo instead of Shopify/WooCommerce"),
      bullet("Separate storefront + admin apps, one NestJS API"),
      bullet("PostgreSQL source of truth; stock reserved at checkout"),
      bullet("Pakistan payment path (not Stripe)"),
      bullet("Manual courier first; guest checkout; English-only launch"),
      bullet("HTML prototype is design reference only"),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("14. Build phases")] }),
      threeCol([
        ["Phase", "Work", "Estimate"],
        ["0", "Scaffold, Docker Postgres/Redis, CI", "1 day"],
        ["1", "Schema, Prisma, admin auth, RBAC", "2-3 days"],
        ["2", "Catalogue API + admin inventory", "3-4 days"],
        ["3", "Storefront browse/search/PDP/cart", "3-4 days"],
        ["4", "Checkout, reservation, track order", "3-4 days"],
        ["5", "Admin orders + delivery + COD", "2-3 days"],
        ["6", "Content, discounts, reports", "2-3 days"],
        ["7", "Gateway + notifications", "3-5 days"],
        ["8", "Hardening, QA, launch", "2-3 days"]
      ], [1400, 4960, 3000]),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("15. MVP acceptance (summary)")] }),
      p("Mobile storefront; live catalogue; working cart/checkout; admin order workflow; stock restore on cancel; secure lookup; role locks; published policies; HTTPS; no placeholders."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("16. Owner inputs still needed")] }),
      p("Logo, domain, WhatsApp/phone, support email, real SKUs/prices/stock/photos, delivery cities/rates, payment merchant choice, policy wording, business/tax advice."),

      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("17. Recommendation")] }),
      p("Ship a focused custom MVP: accurate catalogue and stock, mobile COD checkout, secure admin order desk, clear policies, and WhatsApp support. Add wallets/gateways and courier APIs after real orders prove the workflow."),

      new Paragraph({ spacing: { before: 400 }, children: [new TextRun({ text: "Repository: https://github.com/Mhtaimoor/the-maternity-home", font: "Calibri", size: 20, color: "555555" })] }),
      new Paragraph({ children: [new TextRun({ text: "Markdown twin: docs/PROJECT_PLAN.md", font: "Calibri", size: 20, color: "555555" })] })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync("docs/The_Maternity_Home_Revised_Project_Plan.docx", buf);
  console.log("Wrote docs/The_Maternity_Home_Revised_Project_Plan.docx");
});
