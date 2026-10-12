/* Touch screens have no hover, so play each project's exhibit animation while
   its illustration is between the middle and the top quarter of the viewport,
   reversing it when scrolled out either way. */
if (matchMedia('(hover: none)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => {
    target.closest('.project-link').classList.toggle('is-active', isIntersecting);
  }), { rootMargin: '-25% 0px -50% 0px' });
  document.querySelectorAll('.project-link .exhibit').forEach(exhibit => observer.observe(exhibit));
}
