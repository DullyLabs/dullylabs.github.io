/* Shared behaviour for /weeklypulse/ pages. */

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
