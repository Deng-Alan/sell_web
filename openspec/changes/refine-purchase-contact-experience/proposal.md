# Change: Refine purchase contact experience

## Why
Recent review videos showed that the public product cards feel too sparse, the product CTA does not reliably lead visitors into a working purchase flow, and the contact page exposes too many mixed contact styles instead of a simple QR-code purchase path.

## What Changes
- Make the homepage product grid denser on larger screens and allow the whole card to open product detail
- Route purchase CTAs from product cards and product detail to a working contact destination instead of a dead in-page anchor
- Simplify the public contact page to primary QR-based purchase channels only
- Unify public-facing CTA copy around `联系购买` and `扫码联系客服购买`

## Impact
- Affected specs: product-showcase, contact-routing
- Affected code: public catalog data shaping, homepage product cards, contact page, product detail page
