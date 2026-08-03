const form = document.getElementById('rsvp-form');
const statusEl = document.getElementById('status');
const API = window.API_URL || '';
const STORAGE_KEY = 'renewal-party-rsvp-status';

const countEls = {
  yes: document.getElementById('count-yes'),
  maybe: document.getElementById('count-maybe'),
  no: document.getElementById('count-no')
};

function loadCounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"yes":0,"maybe":0,"no":0}');
  } catch {
    return { yes: 0, maybe: 0, no: 0 };
  }
}

function renderCounts(counts) {
  Object.entries(countEls).forEach(([key, el]) => {
    el.textContent = counts[key] || 0;
  });
}

function saveCounts(counts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  renderCounts(counts);
}

function recordResponse(attending) {
  const counts = loadCounts();
  counts[attending] = (counts[attending] || 0) + 1;
  saveCounts(counts);
}

renderCounts(loadCounts());

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  payload.email = payload.email || 'not-provided';
  payload.plus_one = payload.plus_one || 'no';
  payload.dietary_restrictions = payload.dietary_restrictions || '';

  try {
    const res = await fetch(new URL('/rsvp', API).toString(), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
      mode: 'cors'
    });
    if (!res.ok) throw new Error(await res.text());
    statusEl.textContent = 'RSVP received — thank you!';
    recordResponse(payload.attending || 'yes');
    form.reset();
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error sending RSVP. Try again later.';
  }
});
