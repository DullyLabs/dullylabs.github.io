---
name: navigation-test
description: Click-only walkthrough of the whole site from the home page, run by a subagent in the browser preview, to catch broken links and dead ends.
---

Launch one general-purpose agent with this brief. Relay its findings; fix broken links before reporting done.

Start the preview (`preview_start {name: "site"}`), open your own tab with `tabs_create`, and navigate ONCE to http://localhost:4180/. From then on move only by clicking links and buttons with the `computer` tool. No typed URLs, no `navigate` at all (not even "back"), no scripts that change location. Reading `location.href` with `javascript_tool` is fine.

Reach every page a visitor can reach by clicking: Weekly Pulse and its support and privacy pages, PluckIt, and the minibus route page. From each project page, get back to the home page by clicking. On the route page click the stop names in the bottom strip and every header button. Click a header theme toggle once and confirm the page flips.

For each click record the page, the link text, the resulting URL, and whether it worked. Run `read_console_messages` with `onlyErrors` on every page. Report every path taken, then the problems: broken links, unexpected off-site links, pages with no click path back to home, and pages that could not be reached at all. Close the tab when done.
