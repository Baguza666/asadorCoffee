# Deployment Checklist

Use this list before every release. Check each box once verified.

- [ ] Update all GA4 Measurement IDs (HTML + `js/analytics.js`).
- [ ] Regenerate the minified stylesheet: `npx clean-css-cli -o css/styles.min.css css/styles.css`.
- [ ] Smoke-test the cart (add, edit, clear, staff view) with and without localStorage availability (private window).
- [ ] Verify responsive layouts at 390px, 768px, 1024px, and 1440px (hero, menu grid, about story panels, admin table).
- [ ] Run scroll-reveal sections to ensure `prefers-reduced-motion` fallback behaves as expected.
- [ ] Exercise the admin dashboard: login, add item, edit item, delete item, import/export JSON, logout.
- [ ] Confirm menu filters/search update counts and show the empty state + loading indicator.
- [ ] Screen reader pass (VoiceOver + NVDA) focusing on navigation order, search form labeling, and cart announcements.
- [ ] Cross-browser sweep: Safari (iOS), Chrome (Android/iOS), Firefox, Edge per README guidance.
- [ ] Validate structured data with Google Rich Results Test using any page URL.
- [ ] Deploy to a preview, then production in Vercel, ensuring clean URLs resolve (`/about`, `/menu`, `/admin`).
- [ ] Purge CDN caches (if any) and spot-check canonical URLs/meta descriptions in the page source.
