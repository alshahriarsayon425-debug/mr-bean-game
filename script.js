/* =========================================================
   BEAN RUN — Landing Page interactions
   Vanilla JS · no dependencies
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -------------------------------------------------------
     1. Navbar: scrolled state + mobile menu
  ------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav__links");

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close mobile menu after clicking a link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* -------------------------------------------------------
     2. Scroll reveal (IntersectionObserver)
  ------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* -------------------------------------------------------
     3. Parallax hero background
  ------------------------------------------------------- */
  const heroBg = document.getElementById("heroBg");
  if (heroBg && !reduceMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight) {
            heroBg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
          }
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* -------------------------------------------------------
     4. Feature card cursor spotlight
  ------------------------------------------------------- */
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* -------------------------------------------------------
     5. Ripple effect on buttons
  ------------------------------------------------------- */
  document.querySelectorAll(".ripple").forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const wave = document.createElement("span");
      wave.className = "ripple__wave";
      wave.style.width = wave.style.height = `${size}px`;
      wave.style.left = `${e.clientX - r.left - size / 2}px`;
      wave.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove());
    });
  });

  /* -------------------------------------------------------
     6. Screenshot modal preview
  ------------------------------------------------------- */
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalClose = document.getElementById("modalClose");

  const openModal = (src, alt) => {
    modalImg.src = src;
    modalImg.alt = alt || "Screenshot preview";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".shot").forEach((shot) => {
    shot.addEventListener("click", () => {
      const img = shot.querySelector("img");
      openModal(shot.dataset.full, img ? img.alt : "");
    });
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* -------------------------------------------------------
     7. Background music toggle (music.mp3)
  ------------------------------------------------------- */
  const music = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicToggle");
  if (music && musicBtn) {
    music.volume = 0.45;
    musicBtn.addEventListener("click", () => {
      if (music.paused) {
        music.play().then(
          () => {
            musicBtn.classList.add("is-playing");
            musicBtn.setAttribute("aria-pressed", "true");
          },
          () => {
            /* autoplay blocked — ignore silently */
          }
        );
      } else {
        music.pause();
        musicBtn.classList.remove("is-playing");
        musicBtn.setAttribute("aria-pressed", "false");
      }
    });
  }

  /* -------------------------------------------------------
     8. Lightweight animated particle background (Canvas)
  ------------------------------------------------------- */
  const canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = Math.floor(innerWidth * dpr);
      h = canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      // particle count scales with screen size, capped for performance
      const count = Math.min(80, Math.floor((innerWidth * innerHeight) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.8 + 0.5) * dpr,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        a: Math.random() * 0.5 + 0.2,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // wrap around edges
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 180, 255, ${p.a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };

    resize();
    draw();
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 200);
    });
  }
})();
