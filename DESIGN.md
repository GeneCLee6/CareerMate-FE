# CareerMate AI — Design System

Design source: the Zeplin project **CareerMate AI**. This document records the
values measured from the design, so implementation does not have to go back
and look them up each time.

## 0. One thing to know first: there are two visual languages here

| | Landing page | Auth / app screens |
| --- | --- | --- |
| Source | The original static site, which predates Zeplin | The Zeplin design |
| Type | System font stack | **Inter** |
| Heading colour | `#000` | `#161616` |
| Border colour | `#e5e5e5` | `#dfdfdf` |
| Token export | `landingColors` | `colors` |

**This is not an oversight, it is a deliberate status quo.** Merging the two
would change how the landing page looks, which is a design decision rather
than a refactor.

## 1. Type

**Inter**, loaded from Google Fonts in `public/index.html`, weights 400 / 500
/ 600 / 700 / 900.

Applied through the `fontFamily` token, and **only on the auth and app
screens**. The landing page does not use it.

| Use | Size | Weight | Colour |
| --- | --- | --- | --- |
| Register heading | 40px | 900 | `#161616` |
| Login heading | 40px | 400 | `#161616` |
| Landing hero heading | 60px | 900 | `#161616` |
| Landing section heading | 32px | 700 | `#060606` |
| Body | 15–20px | 400 | `#161616` / `#898989` |
| Button label | 16px | 500–700 | |

> Register at 900 and Login at 400 is what the design specifies. It is not a
> mistake.

## 2. Colour

### Auth / app (`colors`)

| Token | Value | Use |
| --- | --- | --- |
| `text` | `#161616` | Primary text |
| `textMuted` | `#898989` | Subheadings |
| `label` | `#595959` | Field labels |
| `placeholder` | `#b5b5b5` | Placeholder text |
| `border` | `#dfdfdf` | Field border |
| `borderFocus` | `#504ffd` | Focus |
| `link` | `#2f6bff` | Links |
| `danger` | `#ff3232` | Errors |
| `dangerSurface` | `#ffeaea` | Error banner background |
| `warning` | `#ffa726` | Warning icon |
| `toast` | `#3e3e3e` | Toast background |

### Landing (`landingColors`)

`heading` `#000`, `body` `#333`, `muted` `#666`, `surfaceSubtle` `#f5f5f5`,
`surfaceCard` `#f5f5f7`, `surfaceContact` `#f9fafc`, `surfaceFooter`
`#fafafa`, `border` `#e5e5e5`.

### Gradients

```
primary  linear-gradient(110deg, #504ffd 11%, #40c3fb 92%)   primary buttons, closing CTA
card     linear-gradient(137deg, #504ffd 6%, #40c3fb 96%)    solution cards
hero     linear-gradient(180deg, #fafafa 0%, #ffffff 100%)   hero background
```

The primary gradient is also used in the transactional emails the backend
sends, so the first thing a new user sees matches the product.

## 3. Control sizing (measured in Zeplin)

| Component | Size | Radius |
| --- | --- | --- |
| Form field | 440 × 48 | 24px (pill) |
| Primary button | 440 × 48 | 24px |
| Hero button | 183 × 52 | 26px |
| Settings field | fluid width × 48 | **10px**, softer than auth |
| Code input box | 48 × 56 | 12px |
| Landing problem card | 540 × 120 | 32px |

The auth form column is 440px wide, centred in the left half of the 1440-wide
design (x = 144).

## 4. Layout

| Screen | Structure |
| --- | --- |
| Auth | Form left (440px, centred) / illustration right (712px column) |
| Onboarding | Progress rail left (320px) / content centred right |
| App | Resume sidebar left (268px) / conversation right |
| Settings | Top header + centred content (1000px) + tab rail left (235px) |
| Landing | Full-bleed sections, content centred at 1400px or 1200px |

### Breakpoints

| Breakpoint | Behaviour |
| --- | --- |
| 1100px | The auth illustration is hidden |
| 900px | Onboarding becomes one column |
| 860px | **The resume sidebar becomes a drawer** — not hidden |
| 800px | Settings tabs become one column |
| 768px | Two-column landing sections become one |

## 5. The auth illustration

`src/assets/auth-panel.png` (720 × 836 at 1x) — a single exported panel
containing the wave background, the SUBSCRIBE tag, the testimonial card and
two glass cards.

**It must be scaled proportionally:**

```css
width: auto;  height: auto;
max-width: 100%;  max-height: calc(100vh - 48px);
```

> **Do not** write `height: 100%` with `width: auto` and `max-width: 100%`.
> `max-width` clamps the width without revisiting the height, which stretches
> the image vertically — at 1920×1080 this squashed it horizontally by 22.6%.

## 6. Component states

Every form screen implements all the states in the design, not only the happy
path:

| State | Appearance |
| --- | --- |
| Default | |
| Focus | Border becomes `borderFocus`, with a soft glow |
| Error | Border becomes `danger`, driven by `aria-invalid="true"` |
| Error banner | `dangerSurface` background, `danger` text, 8px radius |
| Network error | The banner is prefixed with 🔌 |
| Loading | The button label becomes a present participle and is disabled |
| Success | A blue check circle with a message |
| Toast | A dark pill, centred at the top of the page |

## 7. Known differences from the design

| Item | Design | Implemented | Reason |
| --- | --- | --- | --- |
| Closing CTA copy | `Start Practicing for Free` | `Start Practingcing for Free` | Keeps the original static site's typo; confirmed, not changing for now |
| Footer year | 2025 | 2026 | Same |
| Landing page overall | Inter, `#f9fafc` cards, 32px radius | System font, `#f5f5f5`, 12px radius | The landing page predates the design; confirmed to stay as it is |
