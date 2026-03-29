---
name: scroll-driven-css
description: >-
  Scroll-linked CSS via view timelines (animation-timeline, timeline-scope) with SPA fallbacks.
  Use when adding scroll-driven animations, header/nav/blur tied to scroll, or @supports fallbacks.
---

# Scroll-driven CSS 🎯

## Setup (3 pieces)

```css
/* 1️⃣ Subject: define named timeline */
about {
  view-timeline-name: --about;
  view-timeline-axis: block;
  view-timeline-inset: 0 var(--about-view-inset-block-end); /* trim early-peek 📐 */
}

/* 2️⃣ Ancestor: expose to siblings (header, nav…) */
@supports (animation-timeline: view()) {
  body { timeline-scope: --about; }
}

/* 3️⃣ Consumer: subscribe */
@supports (animation-timeline: view()) {
  @keyframes my-effect { from { … } to { … } }
  header { animation: my-effect linear both; }
  /* ⚠️ ALWAYS set animation-timeline/range AFTER the animation shorthand —
     the shorthand resets animation-timeline to `auto` if declared later */
  header, header .logo, header .header-cta {
    animation-timeline: --about;
    animation-range: entry 0% contain 55%;
  }
}
```

---

## Key patterns

**Factor shared layout outside `@supports`** — only branch-specific deltas belong inside:
```css
/* ✅ shared, always applied */
header .logo { position: absolute; top: 50%; }

@supports not (animation-timeline: view()) {
  header .logo { left: var(--header-inline); transform: translate(0, -50%); }
}
@supports (animation-timeline: view()) {
  header .logo { left: 50%; transform: translate(-50%, -50%); animation: logo-center-to-left linear both; }
}
```

**Mirror keyframes → one + `animation-direction: reverse`** ✅:
```css
@keyframes nav-color-to-active {
  from { color: var(--fake-white); }
  to   { color: var(--primary-color); }
}
/* reverse = primary → white, no second @keyframes needed */
body[class=""] nav a[href="/"] { animation-direction: reverse; }
```

---

## Anti-pattern: route class + scroll for same state ❌

On SPA navigation the body class flips **instantly** while scroll position lags → **snap**.

```css
/* ❌ fights the timeline */
@supports (animation-timeline: view()) {
  body.about header { background: var(--fake-white); } /* class-based duplicate */
}
```

✅ Let the timeline be the only source of truth inside `@supports (animation-timeline: view())`.  
✅ Route class is only for `@supports not` fallbacks.

---

## Fallback

```css
/* Baseline "off" state on the element itself (outside any @supports) */

@supports not (animation-timeline: view()) {
  body.about header { /* "on" state */ }
}
```

---

## Variables (enforced) 🔒

**Rule:** Any value that defines the **same visual end state** in **both** (a) scroll `@keyframes` … `to` / plateau steps **and** (b) `@supports not` route fallback **must** come from a **single CSS custom property** — never duplicate literals across those two paths.

**Where to define**

| Scope | Use for |
|-------|---------|
| `:root` | Site-wide scroll UI timing, header bar end-state, anything shared by header + consumers |
| Subject (`about`, etc.) | Effect-specific end state tied to that section (e.g. fractal blur/size/veil) |

**Global tokens (this repo)** — extend in `:root`, **reuse** in keyframes + fallbacks:

- `--scroll-ui-transition-duration`, `--scroll-ui-transition-easing` — route-only transitions when view timelines are unavailable (`header`, `about::before` / `::after`, `nav a`, etc.).
- `--header-bar-bg`, `--header-bar-shadow`, `--header-bar-backdrop-blur` — header bar “on” state: same in `header-bar-from-scroll` plateau and `body.about header` fallback.

**Section tokens** — define on the subject element; keyframes and `body.<route> …` fallbacks reference the same names:

```css
about {
  --about-fractal-blur-end: 18px;
  --fractal-veil-opacity-end: 0.48;
  /* … */
}
/* @keyframes about-fractal-blur { to { filter: blur(var(--about-fractal-blur-end)); } } */
/* @supports not { body.about about::before { filter: blur(var(--about-fractal-blur-end)); } } */
```

**Route transitions** — Under `@supports not`, prefer explicit `transition` lists (not `transition: all`) using `--scroll-ui-*` so path changes ease without fighting scroll-driven animations (which are **not** active in that branch).

**Do not:** copy-paste `10px`, `rgba(…)`, or `180%` in both the keyframe and the fallback without a shared var.

---

## Checklist

- [ ] Subject: `view-timeline-name` + `axis` + `inset` if peeking.
- [ ] `body`: `timeline-scope` for fixed UI consumers.
- [ ] Related consumers share one `animation-timeline` / `animation-range` rule.
- [ ] Mirror keyframes replaced with one keyframe + `animation-direction: reverse`.
- [ ] No route-class override that duplicates the "on" state inside the scroll branch.
- [ ] Fallbacks under `@supports not` only.
- [ ] `animation-timeline` / `animation-range` declared **after** any `animation` shorthand (shorthand resets them to `auto`).
- [ ] Animated properties are interpolable (use translucent start, not `transparent`).
- [ ] **`@keyframes` end-state values that match route fallback use the same custom properties** (no duplicated literals).
- [ ] **`@supports not`**: **`--scroll-ui-transition-duration` / `--scroll-ui-transition-easing`** for route-based transitions where appropriate.
- [ ] `prefers-reduced-motion`: disable or reduce scroll-linked animations if motion-sensitive.

---

## Repo references

| File | Role |
|------|------|
| `client/index.css` | `timeline-scope`, header scroll animation, `:root` scroll/header tokens |
| `client/about/about.css` | `--about` definition, fractal tokens, blur/link ranges |
| `client/components/menu.css` | Nav colors driven by `--about` |

> **Mental model:** view timeline = single progress source → multiple consumers subscribe with same `animation-timeline` + `animation-range`. Body class = fallback / non-scroll state only. **Custom properties = single source of truth** between scroll end state and route fallback.
