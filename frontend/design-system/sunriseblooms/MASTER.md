# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/lua-studio/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** LUA STUDIO
**Category:** Áo dài rental (fashion rental e-commerce, boutique)
**Tone reference:** a screenshot of a floral studio website. It is used ONLY for color tone and mood, not for content, category or layout. Do NOT replace the palette with another one.

---

## Global Rules

### Color Palette (reference tone, about 15% brighter)

Backgrounds, surfaces and accents are the reference colors mixed 15% toward white. Text colors are NOT brightened, to keep contrast.

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background (ivory) | `#EDE7DA` | `--color-background` |
| Raised card / image placeholder | `#F4F1E9` | `--color-card` |
| Surface (footer, buttons, bands) | `#D6CFB0` | `--color-surface` |
| Foreground (text) | `#4A4535` | `--color-foreground` |
| Muted Foreground | `#655F4D` | `--color-muted-foreground` |
| Border / divider lines | `#A09A8A` | `--color-border` |
| Input / control border | `#7A7461` | `--color-input-border` |
| On Foreground (text on dark fill) | `#EDE7DA` | `--color-on-foreground` |
| On Image (text over hero) | `#FFFFFF` | `--color-on-image` |
| Accent Lavender | `#D1C3DC` | `--color-accent-lavender` |
| Accent Peach | `#F2D1BC` | `--color-accent-peach` |
| Accent Gold | `#EBB658` | `--color-accent-gold` |
| Accent Sage | `#B6C09D` | `--color-accent-sage` |
| Ring (focus) | `#4A4535` | `--color-ring` |

**Color Notes:** Warm ivory and beige, soft and feminine. Accent colors are small details only (badges, selected-state hints), never large fills. Single light theme, no dark mode.

**Contrast (checked):** foreground on background 7.8:1, foreground on surface 6.1:1, muted-foreground on background 5.2:1, foreground on card 8.5:1. Borders are decorative; form controls use `--color-input-border` (3:1 or better).

### Typography

- **Heading Font:** Cormorant Garamond (uppercase for hero and section titles, letter-spacing 0.05em to 0.1em)
- **Body / UI Font:** Jost (400). Used for prices, size tables, calendar, form labels and checkout, where thin serif numerals are hard to read. If the client wants an all-serif look, use Cormorant Garamond weight 500 instead.
- **Accent:** Cormorant italic for taglines and captions
- **Nav / buttons:** small uppercase, letter-spacing 0.1em
- **Mood:** elegant, calm, editorial, feminine

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Inline spacing |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Paragraph / form spacing |
| `--space-xl` | `48px` | Block gaps |
| `--space-2xl` | `96px` | Section padding (generous whitespace) |

### Shadows and Borders

Almost flat. Use thin 1px borders (`--color-border`). Only the hero image may use `0 8px 24px rgba(74,69,53,0.08)`. Corners are square (radius 0) for buttons, inputs and cards.

---

## Navigation

Sticky top bar, ivory background, 1px bottom border.

- Layout: logo "LUA STUDIO" centered; 3 links on the left, 3 on the right
- Links, in order: **Home, Shop / Collection, How to Rent, Size Guide, FAQs, Contact**
- Utility: cart icon at the far right (needed for rental checkout)
- Mobile: hamburger menu, logo centered, cart icon right

---

## Component Specs

