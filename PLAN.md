# Buzztate E-Commerce Listing Localizer: Technical Implementation Plan

## Current Codebase Summary

### 1. Translation Flow
- **No file upload exists.** Users paste plain text into a `<textarea>` on `client/src/pages/home.tsx`.
- User selects target languages (30 options) and a "vibe/style" (7 styles like "Modern Slang", "Professional / Corporate", etc.).
- Frontend calls `POST /api/translate` with `{ text, target_languages, style, userId }`.
- `api/translate.ts` validates with Zod, checks auth via JWT, determines Free vs Pro tier:
  - **Free**: `gpt-3.5-turbo`, 280 char limit, 1 language, only "Modern Slang" style
  - **Pro**: `gpt-4o`, 5000 chars, 50 languages, all 7 styles
- A generic prompt is sent to OpenAI: `"Translate the following text... Style/Vibe: ..."`.
- Results are returned as `{ results: [{ language, translation, reality_check }] }`.
- Translation history saved to Supabase `translations` table.
- For "English" target, a client-side mock function is used instead of calling the API.

### 2. Database Schema (Supabase PostgreSQL, not Drizzle-managed)
- `profiles` — id, is_pro, stripe_customer_id, email, updated_at
- `translations` — id, user_id, original_text, translated_text, language, style, created_at
- `payment_events` — id (UUID), stripe_session_id (UNIQUE), user_id (UUID), processed_at
- `shared/schema.ts` only contains Zod schemas and TypeScript types (no Drizzle table definitions)

