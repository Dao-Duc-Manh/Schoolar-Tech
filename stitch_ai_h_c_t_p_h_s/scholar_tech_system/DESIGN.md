# Design System Document: The Intellectual Architect

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Atheneum"**
This design system moves away from the "industrial" feel of traditional Learning Management Systems. Instead of a rigid, spreadsheet-like interface, we are building a "Digital Atheneum"—a space that feels like a modern, glass-walled university library. It balances the authoritative weight of academia with the fluid, ethereal nature of cutting-edge AI.

To break the "template" look, this system utilizes **intentional asymmetry** and **high-contrast typography scales**. We use expansive white space (breathing room) to reduce cognitive load for students, while employing sophisticated, layered surfaces to organize complex data for faculty. The layout is not a flat grid; it is a landscape of information where importance is dictated by elevation and light.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, authoritative `primary` (#0040a1) to establish trust, while AI-driven features are illuminated by `secondary` (#5b00df) tones.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
- Use `surface-container-low` (#f3f4f5) to define a sidebar.
- Place it against the `background` (#f8f9fa). 
- The "edge" is the color change, not a line. This creates a more seamless, premium editorial feel.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper and frosted glass.
*   **Base:** `surface` (#f8f9fa)
*   **Content Areas:** `surface-container` (#edeeef)
*   **Floating Elements/Cards:** `surface-container-lowest` (#ffffff) to provide "pop" and clarity.
*   **Active/Hero Sections:** `primary-fixed` (#dae2ff)

### The "Glass & Gradient" Rule
To signify "Tech-Forward" AI elements, use Glassmorphism. Apply `secondary_container` (#7531ff) at 10-15% opacity with a `backdrop-blur` of 20px. 
*   **Signature Textures:** For high-impact CTAs or Faculty Dashboards, use a subtle linear gradient from `primary` (#0040a1) to `primary_container` (#0056d2). Avoid flat buttons for primary actions; they should feel like they have "depth and soul."

---

## 3. Typography
We use a dual-typeface system to bridge the gap between "Academic" and "Tech-Forward."

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels modern and architectural. Use `display-lg` (3.5rem) for student landing pages to create an editorial, bold impact.
*   **Title & Body (Inter):** A highly legible workhorse. Inter provides the "Academic" precision required for reading long-form course material and administrative data.

**Hierarchy as Identity:**
- **Headlines:** Use `on_surface` (#191c1d) with `headline-md` (1.75rem) to command attention.
- **Body:** Use `on_surface_variant` (#424654) for `body-md` (0.875rem) to ensure a softer, more readable contrast for long-form study sessions.

---

## 4. Elevation & Depth
In this system, depth is a functional tool for hierarchy, not just decoration.

*   **Tonal Layering:** Achieve lift by stacking. Place a `surface-container-lowest` (#ffffff) card on a `surface-container-low` (#f3f4f5) section. This creates a "soft lift" that is easier on the eyes than heavy drop shadows.
*   **Ambient Shadows:** For floating AI modals or critical notifications, use a shadow with a blur radius of 30px-50px and an opacity of 4% using the `on_surface` color. This mimics natural light.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use `outline-variant` (#c3c6d6) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use for "floating" navigation bars or AI assistant panels. Use `surface_bright` with 70% opacity and a heavy blur to let course content colors bleed through.

---

## 5. Components

### Cards & Lists
*   **Rule:** No dividers. Use 24px or 32px of vertical white space to separate items. 
*   **Interaction:** Hover states should transition the background from `surface-container-lowest` to `primary-fixed-dim` (#b2c5ff) for a sophisticated "glow" effect.

### Buttons
*   **Primary:** Gradient from `primary` to `primary_container`. Roundedness: `md` (0.375rem).
*   **Secondary (AI):** `secondary` (#5b00df) with a `secondary_fixed` (#e8ddff) text label.
*   **Tertiary:** No background, `primary` text, bold weight. Use for low-emphasis faculty actions.

### Input Fields
*   **Style:** Minimalist. Background: `surface-container-highest` (#e1e3e4). No border. On focus, add a 2px "Ghost Border" using `primary`.
*   **Helper Text:** Use `label-sm` (0.6875rem) in `on_surface_variant`.

### Special LMS Components
*   **Course Progress Orbit:** Use `tertiary` (#005145) for completion tracking—it provides a "calm success" color that contrasts with the administrative blue.
*   **AI Insights Panel:** A glassmorphic side-drawer using `secondary_container` at low opacity to suggest the "intelligence" layer of the LMS.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical padding. Give more room to the top and left of headers to create an editorial feel.
*   **Do** use `tertiary_fixed` (#68fadd) for positive data visualization (e.g., "Grade Improvements").
*   **Do** prioritize "Reading Mode"—use wide margins and `body-lg` (1rem) for actual course content.

### Don't:
*   **Don't** use 100% black text. Always use `on_surface` (#191c1d) to maintain a premium, ink-on-paper feel.
*   **Don't** use sharp corners. Stick to the `md` (0.375rem) or `lg` (0.5rem) roundedness to keep the interface approachable for students.
*   **Don't** use "Alert Red" for minor errors. Use `error_container` (#ffdad6) for a softer, more constructive feedback loop.