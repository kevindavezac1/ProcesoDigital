const elements = document.querySelectorAll('.reveal');

const observerr = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observerr.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.25,
    rootMargin: "0px 0px -60px 0px"
  }
);

elements.forEach(el => observerr.observe(el));



const steps = document.querySelectorAll(".timeline-step");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.style.opacity = 1;
      entry.target.style.transform = "translateY(0)";
    }
  });
},{ threshold: 0.2 });

steps.forEach(step=>{
  step.style.opacity = 0;
  step.style.transform = "translateY(40px)";
  step.style.transition = "all .8s cubic-bezier(.2,.8,.2,1)";
  observer.observe(step);
});


const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  reveals.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 100) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();
