# Hong Kong Green Minibus

Marketing site for the iPhone and Apple Watch app. `index.html` redirects to `the-route.html`.

From the repository root:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://localhost:8080/hongkonggmb/. No build step or JavaScript dependencies.

- `the-route.html`: vertical scroll drives the minibus horizontally from Kennedy Town to Causeway Bay; each district panel has its own landmark silhouettes, a route strip, arrow-key navigation, and the site theme toggle. A continuous Kowloon backdrop includes ICC, M+ and a scroll-driven Star Ferry. Evening lights up M+ and the bus headlights. Just after leaving Wan Chai toward Causeway Bay, a passenger’s “next stop please” speech bubble appears above the bus for up to four seconds and lights the stop indicator, clearing before arrival at Causeway Bay. The door reveals its steps when opened. Past Causeway Bay the bus returns to the depot (`#depot`, the strip’s last dot), whose shop signs link to `privacy.html`, `support.html`, `terms.html` and Dully Labs; the depot stays out of the inert track so its links are always reachable. Direct stop links and viewport resizing preserve the journey position. Logic in `route.js`; set `APP_STORE_URL` once the listing is live, until then download buttons open a coming-soon dialog.
- `privacy.html`, `support.html`, `terms.html`: policy pages; “Back on board” returns to the depot.
- `styles.css`: palette, mobile layouts, and reduced-motion support. Google Fonts are optional; system fallbacks work offline.

Device screens are web recreations of the app’s visual language. Artwork uses inline SVG and CSS; no external image assets are needed.

The route is a stylised journey, not a geographic route map. The harbour artwork takes its broad podium, tower and illuminated façade from [M+’s building design](https://www.mplus.org.hk/en/the-building/design/); its small evening pattern is original decorative artwork.
