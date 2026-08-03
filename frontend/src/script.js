const form = document.getElementById('rsvp-form');
const statusEl = document.getElementById('status');
const rsvpListEl = document.getElementById('rsvp-list');
const API = window.API_URL || '';

function formatAttending(value) {
  return value === 'yes' ? 'Yes' : value === 'maybe' ? 'Maybe' : 'No';
}

function renderRsvps(rows) {
  if (!rows.length) {
    rsvpListEl.innerHTML = '<p class="empty-state">No RSVPs yet. Be the first to respond.</p>';
    return;
  }

  rsvpListEl.innerHTML = rows.map((row) => {
    const name = row.name || 'Anonymous';
    const attending = formatAttending(row.attending || 'no');
    const plusOne = row.plus_one === 'yes' ? 'Bringing a +1' : 'No +1';
    const dietary = row.dietary_restrictions ? `Dietary: ${row.dietary_restrictions}` : 'No dietary restrictions noted';
    const message = row.message ? `Message: ${row.message}` : '';

    return `
      <article class="rsvp-item">
        <div class="rsvp-item-main">
          <strong>${name}</strong>
          <span>${attending}</span>
        </div>
        <p>${plusOne}</p>
        <p>${dietary}</p>
        ${message ? `<p>${message}</p>` : ''}
      </article>
    `;
  }).join('');
}

async function loadRsvps() {
  try {
    const res = await fetch(new URL('/rsvps', API).toString(), {
      method: 'GET',
      mode: 'cors'
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const rows = data.rows || [];
    renderRsvps(rows);
  } catch (err) {
    console.error(err);
    rsvpListEl.innerHTML = '<p class="empty-state">Unable to load RSVPs right now.</p>';
  }
}

loadRsvps();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
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
    form.reset();
    await loadRsvps();
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error sending RSVP. Try again later.';
  }
});