### 3. API Routes (all Vercel serverless functions in `/api/`)
| Route | Method | Purpose |
|---|---|---|
| `/api/translate` | POST | Main translation (OpenAI) |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/verify-payment` | POST | Verify payment (idempotent) |
| `/api/portal` | POST | Stripe billing portal |
| `/api/webhook` | POST | Stripe webhook handler |
| `/api/health` | GET | Express health check |

### 4. Frontend Pages/Components
| Route | File | Description |
|---|---|---|
| `/` | `client/src/pages/landing/index.tsx` | Marketing landing page with live demo |
| `/auth` | `client/src/pages/auth/index.tsx` | Login/signup/forgot (Supabase Auth) |
| `/app` | `client/src/pages/home.tsx` | Protected main translation interface |
| `/translate/:lang` | `client/src/pages/landing/LanguageLanding.tsx` | SEO pages per language |

- UI library: shadcn/ui (full component set already installed)
- Router: wouter
- State: React hooks + TanStack Query (lightly used)

### 5. File Formats Currently Supported
**None.** No file upload capability exists. The only file-related feature is CSV **download/export** of translation results (Pro only, client-side generated).

---

## Implementation Plan

### Phase 1: Core Product Changes (Priority Order)

#### 1.1 Marketplace Profile System
**Why first:** This is the foundation that all other features depend on — the prompt engineering layer, the export format, and the UI selections all reference marketplace profiles.

**New files to create:**
- `lib/marketplace-profiles.ts` — MarketplaceProfile interface + MARKETPLACE_PROFILES constant (Amazon DE/FR/ES/IT/JP, Shopify International, Etsy International)
- `lib/localization-prompt.ts` — `buildLocalizationPrompt()` function that generates marketplace-aware system prompts

**Files to modify:**
- `shared/schema.ts` — Add `ParsedListing` interface (title, description, bulletPoints, keywords, category, price), add `LocalizationRequest` Zod schema, add marketplace IDs as a const array

#### 1.2 CSV/Excel Upload & Parsing
**Why second:** This is the primary UX change — sellers need to upload their listing files.

**New dependencies to install:**
- `papaparse` — CSV parsing
- `xlsx` (SheetJS) — Excel parsing
- `@types/papaparse` — TypeScript types

**New files to create:**
- `lib/file-parser.ts` — Server-side file parsing logic:
  - `parseCSV(buffer)` using papaparse
  - `parseExcel(buffer)` using xlsx
  - `autoDetectColumns(headers)` — smart mapping (title/product_title/name → Title, etc.)
  - Support for tab-delimited (Amazon flat file), standard CSV, and .xlsx
- `client/src/components/FileUpload.tsx` — Drag-and-drop file upload component accepting .csv, .xlsx, .tsv
- `client/src/components/ColumnMapper.tsx` — Column mapping UI with:
  - Auto-detected mappings shown as dropdowns
  - "Do Not Translate" option for each column
  - Smart defaults per marketplace format (Amazon/Shopify/Etsy detection)
  - Save mappings to localStorage for returning users
- `client/src/lib/file-parser-client.ts` — Client-side parsing (papaparse and xlsx both work in browser) so we can show preview before sending to API

**Files to modify:**
- `client/src/pages/home.tsx` — Add file upload mode alongside existing text input mode (tab or toggle: "Text" | "File Upload"), integrate FileUpload and ColumnMapper components
- `package.json` — Add papaparse, xlsx, @types/papaparse

#### 1.3 Localization API Endpoint
**Why third:** The new API endpoint uses marketplace profiles and handles structured listing data instead of raw text.

**New files to create:**
- `api/localize.ts` — New Vercel serverless function:
  - Accepts `{ listings: ParsedListing[], marketplace: string, targetLanguage: string, userId?: string }`
  - Looks up MarketplaceProfile by ID
  - Calls `buildLocalizationPrompt()` for each listing
  - Sends to OpenAI (gpt-4o-mini for all users per playbook — this is a product change from the current model)
  - Enforces character limits from marketplace profile
  - Returns structured JSON with localized listings + quality flags
  - Processes listings in batches to avoid API timeouts

**Files to modify:**
- `shared/schema.ts` — Add Zod schema for the localize endpoint request/response
- `api/translate.ts` — Keep working for backwards compatibility (existing text translation)

#### 1.4 Export/Download System
**Why fourth:** After localization, sellers need marketplace-format files to re-import.

**New files to create:**
- `lib/export-formatter.ts` — Server/shared export logic:
  - `exportAmazonFlatFile(listings, language)` — Tab-delimited matching Seller Central format
  - `exportShopifyCSV(listings, language)` — CSV matching Shopify product schema (Handle, Title, Body HTML, etc.)
  - `exportEtsyCSV(listings, language)` — CSV matching Etsy bulk edit format
  - `exportGenericCSV(originalListings, localizedListings)` — Side-by-side original + translated columns
  - `generateQualityReport(listings, marketplace)` — Flags: exceeded char limits, empty/short fields, confidence
- `client/src/components/ExportPanel.tsx` — UI for selecting export format and downloading files
- `api/export.ts` — (Optional) Server-side export endpoint if client-side generation is insufficient for large files

**Files to modify:**
- `client/src/pages/home.tsx` — Replace current simple CSV download with ExportPanel
- `package.json` — xlsx is already needed for import; reuse for export

#### 1.5 Quality Report System
**New files to create:**
- `lib/quality-checker.ts` — Quality validation logic:
  - Check each field against marketplace character limits
  - Flag empty or suspiciously short translations (< 10% of original length)
  - Flag fields that exceed limits with actual char count
  - Generate overall confidence score per listing

**Files to modify:**
- `client/src/components/ExportPanel.tsx` — Show quality report inline before download
- `api/localize.ts` — Run quality checks on API response before returning

#### 1.6 Updated Pricing/Tier Logic
**Files to modify:**
- `api/localize.ts` — Implement new tier limits:
  - **Free**: 5 listings/month, 2 languages (track in Supabase)
  - **Starter (£29/mo)**: 100 listings, 5 languages
  - **Growth (£59/mo)**: 500 listings, all languages, priority
  - **Scale (£99/mo)**: Unlimited, API access, bulk
- `api/checkout.ts` — Update Stripe products/prices for new tiers (£29, £59, £99)
- `shared/schema.ts` — Add listing count tracking types
- Database: Add `listings_used_this_month` and `plan_tier` columns to `profiles` table (Supabase migration)

### Phase 2: Landing Page Repositioning

#### 2.1 Main Landing Page Redesign
**Files to modify:**
- `client/src/pages/landing/index.tsx` — Major rewrite:
  - **New Hero**: "Sell in Every Market. Localize Your Product Listings in Minutes."
  - **Pain Point section**: Google Translate vs Buzztate side-by-side (kitchen product example)
  - **How It Works** (3 steps): Export → Pick Marketplaces → Download
  - **Marketplace Support**: Amazon (.de .fr .it .es .co.jp), Shopify, Etsy logos
  - **Updated Pricing**: 4 tiers (Free, Starter £29, Growth £59, Scale £99)
  - **FAQ**: New e-commerce focused questions
  - **Demo widget**: Replace text input demo with CSV upload demo flow
  - Update footer links for e-commerce SEO

#### 2.2 SEO Landing Pages
**New files to create:**
- `client/src/pages/landing/AmazonListingTranslation.tsx` — `/amazon-listing-translation`
- `client/src/pages/landing/ShopifyProductTranslation.tsx` — `/shopify-product-translation`
- `client/src/pages/landing/EtsyListingTranslation.tsx` — `/etsy-listing-translation`
- `client/src/pages/landing/AmazonDeTranslation.tsx` — `/amazon-de-translation`
- `client/src/pages/landing/AmazonJpTranslation.tsx` — `/amazon-jp-translation`

Each page: 800-1200 words, marketplace-specific, with CTA to sign up.

**Files to modify:**
- `client/src/App.tsx` — Add routes for all new SEO pages
- `client/public/sitemap.xml` — Add new pages
- `client/public/robots.txt` — Ensure new pages are crawlable
- `client/index.html` — Update meta tags for new positioning

#### 2.3 Free Tier Logic (No Account Required)
**Files to modify:**
- `api/localize.ts` — Allow 5 listings/month without auth (track by IP or fingerprint)
- `client/src/pages/home.tsx` — Allow limited usage without login, show upgrade prompts

### Phase 3: Database Changes

**Supabase migrations to create:**
- `migrations/002_listings_tracking.sql`:
  - Add `plan_tier` column to `profiles` (enum: 'free', 'starter', 'growth', 'scale')
  - Add `listings_used_this_month` integer to `profiles`
  - Add `listings_reset_date` timestamp to `profiles`
  - Create `localization_jobs` table (id, user_id, marketplace, source_language, target_language, listing_count, status, created_at)
  - Create `localized_listings` table (id, job_id, original_data JSONB, localized_data JSONB, quality_score, flags JSONB, created_at)

---

## File-by-File Summary

### New Files (17)
| File | Priority | Description |
|---|---|---|
| `lib/marketplace-profiles.ts` | P0 | Marketplace profile definitions |
| `lib/localization-prompt.ts` | P0 | Prompt template builder |
| `lib/file-parser.ts` | P0 | CSV/Excel/TSV parsing |
| `lib/export-formatter.ts` | P1 | Marketplace-format export |
| `lib/quality-checker.ts` | P1 | Translation quality validation |
| `client/src/lib/file-parser-client.ts` | P0 | Client-side file parsing |
| `client/src/components/FileUpload.tsx` | P0 | Drag-and-drop upload component |
| `client/src/components/ColumnMapper.tsx` | P0 | Column mapping UI |
| `client/src/components/ExportPanel.tsx` | P1 | Export format selector + download |
| `client/src/components/MarketplaceSelector.tsx` | P0 | Marketplace picker UI |
| `api/localize.ts` | P0 | New localization API endpoint |
| `api/export.ts` | P2 | Server-side export (if needed) |
| `client/src/pages/landing/AmazonListingTranslation.tsx` | P1 | SEO page |
| `client/src/pages/landing/ShopifyProductTranslation.tsx` | P1 | SEO page |
| `client/src/pages/landing/EtsyListingTranslation.tsx` | P1 | SEO page |
| `client/src/pages/landing/AmazonDeTranslation.tsx` | P2 | SEO page |
| `client/src/pages/landing/AmazonJpTranslation.tsx` | P2 | SEO page |
| `migrations/002_listings_tracking.sql` | P1 | Database schema updates |

### Modified Files (10)
| File | Priority | Changes |
|---|---|---|
| `shared/schema.ts` | P0 | Add ParsedListing, LocalizationRequest, marketplace types |
| `package.json` | P0 | Add papaparse, xlsx, @types/papaparse |
| `client/src/pages/home.tsx` | P0 | Add file upload mode, marketplace selector, new export |
| `client/src/App.tsx` | P1 | Add routes for SEO pages |
| `client/src/pages/landing/index.tsx` | P1 | Full landing page rewrite for e-commerce |
| `api/checkout.ts` | P1 | New pricing tiers (£29/£59/£99) |
| `api/translate.ts` | P2 | Keep for backwards compat, minor updates |
| `client/public/sitemap.xml` | P2 | Add new pages |
| `client/index.html` | P2 | Update meta tags |
| `client/public/robots.txt` | P2 | Ensure crawlability |

---

## Implementation Order (Step by Step)

### Step 1: Foundation
1. `npm install papaparse xlsx @types/papaparse`
2. Create `lib/marketplace-profiles.ts`
3. Create `lib/localization-prompt.ts`
4. Update `shared/schema.ts` with new types

### Step 2: File Parsing
5. Create `client/src/lib/file-parser-client.ts`
6. Create `client/src/components/FileUpload.tsx`
7. Create `client/src/components/ColumnMapper.tsx`
8. Create `client/src/components/MarketplaceSelector.tsx`

### Step 3: API
9. Create `api/localize.ts`
10. Create `lib/quality-checker.ts`

### Step 4: Export
11. Create `lib/export-formatter.ts`
12. Create `client/src/components/ExportPanel.tsx`

### Step 5: Integrate into App
13. Modify `client/src/pages/home.tsx` — add file upload flow alongside text mode

### Step 6: Pricing & DB
14. Create `migrations/002_listings_tracking.sql`
15. Modify `api/checkout.ts` for new tiers

### Step 7: Landing Page
16. Rewrite `client/src/pages/landing/index.tsx`
17. Create SEO pages (5 pages)
18. Modify `client/src/App.tsx` for new routes
19. Update sitemap, meta tags
