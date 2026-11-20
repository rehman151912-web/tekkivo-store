# TEKKIVO Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. Supplier cost metadata (`/owner_catalog_meta/{productId}`) must NEVER be readable or writable by non-admin users or public visitors.
2. Customer orders (`/orders/{orderId}`) contain customer PII (full name, phone, city, address) and may only be read, listed, updated, or deleted by verified admins (`isAdmin()`). Customers may submit (`create`) a new order ONLY with initial status `'pending'`, empty `hhcFulfillmentRef`, no `ownerNotes`, valid `TKV-YYMMDD-XXXXXX` reference, and server `request.time` timestamps.
3. Published products (`/products/{productId}`) are readable when `isPublished == true` (or by admins for unpublished drafts), and writable exclusively by verified admins (`isAdmin()`).
4. Configurable store delivery settings & categories (`/store_settings/main`) are readable cleanly by storefront shoppers and writable exclusively by verified admins.
5. Newsletter & restock alert subscribers (`/subscribers/{subscriberId}`) allow validated email creation and restrict read/list/update/delete strictly to verified admins.
6. Every single-document ID path variable must satisfy `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).

## 2. The "Dirty Dozen" Payloads (Expected: REJECTED)
1. Shadow field injection on `/orders`: adding `isPaid: true` or `ownerNotes: "free"` on create.
2. Status shortcutting on `/orders` create: creating an order with `status: "delivered"` instead of `"pending"`.
3. Timestamp spoofing on `/orders` create: setting `createdAt` to a client string instead of `request.time`.
4. Path ID poisoning on `/orders/{orderId}`: injecting invalid characters or >128 chars into document ID.
5. Non-admin reading `/orders` list or single doc (PII leak attempt).
6. Non-admin reading `/owner_catalog_meta/{productId}` (supplier cost / commission leak attempt).
7. Non-admin creating or updating `/products/{productId}` (price tampering attempt).
8. Unverified email spoofing: signed-in user with admin email where `email_verified == false`.
9. Order update tampering: admin update block attempting to mutate `totalPkr` or `items` instead of allowed `status`, `hhcFulfillmentRef`, `ownerNotes`, `updatedAt`.
10. Oversized string DoS on `/products` or `/orders`: >4000 chars in description or >8000 chars in `whatsappMessage`.
11. Unbounded array injection on `/orders`: sending 100 items (`> 50`).
12. Invalid email pattern on `/subscribers`: submitting `"not-an-email"`.
