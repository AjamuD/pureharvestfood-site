document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    const updateMenuState = () => {
      const expanded = !mobileMenu.classList.contains('hidden');
      menuButton.setAttribute('aria-expanded', String(expanded));
      menuButton.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
    };
    menuButton.addEventListener('click', () => setTimeout(updateMenuState, 0));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        updateMenuState();
        menuButton.focus();
      }
    });
  }

  document.querySelectorAll('[data-whatsapp-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lines = [form.dataset.message || 'Hello Pure Harvest, I would like to make an enquiry.'];
      new FormData(form).forEach((value, key) => {
        const clean = String(value).trim();
        if (!clean || key.toLowerCase().includes('turnstile')) return;
        const field = form.elements.namedItem(key);
        const label = field?.closest?.('label')?.textContent?.trim() || field?.getAttribute?.('aria-label') || key.replaceAll('-', ' ');
        lines.push(`${label.replace('*', '').trim()}: ${clean}`);
      });
      lines.push('Please confirm current prices, availability and next steps.');
      window.open(`https://wa.me/18683618990?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    });
  });
});
