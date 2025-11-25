# TownApp CMS Plan & Progress Log

Authoritative source for the TownApp (formerly TownHub) control center roadmap and delivery notes. Keep this file updated every session so future collaborators can see what’s planned vs. completed.

---

## Vision

Create a multi-tenant CMS/control plane for TownApp that powers:

1. **Content management** for places, events, media, translations.
2. **Business onboarding & subscriptions** with quota tracking.
3. **Notification center** for towns and businesses, including analytics.
4. **Billing & invoices** (town license + business tiers, VAT compliant).
5. **Localization** (EN/IS) for all customer-facing content.

---

## Roles & Permissions

| Role            | Capabilities                                                                                                  |
|-----------------|----------------------------------------------------------------------------------------------------------------|
| `super_admin`   | Manage all towns, billing, subscriptions, settings, users, audit logs.                                         |
| `town_admin`    | Manage content, businesses, notifications within their town; view analytics & invoices for that town.          |
| `business_owner`| Manage own business profile/place, upload media, create events/notifications within their tier quota.          |
| `content_manager` | Edit places/events/media for assigned towns, no billing/notification permissions.                           |

> Seed data: at least one `super_admin` plus the Stykkishólmur `town_admin`.

---

## Pricing & Quotas (Initial Recommendation)

### Town License
- Flat ISK 95,000/month per town (Stykkishólmur first). Includes unlimited citizen notifications/events from municipal admins.

### Business Tiers
| Tier      | Price (ISK/mo) | Notifications | Events | Extras |
|-----------|----------------|---------------|--------|--------|
| Starter   | 7,500          | 2 push/month  | 2/month| Basic analytics |
| Growth    | 15,000         | 8 push/month  | 6/month| Featured placement, advanced analytics |
| Premium   | 29,000         | 20 push/month | Unlimited | Segmentation, scheduling, priority support |

> Quota tracking must decrement per send/create and reset monthly. Overages logged for billing review.

---

## Delivery Phases

### Phase A – Foundation
- [x] Expand Prisma schema for roles, translations, notifications, invoices.
- [x] Middleware helpers for role/town scoping.
- [x] New `/admin` shell with navigation + role-aware menu.
- [x] Seed scripts for default users, towns, tiers.

### Phase B – Business Management & Media
- [x] Admin UI to create/edit businesses manually (contact info, tier, quota).
- [x] Image management (logo, hero, gallery, event images) using Supabase Storage.
- [x] Link businesses to Places; enforce “one place per business” where needed.
- [x] Owner invitation flow so business accounts can be claimed later.

### Phase C – Notification Center
- [ ] Notification composer (title, body, deeplink, language toggles, targeting).
- [ ] Quota enforcement per business/town; audit trail.
- [ ] Delivery log with status, counts, costs.
- [ ] Analytics cards (notifications sent, engagement, top senders).

### Phase D – Billing & Invoices
- [ ] Invoice model (amount, VAT, due date, PDF link, status).
- [ ] Admin tools to issue/mark-paid/resend invoices.
- [ ] Business/town portals for invoice history + receipt downloads.

### Phase E – Localization & Enhancements
- [ ] EN/IS tabs for places/events/notifications.
- [ ] Content validation + fallback logic.
- [ ] Accessibility & UX polish, audit logs, impersonation tools.

---

## Progress Log

| Date (YYYY-MM-DD) | Summary | Details |
|-------------------|---------|---------|
| 2025-11-17        | Plan created | Defined roles, pricing tiers, delivery phases, and storage/notification decisions. |
| 2025-11-17        | Phase A schema & seed updates | Added Town + Invoice models, role enum, translation/media fields, notification metadata, and seeded Stykkishólmur + business tiers. |
| 2025-11-17        | Role guards + admin shell | Added shared auth helpers, environment docs, and the new `/admin` layout + navigation with lint fixes. |
| 2025-11-17        | Phase B – Business management | Added `/admin/businesses`, Supabase Storage uploads, owner invite/claim flow, and server actions for create/update/delete with place + tier linking. |
| 2025-11-17        | Notification shell | Shipped `/admin/notifications` with stats, draft creation server action, and town-scoped history list (Phase C groundwork). |
| 2025-11-18        | Phase C – Composer polish | Added segmentation + deep-link controls, stored target filters, and surfaced audience context in history to prep analytics & quota tracking. |
| 2025-11-18        | Phase C – Analytics telemetry | Wired dashboard cards to live notifications/quota aggregates, surfaced delivery rate + deep-link counts, and documented town-level quota usage. |
| 2025-11-19        | Phase C – Analytics expansion | Added weekly/30-day trend sparkline, NotificationDelivery status chips, and average-per-day summary for faster insight into campaign pacing. |
| 2025-11-19        | Phase D – Billing overview | Added billing cards, upcoming due summaries, and a recent invoice list so admins can see town billing health from the notifications shell. |
| 2025-11-19        | Phase E – Localization polish | Added locale switcher, translation reminders, and composer language guidance to keep EN/IS drafts aligned. |
| 2025-11-19        | Phase C – Town data snapshot | Added Stykkishólmur snapshot cards plus upcoming events so the CMS shows real town data for the prototype. |
| 2025-11-19        | Phase C – Event engagement | Hooked up views/favorites/RSVPs (API + mobile UI) and surfaced the counts in the CMS so businesses can see traction. |
| 2025-11-19        | Phase C – Alert segments | Added CMS controls to manage town/weather/business alert segments so the composer stays aligned with mobile preferences. |
| 2025-11-18        | Phase C – Trend & delivery visibility | Added weekly trend sparkline, surfaced NotificationDelivery status counts, and tied delivery-rate metrics to actual delivery records for better analytics readiness. |

> Add a new row for every meaningful update (feature completed, schema change, etc.) to keep historical context.

---

## Open Questions / Future Enhancements
- Should we expose a self-serve business onboarding form later (drops into approval queue)?
- Do we need automated PDF invoice generation (e.g., via Next.js serverless) or is manual upload sufficient for MVP?
- Should towns have configurable notification categories (e.g., “Emergency”, “Events”, “Promotions”) with separate quotas?

Keep this list updated as new considerations arise.
