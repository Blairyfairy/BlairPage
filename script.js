const followBtn = document.getElementById("followBtn");
const btnText = document.querySelector(".btn-text");

followBtn.addEventListener("click", () => {
  followBtn.classList.toggle("following");

  if (followBtn.classList.contains("following")) {
    btnText.textContent = "Connected ✓";
  } else {
    btnText.textContent = "Connect";
  }
});

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.textContent = "☀️";
  } else {
    themeToggle.textContent = "🌙";
  }
});
<script>
document.querySelectorAll('.course-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentElement.classList.toggle('open');
  });
});
</script>

<script>
/* =========================================================
   APPENDED JS FIXES — SAFE / ADDITIVE ONLY
   ========================================================= */

/* Ensure theme toggle ALWAYS works */
(function () {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent =
      document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
})();

/* Certification cards expand / collapse */
(function () {
  document.querySelectorAll(".cert-card").forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("open");
    });
  });
})();

/* Defensive fix: prevent nested links from blocking expand */
document.querySelectorAll(".cert-card a").forEach(link => {
  link.addEventListener("click", e => e.stopPropagation());
});
</script>
