/* =========================================================
   Carbon Ice — UI JS (minimal, accessible)
   Phase 4.2
   ========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     Helpers
     ------------------------------------------------------- */

  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -------------------------------------------------------
     Mobile menu
     Required HTML hooks (to be added in Phase 4.3):
       - button[data-menu-toggle]
       - nav[data-menu]
       - body[data-menu-open] (added dynamically)
     ------------------------------------------------------- */

  const toggleBtn = qs("[data-menu-toggle]");
  const menu = qs("[data-menu]");

  if (toggleBtn && menu) {
    let lastFocusedElement = null;

    const openMenu = () => {
      lastFocusedElement = document.activeElement;

      document.body.dataset.menuOpen = "true";
      toggleBtn.setAttribute("aria-expanded", "true");
      menu.removeAttribute("aria-hidden");

      // Lock scroll
      document.body.style.overflow = "hidden";

      // Focus first focusable element inside menu
      const focusables = qsa(
        "a, button, input, textarea, select, [tabindex]:not([tabindex='-1'])",
        menu
      );
      if (focusables.length) {
        focusables[0].focus();
      }
    };

    const closeMenu = () => {
      delete document.body.dataset.menuOpen;
      toggleBtn.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");

      document.body.style.overflow = "";

      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    };

    toggleBtn.addEventListener("click", () => {
      const isOpen = document.body.dataset.menuOpen === "true";
      isOpen ? closeMenu() : openMenu();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.dataset.menuOpen === "true") {
        closeMenu();
      }
    });

    // Close on click outside menu
    document.addEventListener("click", (e) => {
      if (
        document.body.dataset.menuOpen === "true" &&
        !menu.contains(e.target) &&
        !toggleBtn.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Close when clicking a link inside menu
    qsa("a", menu).forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });
  }

  /* -------------------------------------------------------
     Smooth anchor scroll (safe)
     ------------------------------------------------------- */

  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = qs(id);
      if (!target) return;

      e.preventDefault();

      if (prefersReducedMotion) {
        target.scrollIntoView();
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

})();
