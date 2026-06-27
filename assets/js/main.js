/* ==========================================================================
   ACE Mobile Wash & Wax - Site Interactions
   Vanilla JavaScript only: navigation, reveals, comparison, lightbox, form.
   ========================================================================== */

(() => {
  const businessPhoneDisplay = "(941) 289-7281";
  const businessPhoneRaw = "9412897281";
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-link");
  const yearNodes = document.querySelectorAll("[data-current-year]");

  // Keep copyright years current without requiring template tooling.
  yearNodes.forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  // Mobile navigation toggle with ARIA state.
  if (header && navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = header.dataset.navOpen === "true";
      header.dataset.navOpen = String(!isOpen);
      navToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        header.dataset.navOpen = "false";
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    const setHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  // Fade-in reveals are disabled automatically by CSS for reduced motion users.
  const revealNodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  // Before/after comparison slider.
  document.querySelectorAll(".comparison").forEach((comparison) => {
    const range = comparison.querySelector(".comparison-range");
    if (!range) return;

    const updatePosition = () => {
      comparison.style.setProperty("--position", `${range.value}%`);
    };

    range.addEventListener("input", updatePosition);
    updatePosition();
  });

  // Accessible gallery lightbox.
  const lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    const lightboxImage = lightbox.querySelector(".lightbox-image");
    const lightboxTitle = lightbox.querySelector(".lightbox-title");
    const closeButton = lightbox.querySelector(".lightbox-close");
    let activeTrigger = null;

    const openLightbox = (trigger) => {
      activeTrigger = trigger;
      const imageSource = trigger.dataset.lightboxSrc;
      const imageTitle = trigger.dataset.lightboxTitle || trigger.getAttribute("aria-label") || "ACE gallery image";

      lightboxImage.src = imageSource;
      lightboxImage.alt = imageTitle;
      lightboxTitle.textContent = imageTitle;
      lightbox.hidden = false;
      document.body.classList.add("lock-scroll");
      closeButton.focus();
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      lightboxImage.removeAttribute("src");
      document.body.classList.remove("lock-scroll");
      if (activeTrigger) activeTrigger.focus();
    };

    document.querySelectorAll(".gallery-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => openLightbox(trigger));
    });

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.hidden && event.key === "Escape") closeLightbox();
    });
  }

  // Contact panel: keeps call/text CTAs simple and copy-friendly.
  const contactPanel = document.querySelector("[data-contact-panel]");
  const contactNumber = document.querySelector("[data-contact-number]");
  const copyButton = document.querySelector("[data-copy-number]");
  const closeButtons = document.querySelectorAll("[data-contact-close]");
  const contactTriggers = document.querySelectorAll("[data-contact-trigger]");
  const copyStatus = document.querySelector("[data-copy-status]");
  let previousFocus = null;

  const openContactPanel = () => {
    if (!contactPanel) return;
    previousFocus = document.activeElement;
    contactPanel.hidden = false;
    document.body.classList.add("lock-scroll");
    if (contactNumber) contactNumber.textContent = businessPhoneDisplay;
    if (copyButton) copyButton.focus();
  };

  const closeContactPanel = () => {
    if (!contactPanel) return;
    contactPanel.hidden = true;
    document.body.classList.remove("lock-scroll");
    if (copyStatus) copyStatus.textContent = "";
    if (previousFocus) previousFocus.focus();
  };

  contactTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openContactPanel);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeContactPanel);
  });

  if (contactPanel) {
    contactPanel.addEventListener("click", (event) => {
      if (event.target === contactPanel) closeContactPanel();
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(businessPhoneRaw);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = businessPhoneRaw;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          textarea.remove();
        }
        if (copyStatus) copyStatus.textContent = "Copied.";
      } catch {
        if (copyStatus) copyStatus.textContent = "Copy failed. Select the number and copy manually.";
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactPanel && !contactPanel.hidden) {
      closeContactPanel();
    }
  });
})();
