# Marketing concepts

A responsive static prototype. `index.html` redirects to `the-route.html`.

From the repository root:

```sh
python3 -m http.server 8080 --directory hongkonggmb --bind 127.0.0.1
```

Open http://localhost:8080. No build step or JavaScript dependencies.

- `the-route.html`: vertical scroll drives the minibus horizontally from Kennedy Town to Causeway Bay; each district panel has its own landmark silhouettes, a route strip, arrow-key navigation, and the evening switch. A continuous Kowloon backdrop includes ICC, M+ and a scroll-driven Star Ferry; tap the harbour to discover its caption. Evening lights up M+ and the bus headlights. Just after leaving Wan Chai toward Causeway Bay, a passenger’s “next stop please” speech bubble appears above the bus for up to four seconds and lights the stop indicator, clearing before arrival at Causeway Bay. It can replay after returning to Wan Chai. The door reveals its steps when opened. Direct stop links and viewport resizing preserve the journey position. Logic in `route.js`, with the `APP_STORE_URL` setting; until a real listing is configured, download buttons open a preview notice.
- `styles.css`: palette, mobile layouts, and reduced-motion support. Google Fonts are optional; system fallbacks work offline.

All arrival values are illustrative, not connected to live transport data. Device screens are web recreations of the app’s visual language, not screenshots. Artwork uses inline SVG and CSS; no external image assets are needed.

The route is a stylised journey, not a geographic route map. The harbour artwork takes its broad podium, tower and illuminated façade from [M+’s building design](https://www.mplus.org.hk/en/the-building/design/); its small evening pattern is original decorative artwork.
