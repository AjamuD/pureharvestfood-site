(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('primary-navigation');
  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        toggle.focus();
      }
    });
  }

  document.querySelectorAll('.whatsapp-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lines = [form.dataset.message || 'Hello Pure Harvest, I would like to make an enquiry.'];
      new FormData(form).forEach((value, key) => {
        const field = form.elements.namedItem(key);
        const label = field?.dataset?.waLabel || key;
        const clean = String(value).trim();
        if (clean) lines.push(`${label}: ${clean}`);
      });
      lines.push('Please confirm current prices, availability and next steps.');
      window.open(`https://wa.me/18683618990?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    });
  });

  document.querySelectorAll('[data-print]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });
})();
