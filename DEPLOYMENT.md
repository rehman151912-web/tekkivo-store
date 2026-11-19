# TEKKIVO — Manual HHC Dropshipping & Free Netlify Deployment Guide

## 1. Central Store Configuration
Open `src/config/store.ts` to customize:
- `ownerWhatsAppNumber`: Currently configured as `"923462796879"`.
- `freeDeliveryThresholdPkr`: Default is `5000` (Rs. 5,000).
- `standardDeliveryFeePkr`: Default is `250` (Rs. 250).
- `supportEmail` & `operatingHours`: Update with your store contact details.

## 2. Separating Customer Catalog & Owner Supplier Costs
- `src/data/products.ts`: Customer-facing catalog (`DEFAULT_PRODUCTS`) for the 7 store categories (`Kitchen Tools`, `Kitchen Appliances`, `Cookware & Bakeware`, `Home Essentials`, `Electronics & Gadgets`, `Mobile Accessories`, `Audio & Headphones`). Does NOT expose supplier costs or supplier product IDs to customers.
- `src/data/ownerCatalogMeta.ts`: Store-owner-only supplier product IDs (`supplierProductId`) and supplier prices (`supplierCostPkr`) used strictly inside the Store Owner Console (`#owner`).

## 3. Admin Product Management, Exact HHC Photos & Manual Fulfillment
1. Open **Admin & Order Management** (`#owner` in the footer) -> **Product Management** to edit product names, descriptions, categories, selling prices, colours, condition notes, availability (`confirmed`, `pending_confirmation`, `out_of_stock`), or upload exact HHC supplier photos (saved locally in `localStorage` until persisted into code/assets).
2. Customer adds available products to cart and fills the Cash on Delivery (COD) checkout form (`#checkout`). Out-of-stock items (such as `Gionee Type-C Handsfree` while marked unavailable) cannot be ordered.
3. Clicking **PLACE ORDER** validates all fields, generates a unique browser order reference (`TKV-YYMMDD-XXXXXX`), saves a demo copy in `localStorage` with initial status `pending`, and opens `https://wa.me/923462796879?text=...`.
4. The customer sees clear instructions that they **must press Send inside WhatsApp** to submit their order, and that `localStorage` is only for local browser demonstration (not a secure central order database).
5. Once you receive the customer's WhatsApp message, open `#owner` to update the order status (`pending`, `submitted`, `processing`, `shipped`, `delivered`, `cancelled`), assign an **HHC Fulfillment Reference**, review supplier cost & gross profit, and export orders as CSV.

## 4. Free Netlify Static Hosting Deployment
This project builds into a pure static `dist/` folder with zero server or database requirements (`netlify.toml` included):
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Log in to Netlify (Free Starter plan) -> **Add new site -> Import an existing project**.
3. Netlify reads `netlify.toml` (`npm run build`, publish directory `dist`, SPA redirect `/* -> /index.html`).
4. Or run `npm run build` locally and upload `dist/` via Netlify Drop.