```css
:root {
  --color-background: #EDE7DA;
  --color-card: #F4F1E9;
  --color-surface: #D6CFB0;
  --color-foreground: #4A4535;
  --color-muted-foreground: #655F4D;
  --color-border: #A09A8A;
  --color-input-border: #7A7461;
  --color-on-foreground: #EDE7DA;
  --color-on-image: #FFFFFF;
  --color-ring: #4A4535;
}

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: 'Jost', sans-serif;
}
h1, h2, h3 { font-family: 'Cormorant Garamond', serif; letter-spacing: 0.05em; }

/* Primary Button ("Add to booking", "Get in touch") */
.btn-primary {
  background: var(--color-foreground);
  color: var(--color-on-foreground);
  padding: 14px 32px;
  border-radius: 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: opacity 200ms ease;
  cursor: pointer;
}
.btn-primary:hover { opacity: 0.88; }

/* Secondary Button */
.btn-secondary {
  background: var(--color-surface);
  color: var(--color-foreground);
  padding: 14px 32px;
  border-radius: 0;
  cursor: pointer;
  transition: opacity 200ms ease;
}

/* Input / select */
.input {
  background: transparent;
  color: var(--color-foreground);
  border: 1px solid var(--color-input-border);
  border-radius: 0;
  padding: 12px 16px;
  font-size: 16px;
}
.input:focus { outline: 2px solid var(--color-ring); outline-offset: 2px; }

/* Option chip (size, rental duration, delivery method) */
.chip {
  border: 1px solid var(--color-input-border);
  padding: 10px 18px;
  cursor: pointer;
  transition: background 200ms ease;
}
.chip[aria-pressed="true"] {
  background: var(--color-foreground);
  color: var(--color-on-foreground);
}
.chip[disabled] { color: var(--color-muted-foreground); text-decoration: line-through; cursor: not-allowed; }

/* Hero text over image */
.hero::after { content: ""; position: absolute; inset: 0; background: rgba(0,0,0,0.18); }
```

---

## Page Specs

### Homepage

1. Large editorial hero image with overlaid title and a short welcome statement introducing LUA STUDIO
2. Featured áo dài collection (3 to 4 product cards)
3. Simple "How to Rent" section (3 to 4 numbered steps with thin icons)
4. Minimal footer: studio information and social links, on `--color-surface`

### Shop / Collection (product browsing)

- Image-led grid: 4 columns desktop, 2 columns mobile, generous gaps
- Card: portrait photo, garment name, rental price (small, below the image), no shadow, no rounded corners
- Minimal filters (size, occasion, color), collapsible on mobile
- Reference given by client: an SSENSE product page (not reviewed here)

### Product Page (booking and checkout)

Each product page must show, in this order:

1. **Gallery:** several clear garment photos with thumbnails (large image left, details right on desktop)
2. **Title block:** garment name and rental price
3. **Size selector:** available sizes as chips, with a size guide link and a measurements table (bust, waist, hip, in cm)
4. **Model info:** model height and size worn, where available
5. **Rental duration:** options as chips (for example 4 days / 8 days); price changes with the choice
6. **Availability calendar:** select delivery or pickup date and return date; booked dates are disabled and shown with strikethrough or pattern, not color alone
7. **Delivery method:** local pickup or postal delivery, with the fee shown when postage is chosen
8. **Price breakdown before checkout:** rental fee, delivery fee, any other fee per the studio rental policy, total. It updates live as options change.
9. **Primary button:** "Add to booking"; disabled with a clear message until size, dates and delivery are chosen
10. **Accordions:** Delivery & Return, FAQs

Pattern observed on the Dress Hire AU reference: delivery date should be chosen 1 to 2 days before the event, price updates with the rental period, and delivery/return info sits in accordions under the booking form.

---

## Style Guidelines

**Style:** Soft editorial minimalism (boutique rental)

**Keywords:** warm ivory, generous whitespace, thin serif headings, square corners, subtle 1px borders, large soft photography

**Key Effects:** gentle fade-in on scroll (300 to 400ms), slow image hover (scale at most 1.03 inside a clipped container), no parallax, no heavy animation

---

## Anti-Patterns (Do NOT Use)

- No dark backgrounds, no pure black/white palettes
- No neon, purple/pink gradients, heavy drop shadows
- No rounded pill buttons, no bold sans-serif headings
- No large fills with accent colors
- No emojis as icons (use thin-line SVG, Lucide)
- No color-only meaning for availability (add strikethrough, pattern or label)
- No missing `cursor: pointer`, no invisible focus states, no layout-shifting hovers

---

## Pre-Delivery Checklist

- [ ] Colors come only from the variables above (no hard-coded hex in components)
- [ ] Text contrast 4.5:1 minimum; hero text readable over photo (overlay applied)
- [ ] Calendar, chips and size table usable by keyboard, with visible focus
- [ ] Price breakdown visible before checkout and updates with every option
- [ ] Nav order exactly: Home, Shop / Collection, How to Rent, Size Guide, FAQs, Contact
- [ ] Icons from one consistent SVG set
- [ ] Hover transitions 150 to 300ms; `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px; no horizontal scroll on mobile