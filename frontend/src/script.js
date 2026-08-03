const form = document.getElementById('rsvp-form');
const statusEl = document.getElementById('status');
const API = window.API_URL || '';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Sending...';
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  payload.guests = Number(payload.guests || 0);

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
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error sending RSVP. Try again later.';
  }
});
