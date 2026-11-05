# spotlight

A large logo lit by the pointer — the wordmark across the bottom of a
footer, dim and grainy, bright in a soft circle around the cursor. Or dark
until the pointer finds it. For any SVG, from HTML attributes; light and
dark, with or without Lenis; no dependencies.

```html
<div data-pg-spotlight data-pg-spotlight-grain>
    <svg viewBox="0 0 1920 400" role="img" aria-label="Your brand">…</svg>
</div>
```

```sh
npm install github:omisilli/spotlight#v1.2.0
```

```ts
import { initSpotlight } from "@plusguard/spotlight";
import "@plusguard/spotlight/index.css";

initSpotlight();
```

Or the CSS from CSS, which lets you pick the cascade layer:

```css
@import "@plusguard/spotlight/index.css" layer(components);
```

### Without a build step

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/omisilli/spotlight@v1.2.0/index.css" />
<script type="module">
    import { initSpotlight } from "https://cdn.jsdelivr.net/gh/omisilli/spotlight@v1.2.0/dist/index.js";
    initSpotlight();
</script>
```

Pin the version (`@v1.2.0`) on a live site. A pinned URL never changes;
`@1` follows the newest 1.x release.

## Attributes

| Attribute                  | On       | What                                                      |
| -------------------------- | -------- | --------------------------------------------------------- |
| `data-pg-spotlight`        | The box  | Lights its first element — the logo                       |
| `data-pg-spotlight-grain`  | The box  | A fine, filmic texture on an SVG's shapes                 |
| `data-pg-spotlight-touch`  | The box  | Keeps the logo on touch screens, where it is hidden by default |

Everything else — how bright, how big — is CSS: see [CSS variables](#css-variables).

## How it works

You write the logo once. The script lays a copy over it — the **lit
layer** — and shows that copy only inside a circle around the pointer:

| Layer           | Shows                          | Strength                            |
| --------------- | ------------------------------ | ----------------------------------- |
| Your logo       | Everywhere, always             | `--pg-spotlight-base` — 0.4         |
| The lit copy    | Only around the pointer        | `--pg-spotlight-lit` — 0.6          |

The circle is fully lit to `--pg-spotlight-size` (160px) and fades out by
`--pg-spotlight-fade` (420px). It follows the pointer, and stays on it
while the page scrolls under a still mouse — native scrolling or Lenis.
When the mouse leaves the page, the light goes out.

The copy has no ids — a gradient, a clip or a pattern it uses is found in
your logo — and is hidden from screen readers. Give your logo
`role="img"` and an `aria-label`, or `aria-hidden="true"` if the name is
already said elsewhere.

## What can be lit

The logo is the box's first element — any of these:

| The logo                                   | Colour from the page                | Grain | Size                   |
| ------------------------------------------ | ----------------------------------- | ----- | ---------------------- |
| An SVG drawn as paths — **the best**       | Yes, where its shapes have no fill  | Yes   | The box's width        |
| An SVG with `<text>` in a web font         | Yes                                 | Yes   | The box's width        |
| An image — `<img src="logo.svg">`, a PNG   | No: the file's own colours          | Yes   | The box's width        |
| Plain text — `<span>PlusGuard</span>`      | Yes, the text colour                | Yes   | Its own font size      |

**Paths** need nothing to load and look the same everywhere: export the
logo from your design tool, or turn its letters into outlines. **A font**
is the quickest — type the name, pick the face — but until the font has
loaded a fallback stands in, and the `viewBox` has to fit the word.
**An image** is one file for light and dark: it will not turn with the
page, so a dark logo is lost on a dark footer. **Plain text** sizes like
text (`font-size`, `clamp()`), not by the box's width.

```html
<!-- Set in a font: the viewBox fits the word; the font loads as any web font. -->
<div data-pg-spotlight data-pg-spotlight-grain>
    <svg viewBox="0 -150 900 155" role="img" aria-label="PlusGuard">
        <text font-family="Roboto" font-weight="900" font-size="200" letter-spacing="-5">PlusGuard</text>
    </svg>
