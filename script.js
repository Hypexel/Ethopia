// ← replace this with your own Apps Script URL
const API_BASE = 'https://script.google.com/macros/s/AKfycbx6uzS-YUz0vz5VD-YRZEqrj07RtnHYRV0cKWi4ppdNCRv2iYCLWFP89ymD3ksCUkY-ew/exec';

const form    = document.getElementById('search-form');
const results = document.getElementById('results');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const q = document.getElementById('query').value.trim();
  if (!q) return;
  results.innerHTML = '<p>Loading…</p>';

  try {
    const res = await fetch(`${API_BASE}?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      results.innerHTML = '<p>No results found.</p>';
      return;
    }
    // render cards
    results.innerHTML = '';
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${item.image||''}" onerror="this.src='https://via.placeholder.com/220x180?text=No+Image'">
        <div class="card-content">
          <h2>${item.title||'—'}</h2>
          <div class="price">${item.price||'—'}</div>
          <a href="${item.link||'#'}" target="_blank">View on Amazon</a>
        </div>
      `;
      results.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    results.innerHTML = '<p>Error fetching data.</p>';
  }
});
