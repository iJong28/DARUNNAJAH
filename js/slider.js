/* ==========================================================
   HERO SLIDER
========================================================== */

export function initHeroSlider() {
  const heroSlides = document.querySelectorAll(".hero-slide");

  if (heroSlides.length === 0) {
    return;
  }

  let currentSlide = 0;

  setInterval(() => {
    heroSlides[currentSlide].classList.remove("opacity-100");
    heroSlides[currentSlide].classList.add("opacity-0");

    currentSlide = (currentSlide + 1) % heroSlides.length;

    heroSlides[currentSlide].classList.remove("opacity-0");
    heroSlides[currentSlide].classList.add("opacity-100");
  }, 5000);
}