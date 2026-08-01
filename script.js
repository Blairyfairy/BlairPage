/* Blair Page portfolio — consolidated interaction layer
   Replaces repeated resize handlers, DOM-wide MutationObservers, and inline style rewrites.
   Visual layout belongs in style.css; JavaScript only manages state and accessibility. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  function initializeTheme() {
    const button = $('#themeToggle') || $('.theme-btn');
    if (!button) return;

    const render = () => {
      const dark = document.body.classList.contains('dark');
      button.textContent = dark ? '☀️' : '🌙';
      button.setAttribute('aria-label', dark ? 'Use light theme' : 'Use dark theme');
      button.setAttribute('aria-pressed', String(dark));
    };

    button.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      render();
    });

    render();
  }

  function initializeMatrixCards() {
    $$('.matrix-card > .card-toggle').forEach((button) => {
      const card = button.closest('.matrix-card');
      const content = card ? $('.card-content', card) : null;
      const icon = $('.expand-icon', button);
      if (!card || !content) return;

      const setOpen = (open) => {
        card.classList.toggle('open', open);
        button.setAttribute('aria-expanded', String(open));
        content.hidden = !open;
        if (icon) icon.textContent = open ? '−' : '+';
      };

      setOpen(button.getAttribute('aria-expanded') === 'true' || card.classList.contains('open'));
      button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
    });
  }

  function initializeJobToggles() {
    $$('.job-details').forEach((job) => {
      $$(':scope > h4, :scope > .job-toggle-row > h4', job).forEach((heading) => {
        if ((heading.textContent || '').includes('Selected Projects')) return;

        let list = heading.closest('.job-toggle-row')?.nextElementSibling || heading.nextElementSibling;
        while (list && list.tagName !== 'UL' && list.tagName !== 'H4') list = list.nextElementSibling;
        if (!list || list.tagName !== 'UL') return;

        let row = heading.closest('.job-toggle-row');
        if (!row) {
          row = document.createElement('div');
          row.className = 'job-toggle-row';
          row.tabIndex = 0;
          row.setAttribute('role', 'button');

          const icon = document.createElement('span');
          icon.className = 'job-expand-btn';
          icon.setAttribute('aria-hidden', 'true');
          row.append(icon, heading);
          list.before(row);
        }

        const icon = $('.job-expand-btn', row);
        const setOpen = (open) => {
          row.setAttribute('aria-expanded', String(open));
          list.classList.toggle('expanded', open);
          list.hidden = !open;
          if (icon) icon.textContent = open ? '−' : '+';
        };

        setOpen(row.getAttribute('aria-expanded') === 'true');
        row.addEventListener('click', () => setOpen(row.getAttribute('aria-expanded') !== 'true'));
        row.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          setOpen(row.getAttribute('aria-expanded') !== 'true');
        });
      });
    });
  }

  function initializeConnectButton() {
    const button = $('#followBtn');
    if (!button) return;

    button.addEventListener('click', () => {
      button.classList.add('following');
      const label = $('.btn-text', button);
      if (label) label.textContent = 'Connected ✓';
      window.location.href = 'mailto:blairpagedrakemccoy@gmail.com?subject=Connect%20from%20Portfolio';
    });
  }

  function initializeScrollTop() {
    const button = $('#scrollTopBtn');
    if (!button) return;

    let ticking = false;
    const update = () => {
      button.classList.toggle('visible', window.scrollY > 500);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  function initializeExternalEmbeds() {
    // Defer heavy third-party embeds until they approach the viewport.
    const embeds = $$('[data-share-badge-id]');
    if (!embeds.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('embed-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });

    embeds.forEach((embed) => observer.observe(embed));
  }

  onReady(() => {
    document.documentElement.classList.add('js-ready');
    initializeTheme();
    initializeMatrixCards();
    initializeJobToggles();
    initializeConnectButton();
    initializeScrollTop();
    initializeExternalEmbeds();
  });
})();
