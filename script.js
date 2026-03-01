/* =========================
   Base & Layout
   ========================= */
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: #1b1b1b;
  color: #f0eff4;
  line-height: 1.6;
}

a { color: inherit; text-decoration: none; }

.container { max-width: 1200px; margin: 0 auto; padding: 1rem; }

/* =========================
   Header
   ========================= */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.5rem 1rem;
  background-color: #291528;
}

.credential-header { font-size: 0.9rem; flex: 1 1 auto; min-width: 200px; }
.theme-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #fff; }

/* =========================
   Identity
   ========================= */
.identity-row { display: flex; flex-wrap: wrap; gap: 2rem; margin: 2rem 0; justify-content: center; }
.identity-photo { display: flex; flex-direction: column; align-items: center; }
.profile-img { width: 180px; height: 180px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; }
.social-links { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; justify-content: center; }
.follow-btn { padding: 0.5rem 1rem; background-color: #9e829c; border: none; border-radius: 6px; cursor: pointer; color: #fff; transition: background 0.25s ease; }
.follow-btn.following { background-color: #6f4a85; }

.identity-info { max-width: 600px; }
.identity-info h1 { margin: 0.25rem 0; }
.sub-name { font-size: 0.9rem; color: #9e829c; margin-bottom: 0.5rem; }
.identity-info h3 { font-weight: 400; margin-bottom: 1rem; font-size: 1.1rem; }

/* =========================
   Timeline
   ========================= */
.timeline { margin: 2rem 0; }
.timeline-item { display: flex; flex-direction: column; margin-bottom: 2rem; }
.timeline-date { font-weight: bold; margin-bottom: 0.5rem; color: #9e829c; }
.timeline-content h4 { margin: 0.25rem 0; }
.timeline-content ul { padding-left: 1.25rem; }

/* =========================
   Matrix Cards
   ========================= */
.profile-matrix { max-width: 1200px; margin: 4rem auto; padding: 1rem; }
.matrix-title { text-align: center; font-size: 2rem; margin-bottom: 2rem; }
.matrix-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
.matrix-card { border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; background: rgba(255,255,255,0.04); backdrop-filter: blur(6px); transition: transform 0.25s ease, box-shadow 0.25s ease; }
.matrix-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
.card-toggle { width: 100%; background: none; border: none; padding: 1rem 1.25rem; color: inherit; font-size: 1rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.card-toggle:focus { outline: 2px solid rgba(255,255,255,0.35); outline-offset: 2px; }
.chevron { transition: transform 0.3s ease; }
.card-toggle[aria-expanded="true"] .chevron { transform: rotate(180deg); }
.card-content { padding: 0 1.25rem 1.25rem; display: none; line-height: 1.6; font-size: 0.95rem; }
.matrix-card.open .card-content { display: block; }
