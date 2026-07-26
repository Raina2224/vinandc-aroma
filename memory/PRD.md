# Vin&c Aroma — PRD

## Problem Statement
Premium e-commerce for perfume brand *Vin&c Aroma* — luxury light theme with emerald green + champagne gold, editorial layout inspired by thefifthnote.in, using real Vin&c branded bottle photography.

## Brand Details
- **Name:** Vin&c Aroma  ·  **Tagline:** "Born of dreams, bottled in elegance"
- **Phone:** +91 79759 99476  ·  **Email:** vinandcaroma@gmail.com  ·  **Instagram:** @vinandc.aroma
- **Free Shipping:** ₹499+  ·  **Delivery:** 4–5 business days
- **Oils:** 40% French concentrated, 8-week maceration
- **Longevity:** 4–6 hours on skin

## Visual Identity (LIGHT LUXURY)
- **Background:** `#FAFAF8` off-white, `#F4F1EA` cream, `#F8F6F2` ivory
- **Primary:** Deep Emerald `#0F4C45`, Forest `#1E5B4F`, Dark `#0A3A34`
- **Accent:** Champagne Gold `#C9A35A`, Metallic `#B88A3C`, Highlight `#D8B46A`
- **Text:** Charcoal `#1F1F1F`, Deep Green `#123C37`
- **Fonts:** Cormorant Garamond (headings), Manrope (body)
- **Buttons:** Primary = emerald bg + gold border + white text. Secondary = cream + emerald border + emerald text

## Architecture
- **Frontend:** React 19 + React Router 7 + Tailwind + Framer Motion + Sonner
- **Backend:** FastAPI + Motor (MongoDB async)
- **Storage:** MongoDB — products, users, admins, otps, orders, reviews, contact_messages, payment_transactions
- **Payments:** Stripe (real test key) + Razorpay MOCK + COD
- **Auth:** Phone OTP (MOCK — always 123456) + JWT + Admin login (bcrypt+JWT)

## The Signature Line (20 products)
The Essential · The Gentleman · The Muse · The Royale · The Bloom · The Dreamer · The Voyage · The Ember · The Marine · The Peony · The Legacy · The Whisper · The Reverie · The Sable · The Verdant · The Sovereign · The Eclipse · The Nocturne · The Aurum · The Iron

All 20 use the 5 real uploaded Vin&c bottle photographs (rotated across SKUs).

## Homepage Section Order
1. Hero (split editorial + featured product card)
2. Featured Collection (top-rated 4)
3. Best Sellers (grid)
4. Why Vin&c Aroma (6 luxury feature cards)
5. Crafted in France (dark emerald band + stats 40% / 8wks / 4-6h)
6. Luxury Ingredients (6 sourced-globally list)
7. Find Your Scent (quiz CTA)
8. About the Brand
9. Customer Reviews (4 cards)
10. FAQ (inline 4-item + link to full FAQ)
11. Newsletter (dark emerald band)

## What's Been Implemented
- Jan 2026: MVP with 20 seeded perfumes, full storefront, admin, Stripe + mock Razorpay + COD
- Jan 2026: Real brand details + FAQ page + Shipping Policy + Why Vin&c + Crafted in France + Reviews section + rotating announcement bar
- Jan 2026: MAJOR REDESIGN — Light luxury theme (emerald + gold + cream), Fifth Note-inspired editorial layout, real Vin&c bottle photography across all products, product line renamed to "The Essential", "The Gentleman", etc.

## API Endpoints
See `/app/backend/server.py`. All under `/api/` prefix. Key: products (list/detail/suggest), auth (otp send/verify, admin login), checkout (session, status), orders, reviews, scent-finder, contact.

## Test Credentials
- **Admin:** admin@vincaroma.com / Admin@123
- **Phone OTP:** any 10-digit + `123456` (auto-prefilled after Send OTP)

## MOCKED (clearly flagged)
- **Phone OTP:** No Twilio — fixed 123456, auto-prefilled in modal
- **Razorpay:** UI + auto-marks-paid without Razorpay API call

## Prioritized Backlog
- **P1:** Real Twilio Verify SMS integration (swap MOCK OTP)
- **P1:** Real Razorpay keys + SDK (swap MOCK payment)
- **P1:** Photograph each of the 20 SKUs individually so labels match product names (currently 5 photos rotated)
- **P2:** 7ml Discovery Set (sample kit product line for first-time buyers)
- **P2:** Loyalty / referral program
- **P2:** Multi-language (EN + HI)
- **P3:** Real image upload in admin
- **P3:** Order status transitions in admin (packed → shipped → delivered)
- **P3:** Auth-protected review submission
- **P3:** Stripe webhook signature verification
