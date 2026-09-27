# Biltmore Appliances

A luxury home appliance homepage concept. Bespoke kitchen, laundry, and refrigeration suites presented with an upscale, editorial style.

## Features

- Hero slider with thumbnail navigation
- Atelier process steps (consult, design, forge, install)
- Materials swatch selector (brass, marble, matte, walnut)
- Brand collection showcase
- Services overview
- Client reviews carousel with autoplay and dot navigation
- FAQ accordion
- Contact form with client-side validation
- Sticky header with scroll progress bar and mobile nav
- Scroll reveal and parallax effects

## Tech

- Semantic HTML5
- CSS with BEM naming
- Vanilla JavaScript (ES modules)
- Google Fonts: Cinzel Decorative, Cormorant Infant

## Project structure

```
.
├── index.html
├── styles.css
├── script.js
├── components-lib/     Reusable ES module components
├── images/             WebP images and logo
└── testimonials-snippet.html
```

## Accessibility

- Targets WCAG 2.2 AA
- Skip link, ARIA labels, and keyboard support on interactive components
- Visible focus states
- Respects `prefers-reduced-motion`

## Running locally

`script.js` is an ES module, so serve the folder over HTTP instead of opening the file directly.

```bash
npx serve .
```

or

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
