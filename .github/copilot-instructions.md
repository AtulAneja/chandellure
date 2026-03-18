# Copilot Instructions for Chandellure

## Project Overview

Chandellure is a static e-commerce website for a handcrafted resin art shop. The site showcases and sells unique resin art pieces including coasters, trays, wall art, and jewellery. It is built with plain HTML, CSS, and vanilla JavaScript — no frameworks or build tools are used.

## Repository Structure

```
chandellure/
├── index.html        # Home page (hero, featured products, about, testimonials, contact)
├── shop.html         # Full product listing with filter and sort controls
├── cart.html         # Shopping cart page
├── css/
│   └── style.css     # All styles (single CSS file, CSS custom properties for theming)
├── js/
│   └── main.js       # All client-side logic (cart, forms, navigation, carousels)
├── images/           # Product images and media (organised by product name)
└── logo/             # Brand logo assets
```

## Key Conventions

### HTML
- Semantic HTML5 elements (`<section>`, `<article>`, `<nav>`, `<footer>`, etc.).
- Section headings follow the pattern `<!-- ═══ SECTION NAME ═══ -->`.
- Product cards use `<article class="product-card">` with `data-category`, `data-price`, and `data-order` attributes for filtering and sorting.
- Add-to-cart buttons carry `data-id`, `data-name`, and `data-price` attributes; the JS wires them up automatically on `DOMContentLoaded`.
- All forms include `novalidate` — validation is handled in JavaScript.

### CSS
- All styles live in `css/style.css`. Do **not** add `<style>` blocks in HTML.
- Use the CSS custom properties defined in `:root` for colours, spacing, and typography (e.g. `var(--color-primary)`, `var(--font-heading)`).
- Section delimiters in the CSS follow the pattern `/* ---------- Section Name ---------- */`.
- Responsive breakpoints: 900 px (tablets) and 600 px (mobile). Use `@media (max-width: 900px)` and `@media (max-width: 600px)`.

### JavaScript
- All logic lives in `js/main.js`. Do **not** add `<script>` blocks in HTML pages (except the single-line year snippet at the bottom of each page).
- Vanilla JS only — no external libraries or frameworks.
- Cart state is persisted in `localStorage` under the key `chandellure_cart` as a JSON array of `{ id, name, price, qty }` objects.
- New page-specific features should be implemented as `initFeatureName()` functions and called from the `DOMContentLoaded` listener at the bottom of `main.js`.
- Use early-return guards (`if (!element) return;`) so functions are safe to call on pages where the relevant DOM elements don't exist.

## Development Workflow

This is a zero-build static site. To preview it locally, open any HTML file in a browser or serve the directory with any static file server, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

There are no npm scripts, no test runner, and no linter configured. Manual browser testing is the primary verification method.

## Adding New Products

1. Add product images to `images/<Product Name>/`.
2. Add a new `<article class="product-card">` block in both `index.html` (Featured Pieces section, if applicable) and `shop.html`, following the existing card markup pattern.
3. Set `data-category` to one of: `coasters`, `trays`, `wall-art`, `jewellery`, `devotional`, or a new category slug.
4. Set `data-price` and `data-order` on the card, and matching `data-id`, `data-name`, `data-price` on the add-to-cart button.
5. If adding a new category, also add a filter pill in `shop.html` with the matching `data-filter` attribute.

## Style & Tone

- The brand voice is warm, artisanal, and elegant. Keep copy in this tone.
- British English spelling (e.g. "colour", "jewellery", "centre", "organised").
- Prices are displayed in USD (`$XX.XX` format).
