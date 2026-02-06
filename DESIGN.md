# Design System: Oremus - Prayer App

**Project ID:** 8654507752206754076

## 1. Visual Theme & Atmosphere

The Oremus app has a **Serene, Minimalist, and Modern** atmosphere. It uses a dark-first aesthetic (though support for light mode is present) that feels premium and tactile. The UI is airy with generous whitespace, focusing on calm and focus. Subtle background blurs (backdrop-blur) and soft shadows create a sense of depth and layering.

## 2. Color Palette & Roles

- **Spirit Blue (#1152d4):** The Primary brand color. Used for main actions (Start Session), active navigation states, and highlighting key user information. It conveys trust and tranquility.
- **Deep Sanctuary (#101622):** The Background Dark color. A very dark, slightly desaturated blue-black that serves as the foundation for the dark mode.
- **Mist White (#f6f6f8):** The Background Light color. A soft, off-white used for the light mode background to reduce eye strain.
- **Abyss Surface (#1A2230):** The Surface Dark color. Used for cards, containers, and elevated elements in dark mode to provide contrast against the background.
- **Slate Grey (#64748b):** Used for secondary text and icons, providing a clear hierarchy without being jarring.

## 3. Typography Rules

- **Font Family:** **Inter** (sans-serif) is used throughout the app for its clarity and modern feel.
- **Headings:** Bold, leading-tight, with tracking-tight. The main greeting uses a large size (32px/4xl) to feel welcoming and personal.
- **Body:** Uses a range of weights (light to medium) to establish hierarchy. It prioritizes legibility with ample line height.
- **Captions/Small Text:** Used for metadata (session times, labels) in a smaller, often muted slate color.

## 4. Component Stylings

- **Buttons:**
  - **Primary Action:** Large, pill-shaped (rounded-full), high-contrast (Spirit Blue), with a soft glow/shadow effect.
  - **Secondary/Icon Buttons:** Circular or pill-shaped, using subtle background fills or just icons.
- **Cards/Containers:**
  - **General Cards:** Uses generously rounded corners (1.5rem/lg to 2rem/xl). In dark mode, they use the Surface Dark color with subtle borders.
  - **Prompts/Hero Cards:** Can have unique background colors (like a soft Indigo #E0E7FF) and decorative gradient orbs to draw attention.
- **Navigation:** A fixed bottom bar with a backdrop blur effect, using clear icons and small text labels for easy accessibility.

## 5. Layout Principles

- **Whitespace:** Generous padding (6 units / 24px) is a standard for page margins.
- **Alignment:** Center-aligned main actions with left-aligned content sections.
- **Scrolling:** Horizontal scrolling containers for templates to keep the UI compact and browsable.
- **Layering:** Uses `z-index` and sticky headers/nav bars with transparency to maintain context while scrolling.
