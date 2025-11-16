# ASADOR COFFEE Web Experience

Boutique, multi-page marketing and operations site for ASADOR COFFEE with a responsive design system, filterable menu, persistent cart, gallery storytelling, and a password-gated admin dashboard. All interactions are built in vanilla HTML/CSS/JavaScript with no build step required.

## Project structure
```
.
├── index.html               # Home / landing page
├── menu.html                # Menu explorer with filters/search
├── about.html               # Story, values, gallery, contact
├── admin.html               # Client-side admin dashboard
├── css
│   ├── styles.css           # Documented source stylesheet (edit this)
│   └── styles.min.css       # Minified production stylesheet
├── data
│   └── menu-data.js         # Seed menu data used by menu/admin pages
├── js
│   ├── about.js             # Gallery modal + about-page utilities
│   ├── admin.js             # Admin authentication + CRUD logic
│   ├── analytics.js         # GA4 helper + custom event dispatcher
│   ├── cart.js              # Shared cart drawer/order summary logic
│   ├── main.js              # Global nav, scroll reveals, image fallback
│   └── menu.js              # Menu filters, rendering, search, cart hooks
├── DEPLOYMENT_CHECKLIST.md  # Final go-live checklist
├── README.md                # You are here
└── vercel.json              # Static hosting configuration for Vercel
```

## Design system highlights
- **Typography:** Playfair Display (serif) for headings, Inter for body copy.
- **Palette:** `#192447` ink, `#c4a888` brass accents, white/paper neutrals.
- **Spacing:** 8px rhythm expressed as 0.5rem increments for consistent gutters.
- **Interaction:** 300ms transitions, `prefers-reduced-motion` fallbacks, sticky nav, smooth scroll, scroll-triggered reveals via `[data-animate]`.
- **Texture:** Radial background wash to suggest steamed milk without relying on stock imagery.
- **Buttons & touch targets:** All interactive elements meet or exceed 44px minimum height.

## Data & admin workflow
- Menu inventory is seeded from `data/menu-data.js` and synced into `localStorage` under the `asadorMenuItems` key.
- `admin.html` requires the passphrase `asadorcoffee2024` (client-side demo only) and writes changes to `localStorage`, which the public menu reads on the next load.
- Private browsing gracefully degrades by keeping data in memory and showing inline toasts when persistence is unavailable.
- Import/export uses JSON files so staff can keep offline backups.

## Cart & ordering
- Floating cart button appears on every page, sharing `cart.js` state via `localStorage` (`asadorCart`).
- Drawer includes quantity controls, clear, and a staff-facing summary modal stamped with the current timestamp.
- Toast notifications, aria-live regions, and bounce animation (disabled for reduced-motion users) keep the experience responsive.

## Analytics (GA4)
- GA4 placeholder script is embedded in every page head. Replace **all** instances of `G-XXXXXXXXXX` (HTML heads and `js/analytics.js`) with your real Measurement ID.
- Custom events emitted via `analytics.js`:
  - `page_view` (manual fire for GA4 requirements)
  - `menu_category_click` with `category` and `item_count`
  - `add_to_cart` with item metadata
  - `view_order_summary` with total order value and line count
- Extend `trackEvent` in `js/analytics.js` if additional telemetry is required.

## Accessibility & QA notes
- Semantic landmarks, labeled controls, aria-live loaders, and focus-visible styles are in place site-wide.
- Screen reader QA: VoiceOver (macOS), NVDA (Windows), and JAWS spot checks verified nav order, form labeling, and cart announcements. Inline HTML comments highlight the tested regions for future auditors.
- Color contrast meets WCAG AA, and all imagery includes meaningful `alt` text or is marked decorative when appropriate.

### Cross-browser checklist
| Browser | Notes |
| --- | --- |
| Safari iOS | Confirm sticky header behavior on 390px viewports and verify cart drawer scroll locking. |
| Chrome Android/iOS | Validate menu pill scrolling and cart bounce animation (should respect reduced-motion). |
| Firefox (desktop/mobile) | Ensure IntersectionObserver reveals fire once per section and that custom scrollbars degrade gracefully. |
| Edge | Re-test admin modal focus management and JSON import/export (FileReader). |

## Performance
- Images lazily load via `loading="lazy"` (including gallery, menu cards, and admin thumbs).
- Fonts load with `display=swap` and preconnect hints; non-critical JS defers via ES modules.
- Menu/admin grids expose loading states and set `aria-busy` while filtering or hydrating.
- `styles.css` is the human-friendly source; `styles.min.css` is referenced in HTML for fast paint.

### Regenerating the minified CSS
Run this after any change to `css/styles.css`:
```
npx clean-css-cli -o css/styles.min.css css/styles.css
```
(Or use an equivalent CSS minifier—just ensure both files stay in sync.)

## Customization tips
- **Menu items:** Update via the admin dashboard or directly edit `data/menu-data.js` (remember to bump `styles.min.css` afterward only if styling changed).
- **Admin password:** Change the `ADMIN_PASSWORD` constant in `js/admin.js` and redeploy. Also update team documentation—this is client-side only and not secure for production.
- **Branding:** Adjust CSS variables in `styles.css` (colors, fonts, spacing) to propagate across every page.
- **Hours/contact:** Update the structured data block and any visible copy across the HTML files.
- **Analytics:** Replace GA IDs as noted above; optional custom events can be added via `trackEvent`.

## Environment setup
This is a static site—no build step is required. Use any static server for local previews:
```
npx serve .
# or
python3 -m http.server 4173
```
Navigate to the served URL (default `http://localhost:4173`) to exercise all pages.

## Deployment (Vercel)
1. Install the Vercel CLI (`npm i -g vercel`) or connect the repo through the Vercel dashboard.
2. Ensure `vercel.json` stays committed so clean URLs (`/about`) resolve to the corresponding HTML.
3. Run `vercel` (or `vercel --prod`) from the project root and follow the prompts.
4. Update DNS or custom domains as needed.
5. Walk through `DEPLOYMENT_CHECKLIST.md` before marking the release complete.

## Deployment checklist reference
`DEPLOYMENT_CHECKLIST.md` captures final QA steps: GA ID swap, breakpoint tests (390/768/1024/1440), screen reader sweeps, browser matrix, cache busting, and confirmation that admin changes sync to the menu. Treat it as the final sign-off document before pushing live.
