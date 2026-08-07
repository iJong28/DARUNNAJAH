/* ==========================================================
   PROGRAM TABS
========================================================== */

export function initProgramTabs() {
  const tabs = document.querySelectorAll(".program-tab");
  const contents = document.querySelectorAll(".program-content");

  if (tabs.length === 0) {
    return;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active-tab"));
      contents.forEach((c) => c.classList.add("hidden"));

      tab.classList.add("active-tab");
      document.getElementById(tab.dataset.target).classList.remove("hidden");
    });
  });
}