---
name: scroll-driven-css
description: >-
  Implements scroll-linked CSS using view timelines (animation-timeline, named
  timelines, timeline-scope) with correct fallbacks. Prevents route-class snaps
  when SPA navigation toggles body classes. Use when adding or editing
  scroll-driven animations, header/nav/blur tied to scroll, view() timelines,
  or @supports fallbacks for browsers without animation-timeline.
---

# Scroll-driven CSS (view timelines + fallbacks)

## When this applies

- Linking **any UI** (header, nav, opacity, blur, etc.) to **how much a section is in view**.
- This codebase drives effects off the **`<about>`** block via a named view timeline (`--about`).

---

## Architecture (required pieces)

1. **Named view timeline on the scroll-driven subject** (the element whose visibility in the viewport defines progress):

   ```css
   about {
     view-timeline-name: --about;
     view-timeline-axis: block;
     /* Optional: trim when the section “peeks” under another region */
     view-timeline-inset: 0 var(--about-view-inset-block-end);
   }
   ```

2. **Expose that name to siblings / ancestors** so `header`, `nav`, etc. can use it:

   ```css
   @supports (animation-timeline: view()) {
     body {
       timeline-scope: --about;
     }
   }
   ```

3. **Consumers** (fixed header, bottom nav links, pseudo-elements on `about`, …) attach the **same** timeline and usually the **same** `animation-range` so everything stays in sync:

   ```css
   @supports (animation-timeline: view()) {
     @keyframes example {
       from { /* … */ }
       to { /* … */ }
     }
     header {
       animation: example linear both;
       animation-timeline: --about;
       animation-range: entry 0% contain 55%;
     }
   }
   ```

Adjust `animation-range` only when you intentionally want a different phase; otherwise keep one shared range across related effects.

---

## Anti-pattern: route class + scroll for the same look ❌

**Do not** give the **same** visual end state in two ways:

- scroll-driven animation on `body:not(.about) …`, **and**
- static styles on `body.about …` (or `[data-route="about"]`, etc.)

On SPA navigation to the about route, the class flips **instantly** while scroll position may not, so the bar/blur/color **snaps** even though scroll-based motion was smooth on `/`.

**Do:** In browsers that support view timelines, drive that look **only** from `animation-timeline: --about` on the consumer (e.g. `header { … }` without `:not(.about)`), so `/` and `/about` use the **same** timeline and there is no class-based override.

---

## Fallback pattern ✅

Use **`@supports not (animation-timeline: view())`** for behavior that cannot be scroll-driven:

```css
/* Baseline: transparent / off state on the element */

@supports not (animation-timeline: view()) {
  /* e.g. full header bar only when user is on /about and timelines aren’t available */
  body.about header {
    /* final “on” styles */
  }
}
```

Keep scroll-driven rules inside `@supports (animation-timeline: view()) { … }`.

Optional: respect **`prefers-reduced-motion`** by reducing or disabling scroll-linked animations; pair with static fallbacks if needed.

---

## Implementation checklist

- [ ] Subject has `view-timeline-name` + axis (and insets if peeking matters).
- [ ] `body` has `timeline-scope` so fixed UI can reference the name.
- [ ] Consumers use `animation-timeline` + `animation-range`; related UI shares the same range unless designed otherwise.
- [ ] **No** duplicate “full effect” tied to route class **inside** the same `@supports` branch as scroll animations.
- [ ] Fallbacks only under `@supports not (animation-timeline: view())` (or reduced-motion).
- [ ] Animated properties are **interpolable** (e.g. frosted glass needs translucent `background` or blur won’t read through a fully opaque fill).

---

## References in this repo

| Area | Role |
|------|------|
| `client/index.css` | `timeline-scope`, `header` scroll animation |
| `client/about/about.css` | `--about` definition, blur/link scroll ranges |
| `client/components/menu.css` | Nav link colors driven by `--about` |

---

## Quick mental model

**Scroll progress** = single source of truth from **view timeline** → **multiple elements** can subscribe with the same `animation-timeline` and `animation-range`.

**Route / body class** = navigation state; use it for **fallbacks** or non-scroll concerns, **not** to re-apply the same animated look in a way that fights the timeline.
