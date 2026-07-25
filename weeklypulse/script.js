/* Shared behaviour for /weeklypulse/ pages.
   The initial theme is set by a small blocking snippet in each page's
   <head>, because doing it here would repaint after parse and flash light
   mode at anyone using dark. This file only handles what can wait. */

const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");

function syncThemeChrome() {
  const isDark = root.dataset.theme === "dark";
  themeButton?.setAttribute("aria-label", isDark ? "Use light appearance" : "Use dark appearance");
  /* read the live token rather than hardcoding a hex that can drift from tokens.css */
  const paper = getComputedStyle(root).getPropertyValue("--paper").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", paper);
}

syncThemeChrome();

themeButton?.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("weekly-pulse-theme", root.dataset.theme);
  syncThemeChrome();
  document.dispatchEvent(new CustomEvent("themechange"));
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
