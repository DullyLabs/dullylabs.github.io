# Dully Labs website

Static home for Dully Labs apps. Each app lives under its own directory, with Weekly Pulse at `/weeklypulse/`.

The repository is intentionally dependency-free and can be served directly by GitHub Pages.

## Local preview

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Homepage collection

The homepage lives in `index.html`, with styles in `assets/home.css` and a small
theme switcher in `assets/home.js`. Project links and illustrations work without
JavaScript. Illustrations use HTML and SVG; there is no build step.

To add a project, add an `article.project` inside `.project-grid`, following an
existing exhibit. Give its title, hook, and description unique IDs and update the
link's `aria-labelledby` and `aria-describedby` references. Keep the app name,
platform, description, and destination visible; mark decorative artwork
`aria-hidden="true"`. Add any project-specific artwork styles in `assets/home.css`.
The grid adds rows automatically and stacks on mobile. Keep hover effects optional
and provide the equivalent keyboard-focus treatment and reduced-motion rules.
