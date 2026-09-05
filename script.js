const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const toast = document.querySelector('[data-toast]');

const closeMenu = () => {
  mobileMenu?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
};

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

menuToggle?.addEventListener('click', () => {
  const open = mobileMenu?.classList.toggle('open') ?? false;
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    menuToggle?.focus();
  }
});

document.addEventListener('click', (event) => {
  if (!mobileMenu?.classList.contains('open')) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!mobileMenu.contains(target) && !menuToggle?.contains(target)) {
    closeMenu();
  }
});

document.querySelectorAll('[data-demo-form]').forEach(form => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    toast?.classList.add('show');
    setTimeout(() => toast?.classList.remove('show'), 3000);
  });
});
