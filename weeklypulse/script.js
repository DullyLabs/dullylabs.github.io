const root = document.documentElement;
const themeButton = document.querySelector(".theme-toggle");
const savedTheme = localStorage.getItem("weekly-pulse-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function applyTheme(theme) {
  root.dataset.theme = theme;
  if (themeButton) {
    themeButton.setAttribute("aria-label", theme === "dark" ? "Use light appearance" : "Use dark appearance");
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#1a1918" : "#fafaf8");
}

applyTheme(savedTheme || preferredTheme);

themeButton?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("weekly-pulse-theme", nextTheme);
  applyTheme(nextTheme);
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
