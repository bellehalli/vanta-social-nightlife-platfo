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
let activeRange = 'weekend';
let exactDateFilter = null;

function parseLocalDateKey(key){
  const [y,m,d] = key.split('-').map(Number);
  return new Date(y, m-1, d, 12, 0, 0);
}
function startOfToday(){
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12, 0, 0);
}
function isSameDay(a,b){
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function inNamedRange(date, range){
  const today = startOfToday();
  const diffDays = Math.round((date - today) / 86400000);
  if(range === 'today') return isSameDay(date, today);
  if(range === 'seven') return diffDays >= 0 && diffDays <= 7;
  if(range === 'month') return date.getFullYear()===today.getFullYear() && date.getMonth()===today.getMonth();
  if(range === 'weekend'){
    const day = today.getDay();
    const toSat = (6 - day + 7) % 7;
    const sat = new Date(today); sat.setDate(today.getDate()+toSat);
    const sun = new Date(sat); sun.setDate(sat.getDate()+1);
    return isSameDay(date,sat) || isSameDay(date,sun);
  }
  return true;
}
function applyEventFilters(){
  let visible = 0;
  const vibe = vibeSelect?.value || 'all';

  eventCards.forEach(card => {
    const dateKey = card.dataset.date;
    const cardDate = dateKey ? parseLocalDateKey(dateKey) : null;
    const cardVibe = card.dataset.vibe || '';
    const dateMatch = exactDateFilter
      ? dateKey === exactDateFilter
      : (cardDate ? inNamedRange(cardDate, activeRange) : true);
    const vibeMatch = vibe === 'all' || cardVibe === vibe;
    const show = dateMatch && vibeMatch;
    card.hidden = !show;
    if(show) visible++;
  });

  if(emptyState){
    emptyState.style.display = visible ? 'none' : 'block';
    emptyState.textContent = exactDateFilter
      ? 'No listed Vanta event on that date.'
      : 'No events match that date range and vibe yet.';
  }
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    exactDateFilter = null;
    activeRange = button.dataset.eventFilter || 'weekend';
    filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    applyEventFilters();
  });
});
vibeSelect?.addEventListener('change', applyEventFilters);
applyEventFilters();

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
const floorplanStatus = document.querySelector('[data-floorplan-status]');

function selectZone(key){
  const info = vipData[key];
  if(!info) return;
  zones.forEach(z => {
    const isActive = z.dataset.zone === key;
    z.classList.toggle('active', isActive);
    if (z.matches('[role="tab"]')) z.setAttribute('aria-selected', String(isActive));
    if (z.matches('.floor-zone-svg')) z.setAttribute('aria-pressed', String(isActive));
  });
  document.querySelectorAll('[data-selection-name]').forEach(el => el.textContent = info.name);
  document.querySelectorAll('[data-selection-price]').forEach(el => el.textContent = info.price);
  document.querySelectorAll('[data-selection-capacity]').forEach(el => el.textContent = info.capacity);
  document.querySelectorAll('[data-selection-deposit]').forEach(el => el.textContent = info.deposit);
  document.querySelectorAll('[data-selection-best]').forEach(el => el.textContent = info.best);
  document.querySelectorAll('[data-selection-note]').forEach(el => el.textContent = info.note);
  if(reservationSection) reservationSection.value = info.name;
  if(floorplanStatus) floorplanStatus.textContent = `${info.name} selected. Tap another highlighted area to compare.`;
}
zones.forEach(zone => {
  zone.addEventListener('click', () => {
    if (zone.dataset.availability === 'unavailable') {
      const status = document.querySelector('[data-floorplan-status]');
      if(status) status.textContent = 'That section is booked for this demo night. Choose another highlighted section.';
      return;
    }
    selectZone(zone.dataset.zone);
  });
  if (zone.matches('.floor-zone-svg')) {
    zone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (zone.dataset.availability === 'unavailable') {
          const status = document.querySelector('[data-floorplan-status]');
          if(status) status.textContent = 'That section is booked for this demo night. Choose another highlighted section.';
        } else {
          selectZone(zone.dataset.zone);
        }
      }
    });
  }
});
if(zones.length) selectZone('main');


