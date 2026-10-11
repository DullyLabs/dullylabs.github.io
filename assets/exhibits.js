/* Touch screens have no hover, so play each project's exhibit animation once
   the card's top scrolls above the middle of the viewport, and reverse it when
   scrolled back below. The root reaches far above the viewport, so a card stays
   active after it scrolls off the top, even after a fast jump. */
if (matchMedia('(hover: none)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
    target.classList.toggle('is-active', isIntersecting);
  }), { rootMargin: '10000% 0px -50% 0px' });
  document.querySelectorAll('.project-link').forEach(link => observer.observe(link));
}
