import { loadNavbar } from "./navbar.js";
import { initHeroSlider } from "./slider.js";
import { initProgramTabs } from "./tabs.js";
import { initBackToTop } from "./backtotop.js";

document.addEventListener("DOMContentLoaded", async () => {
  
  await loadNavbar();
  initHeroSlider();
  initProgramTabs();
  initBackToTop();

});