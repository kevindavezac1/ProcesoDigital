// Reveal animations
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

reveals.forEach(el => revealObserver.observe(el));


// Color-changing help section
const slides = document.querySelectorAll('.help-slide');

const slideObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bg = entry.target.dataset.bg;
            entry.target.style.background = bg;
        }
    });
}, { threshold: 0.6 });

slides.forEach(slide => slideObserver.observe(slide));
