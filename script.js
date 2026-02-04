const elements = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.25,
    rootMargin: "0px 0px -60px 0px"
  }
);

elements.forEach(el => observer.observe(el));
