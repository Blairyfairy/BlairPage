// =========================
// BlairPage main.js
// =========================

// ======= THEME TOGGLE =======
const themeToggleBtn = document.getElementById("themeToggle");
const body = document.body;

// Check localStorage for saved theme
if (localStorage.getItem("blairTheme") === "dark") {
  body.classList.add("dark");
} else if (localStorage.getItem("blairTheme") === "light") {
  body.classList.remove("dark");
}

// Toggle dark/light theme
themeToggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");

  // Save preference
  if (body.classList.contains("dark")) {
    localStorage.setItem("blairTheme", "dark");
  } else {
    localStorage.setItem("blairTheme", "light");
  }
});

// ======= CONNECT / FOLLOW BUTTON =======
const followBtn = document.getElementById("followBtn");
const btnText = followBtn ? followBtn.querySelector(".btn-text") : null;

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

// ======= COURSES EXPANDABLE TOGGLE =======
const courseGroups = document.querySelectorAll(".course-group");

courseGroups.forEach(group => {
  const toggleBtn = group.querySelector(".course-toggle");
  toggleBtn.addEventListener("click", () => {
    group.classList.toggle("open");
  });
});

// ======= CERTIFICATION CARDS EXPANDABLE =======
const certCards = document.querySelectorAll(".cert-card");

certCards.forEach(card => {
  card.addEventListener("click", () => {
    card.classList.toggle("open");
  });
});

// ======= OPTIONAL: Smooth scroll for timeline items =======
const timelineLinks = document.querySelectorAll(".timeline-item a");
timelineLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href");
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ======= OPTIONAL: Add small animations on page load =======
document.addEventListener("DOMContentLoaded", () => {
  const fadeInElements = document.querySelectorAll(
    ".resume-shell, .timeline-item, .course-group, .cert-card, .volunteer-card, .education-card"
  );
  fadeInElements.forEach((el, idx) => {
    el.style.opacity = 0;
    el.style.transform = "translateY(20px)";
    setTimeout(() => {
      el.style.transition = "all 0.5s ease-out";
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    }, idx * 100);
  });
});