</div>
```

Whatever it is, the logo is a picture: no text cursor over it, nothing to
select — inside a link, the link's pointer.

## The look: how much shows, how wide the light

Two choices, both CSS: how much of the logo shows without the light
(`--pg-spotlight-base`), and how the light falls off around the pointer
(`--pg-spotlight-size`, `--pg-spotlight-fade`).

| Look                              | `base` | `size` | `fade`  | `lit` | The logo                                                                   |
| --------------------------------- | ------ | ------ | ------- | ----- | -------------------------------------------------------------------------- |
| Dim, a circle of light — the default | `0.4`  | `160px` | `420px` | `0.6` | Always there; brighter around the pointer                                |
| Dark, a small circle              | `0`    | `160px` | `420px` | `0.6` | Not there at all, but in a circle around the pointer                      |
| Dark, a wide soft light — bugatti.com's | `0`    | `0%`   | `60%`   | `0.4` | Not there without the pointer — then the letters fade out the farther they are from it; never a hard circle |

```css
/* bugatti.com's: the light as wide as the logo, fading all the way. */
.footer-logo {
    --pg-spotlight-base: 0;
    --pg-spotlight-lit: 0.4;
    --pg-spotlight-size: 0%;
    --pg-spotlight-fade: 60%;
}
```

`size` and `fade` take a length or a percentage. A percentage is a share
of the way from the pointer to the logo's farthest corner — so the light
grows with the logo. `0%` means no fully lit middle at all: it starts to
fade right at the pointer. For a softer edge, move `fade` away from
`size`; for a hard one, bring them together.

Anything between works too: a `base` of `0.15` is a faint outline that
lights up.

### Edge to edge, on the bottom

As bugatti.com's footer has it: the logo runs from one side of the page to
the other and sits on its bottom edge, a little cut by it. Take the box out
of the footer's side padding, and cut it short:

```css
.footer-logo {
    margin-inline: calc(-1 * var(--footer-padding)); /* to the page's sides */
    overflow: hidden;
}
.footer-logo > * {
    margin-bottom: -1%; /* how much the bottom cuts: a share of the width */
}
```

## Grain

`data-pg-spotlight-grain` gives the logo a fine, filmic texture — dense,
small dots, as on bugatti.com: it is cut from noise. The noise is measured
in the page's pixels, not in the drawing's own units, so the grain is the
same on every logo, whatever its `viewBox` — and on an image or plain text
too. The filter is added to the page once, by the script.

Grain is texture, not light: at full strength the dots stand out; with a
softer `--pg-spotlight-lit` (0.4 or so) they read as a grey.

## Colour

Without a colour of its own, the logo takes `--pg-spotlight-color` — the
text colour unless set — so it is dark on a light page and light on a dark
one. A logo with its own fills keeps them: a gradient, two colours.

A gradient can turn with light and dark too, if its colours come from
the page:

```html
<linearGradient id="metal">
    <stop offset="0" />
    <stop offset="1" />
</linearGradient>
```

```css
#metal stop:nth-child(1) { stop-color: var(--metal-1); }
#metal stop:nth-child(2) { stop-color: var(--metal-2); }
```

## Touch screens

A finger has no "over" — no light, and nothing to find. So on a touch
screen (`hover: none`) the logo is **hidden**, gone from the layout, as the
Gaga and Baibars sites did on phones.

To keep it there, without the light, at `--pg-spotlight-touch` (0.2):

```html
<div data-pg-spotlight data-pg-spotlight-touch>…</div>
```

A logo set to `0` stays visible on a phone this way too — at the touch
strength, not at nothing.

## Written by spotlight

| Where     | What                                                                       |
| --------- | -------------------------------------------------------------------------- |
| The copy  | `data-pg-spotlight-lit`, `aria-hidden="true"`                              |
| The box   | `data-pg-spotlight-active`: `"true"` while a mouse is on the page          |
| The box   | `--pg-spotlight-x`, `--pg-spotlight-y`: the pointer, from the box's top left |

## CSS variables

Set anywhere above the logo — media queries welcome.

| Variable                 | Default        | What                                                  |
| ------------------------ | -------------- | ----------------------------------------------------- |
| `--pg-spotlight-color`   | `currentColor` | The logo's colour, where its SVG has none             |
| `--pg-spotlight-base`    | `0.4`          | How much shows without the light; `0` for none        |
| `--pg-spotlight-lit`     | `0.6`          | How bright it is in the light                         |
| `--pg-spotlight-size`    | `160px`        | The circle's fully lit middle — a length, or a % of the way to the logo's farthest corner |
| `--pg-spotlight-fade`    | `420px`        | Where its soft edge ends — a length or a %           |
| `--pg-spotlight-touch`   | `0.2`          | How much shows on a touch screen, with `data-pg-spotlight-touch` |

With reduced motion asked for, the light comes and goes without fading.

## Lenis

Nothing to hand over. The light is placed from the pointer and the logo's
place on the screen, every frame something moves — so it follows the page
however it scrolls.

## From the old footer

| Old (Gaga, Baibars)                          | Now                                                |
| -------------------------------------------- | -------------------------------------------------- |
| Two copies of the SVG, `.logo-base` and `.logo-spot` | One; the script adds the copy                 |
| `<filter id="noiseFilter">` in each SVG — the same id twice on a page | `data-pg-spotlight-grain`; one filter for the page |
| The grain in the drawing's units: coarse on a small `viewBox`, fine on a large one | In the page's pixels: the same on every logo |
| `opacity: .4` on each copy                   | `--pg-spotlight-base`, `--pg-spotlight-lit`        |
| `--r1` / `--r2`                              | `--pg-spotlight-size` / `--pg-spotlight-fade` — px, or % for a light that grows with the logo |
| The light stayed behind when the page scrolled | It stays on the pointer                          |
| `.qua-footer` listened for the pointer       | The whole page: the light can reach the logo from above it |
| Hidden on phones by the theme (`display: none`) | Hidden on touch screens by default; `data-pg-spotlight-touch` keeps it |

## React

Call `initSpotlight` once, in an effect — it returns its own cleanup:

```tsx
useEffect(() => initSpotlight(), []);
```

The logos are markup; logos rendered later are lit too. The copy is added
after hydration, so the server's HTML and the browser's agree.

See [`examples/react/Example.tsx`](examples/react/Example.tsx). A plain HTML
version, with four footers — Gaga, Baibars, Bugatti (dark until found,
edge to edge, with a switch between its wide soft light and a small
circle), set in a font — a light/dark switch and a `?lenis` switch, is in
[`examples/static/index.html`](examples/static/index.html).
