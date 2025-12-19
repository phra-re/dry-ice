/* ==========================================================
   ui.js
   - Vanilla JS UI behaviors (no external libs)
   ========================================================== */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---- Year in footer
  const y = $("#y");
  if (y) y.textContent = String(new Date().getFullYear());

  // ---- Mobile menu (drawer)
  const menuBtn = $("#menuBtn");
  const mobileMenu = $("#mobileMenu");
  const closeBtn = $("#closeMenuBtn");

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const first = $(".mobile-links a", mobileMenu);
    if (first) first.focus();
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (menuBtn) menuBtn.focus();
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", openMenu);
  }
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener("click", closeMenu);
  }
  if (mobileMenu) {
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu.getAttribute("aria-hidden") === "false") closeMenu();
    });
  }

  // ---- Smooth scrolling with sticky header offset + close menu on click
  function scrollToHash(hash) {
    if (!hash || hash === "#") return;
    const id = decodeURIComponent(hash).slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    const header = $(".topbar");
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const top = window.scrollY + el.getBoundingClientRect().top - headerH - 14;

    window.scrollTo({ top, behavior: "smooth" });
  }

  function handleNavClick(e) {
    const a = e.currentTarget;
    const href = a.getAttribute("href") || "";

    // Future multi-page: keep `data-route="/servicii"` on links.
    // When you convert to multi-page, you can remove this block and let navigation happen normally.
    if (href.startsWith("#")) {
      e.preventDefault();
      closeMenu();
      scrollToHash(href);
      history.replaceState(null, "", href);
    }
  }

  $$(".nav a, .mobile-links a").forEach((a) => {
    a.addEventListener("click", handleNavClick);
  });

  // ---- Accordions (FAQ + Aplicații on mobile)
  function initAccordion(rootSel) {
    const root = $(rootSel);
    if (!root) return;

    const items = $$(".acc-item", root);

    function setExpanded(item, expanded) {
      item.setAttribute("aria-expanded", expanded ? "true" : "false");

      const panel = $(".acc-panel", item);
      if (!panel) return;

      if (expanded) {
        // Set to scrollHeight for transition
        const content = $(".acc-content", panel);
        const h = content ? content.scrollHeight : panel.scrollHeight;
        panel.style.maxHeight = h + "px";
      } else {
        panel.style.maxHeight = "0px";
      }
    }

    // Initialize
    items.forEach((item) => setExpanded(item, item.getAttribute("aria-expanded") === "true"));

    items.forEach((item) => {
      const btn = $(".acc-button", item);
      if (!btn) return;

      btn.addEventListener("click", () => {
        const isExpanded = item.getAttribute("aria-expanded") === "true";

        // Single-open behavior for FAQ (but not for Apps; it's okay either way)
        if (rootSel === "#faqAccordion") {
          items.forEach((other) => {
            if (other !== item) setExpanded(other, false);
          });
        }
        setExpanded(item, !isExpanded);
      });
    });

    // Recompute heights on resize (important when switching mobile/desktop)
    window.addEventListener("resize", () => {
      items.forEach((item) => {
        if (item.getAttribute("aria-expanded") === "true") setExpanded(item, true);
      });
    });
  }

  initAccordion("#faqAccordion");
  initAccordion("#appsAccordion");

  // ---- Active section highlighting (desktop + mobile menu)
  const navLinks = $$(".nav a").filter((a) => (a.getAttribute("href") || "").startsWith("#"));
  const sections = navLinks
    .map((a) => document.getElementById((a.getAttribute("href") || "").slice(1)))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const linkById = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));

    const io = new IntersectionObserver(
      (entries) => {
        // pick the most visible entry
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible) return;

        const id = visible.target.id;
        navLinks.forEach((a) => a.removeAttribute("aria-current"));
        const active = linkById.get(id);
        if (active) active.setAttribute("aria-current", "page");
      },
      {
        root: null,
        threshold: [0.18, 0.28, 0.40],
        rootMargin: "-20% 0px -70% 0px",
      }
    );

    sections.forEach((s) => io.observe(s));
  }

  // ---- Image fallback (no external assets)
  // If you later add real images (e.g., images/gallery-1.jpg), missing ones become a local SVG placeholder.
  const placeholderSvg = () => {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="825" viewBox="0 0 1200 825">` +
      `<defs>` +
      `<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">` +
      `<stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>` +
      `<stop offset="1" stop-color="#e6eefc" stop-opacity=".95"/>` +
      `</linearGradient>` +
      `</defs>` +
      `<rect width="1200" height="825" fill="url(#g)"/>` +
      `<circle cx="330" cy="260" r="180" fill="#1fb6ff" fill-opacity=".12"/>` +
      `<circle cx="820" cy="520" r="240" fill="#1a56db" fill-opacity=".10"/>` +
      `<rect x="120" y="620" width="960" height="80" rx="40" fill="#0b1220" fill-opacity=".06"/>` +
      `<text x="160" y="675" font-family="Arial, sans-serif" font-size="38" fill="#0b1220" fill-opacity=".55">Carbon Ice Garrage • Galerie</text>` +
      `</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  };

  $$("img[data-fallback='placeholder']").forEach((img) => {
    img.addEventListener("error", () => {
      img.src = placeholderSvg();
    });
  });
})();