// =========================================================
// Sellable premium systems: calendar, bottle builder,
// Ask Vanta concierge
// =========================================================


// Collapsible calendar widget
const calendarToggle = document.querySelector('[data-calendar-toggle]');
const calendarDrawer = document.querySelector('[data-calendar]');

calendarToggle?.addEventListener('click', () => {
  const willOpen = calendarDrawer?.hasAttribute('hidden') ?? true;
  if (willOpen) {
    calendarDrawer?.removeAttribute('hidden');
  } else {
    calendarDrawer?.setAttribute('hidden', '');
  }
  calendarToggle.setAttribute('aria-expanded', String(willOpen));
});


document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && calendarDrawer && !calendarDrawer.hasAttribute('hidden')) {
    calendarDrawer.setAttribute('hidden','');
    calendarToggle?.setAttribute('aria-expanded','false');
    calendarToggle?.focus();
  }
});

// Functional event calendar
const calendarRoot = document.querySelector('[data-calendar]');
if (calendarRoot) {
  const eventData = {
    '2026-09-05': [{title:'After Hours', time:'10 PM', href:'after-hours.html', vibe:'Hip-Hop · Open Format'}],
    '2026-09-06': [{title:'Sunday Service', time:'4 PM', href:'sunday-service.html', vibe:'Day Party · R&B'}],
    '2026-09-11': [{title:'Velvet Fridays', time:'10 PM', href:'velvet-fridays.html', vibe:'R&B · Hip-Hop · Afrobeats'}],
    '2026-09-18': [{title:'Global Frequency', time:'10 PM', href:'global-frequency.html', vibe:'Afrobeats · Amapiano'}]
  };

  let calendarDate = new Date(Date.UTC(2026, 8, 1));
  let selectedDate = '2026-09-05';
  const grid = calendarRoot.querySelector('[data-cal-grid]');
  const label = calendarRoot.querySelector('[data-cal-label]');
  const dateLabel = calendarRoot.querySelector('[data-cal-date]');
  const results = calendarRoot.querySelector('[data-cal-results]');
  const prev = calendarRoot.querySelector('[data-cal-prev]');
  const next = calendarRoot.querySelector('[data-cal-next]');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const isoDate = (y,m,d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  function renderCalendarResults(key) {
    const [y,m,d] = key.split('-').map(Number);
    if (dateLabel) dateLabel.textContent = `${monthNames[m-1]} ${d}`;
    const items = eventData[key] || [];
    if (!results) return;
    if (!items.length) {
      results.innerHTML = '<p class="muted">No listed Vanta event on this date. Choose another highlighted date.</p>';
      return;
    }
    results.innerHTML = items.map(item => `
      <div class="cal-event-result">
        <div><strong>${item.title}</strong><br><span>${item.time} · ${item.vibe}</span></div>
        <a href="${item.href}">View event →</a>
      </div>`).join('');
  }

  function renderCalendar() {
    const y = calendarDate.getUTCFullYear();
    const m = calendarDate.getUTCMonth();
    if (label) label.textContent = `${monthNames[m]} ${y}`;
    if (!grid) return;
    grid.innerHTML = '';

    const firstDay = new Date(Date.UTC(y,m,1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(y,m+1,0)).getUTCDate();
    const prevDays = new Date(Date.UTC(y,m,0)).getUTCDate();

    for (let cell=0; cell<42; cell++) {
      let day, cellMonth=m, cellYear=y, outside=false;
      if (cell < firstDay) {
        day = prevDays - firstDay + cell + 1;
        cellMonth = m - 1;
        if (cellMonth < 0) { cellMonth = 11; cellYear--; }
        outside = true;
      } else if (cell >= firstDay + daysInMonth) {
        day = cell - firstDay - daysInMonth + 1;
        cellMonth = m + 1;
        if (cellMonth > 11) { cellMonth = 0; cellYear++; }
        outside = true;
      } else {
        day = cell - firstDay + 1;
      }

      const key = isoDate(cellYear,cellMonth,day);
      const events = eventData[key] || [];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `calendar-day${outside ? ' outside' : ''}${events.length ? ' has-event' : ''}${key === selectedDate ? ' selected' : ''}`;
      btn.disabled = outside;
      btn.setAttribute('aria-label', `${monthNames[cellMonth]} ${day}${events.length ? `, ${events.length} event` : ''}`);
      btn.innerHTML = `<span class="calendar-day-number">${day}</span>${events.length ? '<i class="calendar-dot"></i><span class="calendar-event-count">'+events.length+' event</span>' : ''}`;
      if (!outside) {
        btn.addEventListener('click', () => {
          selectedDate = key;
          renderCalendar();
          renderCalendarResults(key);

          exactDateFilter = key;
          filterButtons.forEach(button => button.classList.remove('active'));
          applyEventFilters();
        });
      }
      grid.appendChild(btn);
    }
  }

  prev?.addEventListener('click', () => {
    calendarDate = new Date(Date.UTC(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth()-1, 1));
    renderCalendar();
  });
  next?.addEventListener('click', () => {
    calendarDate = new Date(Date.UTC(calendarDate.getUTCFullYear(), calendarDate.getUTCMonth()+1, 1));
    renderCalendar();
  });

  renderCalendar();
  renderCalendarResults(selectedDate);
}

// Bottle builder
const bottleButtons = [...document.querySelectorAll('[data-bottle]')];
const builderItems = document.querySelector('[data-builder-items]');
const builderCount = document.querySelector('[data-builder-count]');
const builderTotal = document.querySelector('[data-builder-total]');
const builderToForm = document.querySelector('[data-builder-to-form]');
const bottleField = document.querySelector('[data-reservation-bottles]');
const selectedBottles = new Map();

function renderBottleBuilder() {
  if (!builderItems) return;
  const entries = [...selectedBottles.entries()];
  const count = entries.reduce((sum,[,item]) => sum + item.qty, 0);
  const total = entries.reduce((sum,[,item]) => sum + item.qty * item.price, 0);

  if (!entries.length) {
    builderItems.innerHTML = '<p class="builder-empty">Tap bottles to add them here.</p>';
  } else {
    builderItems.innerHTML = entries.map(([name,item]) => `
      <div class="builder-item">
        <span>${item.qty}× ${name}</span>
        <strong>$${(item.qty*item.price).toLocaleString()}</strong>
        <button type="button" data-remove-bottle="${name}" aria-label="Remove one ${name}">×</button>
      </div>`).join('');
  }

  if (builderCount) builderCount.textContent = String(count);
  if (builderTotal) builderTotal.textContent = `$${total.toLocaleString()}`;
  if (builderToForm) builderToForm.disabled = count === 0;
  bottleButtons.forEach(btn => btn.classList.toggle('added', selectedBottles.has(btn.dataset.bottle)));

  document.querySelectorAll('[data-remove-bottle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.removeBottle;
      const item = selectedBottles.get(name);
      if (!item) return;
      item.qty -= 1;
      if (item.qty <= 0) selectedBottles.delete(name);
      renderBottleBuilder();
    });
  });
}

bottleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.bottle;
    const price = Number(btn.dataset.price || 0);
    const current = selectedBottles.get(name) || {qty:0, price};
    const totalQty = [...selectedBottles.values()].reduce((sum,item)=>sum+item.qty,0);
    if (current.qty >= 6 || totalQty >= 12) {
      toast?.classList.add('show');
      if (toast) toast.textContent = totalQty >= 12 ? 'Demo builder limit reached: 12 bottles.' : 'Demo builder limit reached: 6 of one bottle.';
      setTimeout(() => {
        toast?.classList.remove('show');
        if (toast) toast.textContent = 'Demo only — no information was submitted.';
      }, 2600);
      return;
    }
    current.qty += 1;
    selectedBottles.set(name, current);
    btn.classList.add('added');
    renderBottleBuilder();
  });
});

builderToForm?.addEventListener('click', () => {
  const summary = [...selectedBottles.entries()].map(([name,item]) => `${item.qty}× ${name}`).join(', ');
  if (bottleField) bottleField.value = summary;
  document.querySelector('#reserve')?.scrollIntoView({behavior:'smooth', block:'start'});
  bottleField?.focus();
});
renderBottleBuilder();

// Ask Vanta concierge
const conciergeForm = document.querySelector('[data-concierge-form]');
if (conciergeForm) {
  const title = document.querySelector('[data-rec-title]');
  const copy = document.querySelector('[data-rec-copy]');
  const entry = document.querySelector('[data-rec-entry]');
  const move = document.querySelector('[data-rec-move]');
  const upgrade = document.querySelector('[data-rec-upgrade]');
  const eventLink = document.querySelector('[data-rec-event]');

  const recommendationMap = {
    rnb:{title:'Velvet Fridays',copy:'R&B, Hip-Hop and Afrobeats with the strongest dance-floor fit for your picks.',entry:'Advance ticket',move:'Arrive before midnight',href:'velvet-fridays.html'},
    global:{title:'Global Frequency',copy:'Afrobeats and Amapiano with a high-energy global room.',entry:'Advance ticket',move:'Arrive by 11:30 PM',href:'global-frequency.html'},
    day:{title:'Sunday Service',copy:'A daytime party with R&B, cocktails and an earlier start.',entry:'Guest list or advance',move:'Arrive before 6 PM',href:'sunday-service.html'},
    open:{title:'After Hours',copy:'Hip-Hop and open-format records for a faster late-night room.',entry:'Anytime ticket',move:'Arrive before midnight',href:'after-hours.html'}
  };

  conciergeForm.addEventListener('submit', event => {
    event.preventDefault();
    const fd = new FormData(conciergeForm);
    const vibe = String(fd.get('vibe') || 'rnb');
    const group = Number(fd.get('group') || 2);
    const priority = String(fd.get('priority') || 'dance');
    const rec = recommendationMap[vibe] || recommendationMap.rnb;

    let entryText = rec.entry;
    let moveText = rec.move;
    let upgradeText = group >= 7 ? 'VIP Wall or Center Booth' : group >= 5 ? 'Main Floor table' : 'Optional table upgrade';

    if (priority === 'budget') { entryText = 'Guest list / early release'; moveText = 'Use early-entry cutoff'; }
    if (priority === 'vip') { upgradeText = group >= 9 ? 'DJ Section' : group >= 7 ? 'Center Booth' : 'VIP Wall'; }
    if (priority === 'early') { moveText = 'Arrive during first hour'; entryText = 'Guest list'; }

    if (title) title.textContent = rec.title;
    if (copy) copy.textContent = rec.copy;
    if (entry) entry.textContent = entryText;
    if (move) move.textContent = moveText;
    if (upgrade) upgrade.textContent = upgradeText;
    if (eventLink) eventLink.href = rec.href;
  });
}


// Pause decorative marquee when the tab is not visible.
document.addEventListener('visibilitychange', () => {
  const marquee = document.querySelector('.marquee-track');
  if (marquee) marquee.style.animationPlayState = document.hidden ? 'paused' : 'running';
});


document.addEventListener('visibilitychange', () => {
  const reel = document.querySelector('.motion-reel-track');
  if (reel) reel.style.animationPlayState = document.hidden ? 'paused' : 'running';
});


// Small final usability polish: when a VIP section is selected, keep the
// request flow coherent without forcing a page jump.
const requestThisSection = document.querySelector('.interactive-panel a[href="#reserve"]');
requestThisSection?.addEventListener('click', () => {
  const section = document.querySelector('#reserve');
  setTimeout(() => section?.querySelector('input,select,textarea')?.focus({preventScroll:true}), 500);
});
