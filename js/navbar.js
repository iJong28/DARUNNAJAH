import { getSession, signOut } from "./auth.js";

/* ==========================================================
   NAVBAR & MENU MODULE
========================================================== */

// Helper untuk penanganan Logout biar gak duplikasi kode
async function handleLogout() {
  try {
    await signOut();
    window.location.replace("login.html");
  } catch (error) {
    console.error("Gagal logout:", error);
    alert("Gagal untuk keluar, silakan coba lagi.");
  }
}

export async function loadNavbar() {
  const navbarPlaceholder = document.querySelector("[data-navbar]");
  if (!navbarPlaceholder) return console.error("Placeholder [data-navbar] tidak ditemukan.");

  try {
    const response = await fetch("_navbar.html");
    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    navbarPlaceholder.innerHTML = await response.text();

    // Update state auth & generate mobile menu
    await updateAuthElements();
    buildMobileMenu();
    initNavbar();

  } catch (error) {
    console.error("Error selama loadNavbar:", error);
    navbarPlaceholder.innerHTML = `<p class="text-center text-red-500 py-4">Gagal memuat navigasi: ${error.message}</p>`;
  }
}

async function updateAuthElements() {
  const session = await getSession();
  const loginButtonContainer = document.querySelector('a[href="login.html"]')?.parentElement;

  if (session && loginButtonContainer) {
    loginButtonContainer.innerHTML = `
      <button id="logout-button-navbar" type="button" 
        class="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">
        Keluar
      </button>
    `;
    document.getElementById("logout-button-navbar")?.addEventListener("click", handleLogout);
  }
}

function setupMobileMenuToggle() {
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIcon = document.getElementById("menu-icon");

  if (!menuBtn || !mobileMenu || !menuIcon) return;

  // Toggle Hamburger Menu
  menuBtn.addEventListener("click", () => {
    const isHidden = mobileMenu.classList.toggle("hidden");
    menuIcon.setAttribute("d", isHidden ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12");
  });  
}

function setupDesktopDropdown() {
  const dropdownBtn = document.getElementById("unit-sekolah-btn");
  const dropdownSubmenu = document.getElementById("unit-sekolah-submenu");
  const dropdownIcon = document.getElementById("unit-sekolah-icon");

  if (!dropdownBtn || !dropdownSubmenu) return;

  const closeDropdown = () => {
    dropdownSubmenu.classList.add("hidden");
    if (dropdownIcon) dropdownIcon.classList.remove("rotate-180");
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    const isHidden = dropdownSubmenu.classList.toggle("hidden");
    if (dropdownIcon) {
      dropdownIcon.classList.toggle("rotate-180", !isHidden);
    }
  };

  // Toggle saat tombol diklik
  dropdownBtn.addEventListener("click", toggleDropdown);

  // Tutup jika klik di mana saja di luar dropdown
  document.addEventListener("click", (e) => {
    if (!dropdownSubmenu.classList.contains("hidden") && !dropdownBtn.contains(e.target) && !dropdownSubmenu.contains(e.target)) {
      closeDropdown();
    }
  });

  // Tutup dengan tombol ESC (opsional tapi bagus untuk Aksesibilitas/Keyboard navigation)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });
}

// Event listener untuk dropdown di dalam menu mobile
function setupMobileDropdown() {
  const mobileMenu = document.getElementById("mobile-menu");

  if (!mobileMenu) return;

  mobileMenu.addEventListener("click", (event) => {
    const toggleButton = event.target.closest(".mobile-submenu-toggle");
    if (!toggleButton) return;

    const submenu = toggleButton.nextElementSibling;
    const icon = toggleButton.querySelector("svg");
    if (!submenu) return;

    const isHidden = submenu.classList.toggle("hidden");
    if (icon) icon.classList.toggle("rotate-180", !isHidden);
  });
}

function buildMobileMenu() {
  const mobileMenuContainer = document.getElementById("mobile-menu");
  const desktopLinksContainer = document.getElementById("nav-links");

  if (!mobileMenuContainer || !desktopLinksContainer) return;

  // 1. Kloning semua item dari menu desktop
  const clonedLinks = desktopLinksContainer.cloneNode(true);
  clonedLinks.id = "mobile-nav-links";
  clonedLinks.className = "space-y-2 p-4";

  // 2. Ubah link dan tombol dropdown untuk tampilan mobile
  clonedLinks.querySelectorAll("a").forEach(link => {
    link.className = "block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100";
  });

  // 3. Ubah struktur dropdown "Unit Sekolah" untuk mobile
  const desktopDropdown = clonedLinks.querySelector(".relative");
  if (desktopDropdown) {
    const button = desktopDropdown.querySelector("#unit-sekolah-btn");
    const submenu = desktopDropdown.querySelector("#unit-sekolah-submenu");

    if (button && submenu) {
      // Buat tombol toggle baru untuk mobile
      const mobileToggleButton = document.createElement('button');
      mobileToggleButton.className = "flex justify-between items-center w-full px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 mobile-submenu-toggle";
      mobileToggleButton.innerHTML = `
        <span>${button.textContent.trim()}</span>
        <svg class="ml-1 w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      `;

      // Ubah submenu untuk mobile
      submenu.id = "";
      submenu.className = "hidden mobile-submenu-content pl-6 bg-slate-50 transition-all";
      submenu.querySelectorAll('a').forEach(a => {
        a.className = "block px-4 py-2 text-sm text-gray-600 hover:bg-slate-200";
      });

      // Ganti dropdown desktop dengan versi mobile
      desktopDropdown.innerHTML = '';
      desktopDropdown.appendChild(mobileToggleButton);
      desktopDropdown.appendChild(submenu);
    }
  }

  // 4. Tambahkan tombol otentikasi (Login/Logout)
  const authButton = document.getElementById("logout-button-navbar") || document.querySelector('a[href="login.html"]');
  if (authButton) {
    const mobileAuthButton = authButton.cloneNode(true);
    mobileAuthButton.id = authButton.id === "logout-button-navbar" ? "logout-button-mobile" : "login-button-mobile";
    mobileAuthButton.className = `mt-3 block w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-white ${authButton.id === 'logout-button-navbar' ? 'bg-red-600' : 'bg-[#0b3b01]'}`;
    clonedLinks.appendChild(mobileAuthButton);
  }

  mobileMenuContainer.innerHTML = '';
  mobileMenuContainer.appendChild(clonedLinks);

  document.getElementById("logout-button-mobile")?.addEventListener("click", handleLogout);
}

export function initNavbar() {
  setupMobileMenuToggle();
  setupDesktopDropdown();
  setupMobileDropdown();
}
