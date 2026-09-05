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


// Event filters
const filterButtons = [...document.querySelectorAll('[data-event-filter]')];
const vibeSelect = document.querySelector('[data-vibe-filter]');
const eventCards = [...document.querySelectorAll('[data-event-card]')];
const emptyState = document.querySelector('[data-empty-state]');
let activeRange = 'all';

function applyEventFilters(){
  let visible = 0;
  const vibe = vibeSelect?.value || 'all';
  eventCards.forEach(card => {
    const ranges = (card.dataset.range || '').split(' ');
    const cardVibe = card.dataset.vibe || '';
    const rangeMatch = activeRange === 'all' || ranges.includes(activeRange);
    const vibeMatch = vibe === 'all' || cardVibe === vibe;
    const show = rangeMatch && vibeMatch;
    card.hidden = !show;
    if(show) visible++;
  });
  if(emptyState) emptyState.style.display = visible ? 'none' : 'block';
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeRange = button.dataset.eventFilter || 'all';
    filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    applyEventFilters();
  });
});
vibeSelect?.addEventListener('change', applyEventFilters);

// VIP interactive floorplan
const vipData = {
  main: {name:'Main Floor', price:'From $500', capacity:'4–6 guests', deposit:'$150', best:'Casual celebrations', note:'Closest to the main energy with quick bar access.'},
  vip: {name:'VIP Wall', price:'From $750', capacity:'6–8 guests', deposit:'$200', best:'Birthdays & groups', note:'Elevated section with a little more breathing room.'},
  dj: {name:'DJ Section', price:'From $1,200', capacity:'8–12 guests', deposit:'$300', best:'Big nights', note:'Premium placement beside the booth and strongest room visibility.'},
  center: {name:'Center Booth', price:'From $950', capacity:'6–10 guests', deposit:'$250', best:'Groups who want the middle of it', note:'Central sightline with easy access to both floor and service.'}
};
const zones = [...document.querySelectorAll('[data-zone]')];
const selectionName = document.querySelector('[data-selection-name]');
const selectionPrice = document.querySelector('[data-selection-price]');
const selectionCapacity = document.querySelector('[data-selection-capacity]');
const selectionDeposit = document.querySelector('[data-selection-deposit]');
const selectionBest = document.querySelector('[data-selection-best]');
const selectionNote = document.querySelector('[data-selection-note]');
const reservationSection = document.querySelector('[data-reservation-section]');

function selectZone(key){
  const info = vipData[key];
  if(!info) return;
  zones.forEach(z => z.classList.toggle('active', z.dataset.zone === key));
  if(selectionName) selectionName.textContent = info.name;
  if(selectionPrice) selectionPrice.textContent = info.price;
  if(selectionCapacity) selectionCapacity.textContent = info.capacity;
  if(selectionDeposit) selectionDeposit.textContent = info.deposit;
  if(selectionBest) selectionBest.textContent = info.best;
  if(selectionNote) selectionNote.textContent = info.note;
  if(reservationSection) reservationSection.value = info.name;
}
zones.forEach(zone => zone.addEventListener('click', () => selectZone(zone.dataset.zone)));
if(zones.length) selectZone('main');
