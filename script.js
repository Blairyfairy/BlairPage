<script>
/* =========================================================
   DOM READY WRAPPER (REQUIRED FIX)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     FOLLOW / CONNECT BUTTON
     ========================================================= */

  const followBtn = document.getElementById("followBtn");
  const btnText = document.querySelector(".btn-text");

  if (followBtn && btnText) {
    followBtn.addEventListener("click", () => {
      followBtn.classList.toggle("following");

      if (followBtn.classList.contains("following")) {
        btnText.textContent = "Connected ✓";
      } else {
        btnText.textContent = "Connect";
      }
    });
  }

  /* =========================================================
     THEME TOGGLE (LIGHT / DARK) — FIXED
     ========================================================= */

  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");

      themeToggle.textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
    });
  }

  /* =========================================================
     COURSE SECTION TOGGLES
     ========================================================= */

  document.querySelectorAll(".course-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("open");
    });
  });

  /* =========================================================
     CERTIFICATION CARD EXPAND / COLLAPSE
     ========================================================= */

  document.querySelectorAll(".cert-card").forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("open");
    });
  });

  /* =========================================================
     DEFENSIVE FIX:
     Prevent nested links from blocking expand
     ========================================================= */

  document.querySelectorAll(".cert-card a").forEach(link => {
    link.addEventListener("click", e => e.stopPropagation());
  });

});
</script>
