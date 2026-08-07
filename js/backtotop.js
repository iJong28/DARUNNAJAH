/* ==========================================================
     BACK TO TOP
  ========================================================== */

export function initBackToTop() {
  const backToTop = document.getElementById("backToTop");

  if (backToTop) {

    const toggleBackToTop = () => {
      backToTop.classList.toggle("hidden", window.scrollY <= 300);
    };

    window.addEventListener("scroll", toggleBackToTop);

    toggleBackToTop();

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

  }
}