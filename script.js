// Follow Button Toggle
const followBtn = document.getElementById("followBtn");
const btnText = document.querySelector(".btn-text");

followBtn.addEventListener("click", () => {
  followBtn.classList.toggle("following");
  btnText.textContent = followBtn.classList.contains("following") ? "Connected ✓" : "Connect";
});

// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

// Matrix Card Expand/Collapse
document.querySelectorAll('.card-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.matrix-card');
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !expanded);
    card.classList.toggle('open');
  });
});
