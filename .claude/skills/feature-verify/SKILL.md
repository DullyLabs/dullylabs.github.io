---
name: feature-verify
description: Regression checklist to run in the browser preview before merging any change to the site.
---

Before merging, load every page the change touches in the built-in browser and confirm each item. Fix regressions before reporting done.

1. **Mobile and desktop**: resize_window mobile preset and 1400x900. No clipped or overlapping content, no horizontal page scroll.
2. **Dark and light mode**: toggle both (home: `data-theme`; minibus pages: the evening button). Text stays readable, illustrations stay cohesive.
3. **Scroll directions**: on the route page, vertical wheel, horizontal trackpad swipe and a horizontal touch drag all drive the bus.
4. **Bus door**: on the minibus pages, tap the door. It slides open, the inside is dark, and it closes again.
