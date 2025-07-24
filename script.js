// ← your Apps Script exec URL
const API_BASE = 'https://script.google.com/macros/s/AKfycbxEaOqdUj8lfEIdkis5NLuEn3Z4HwNbBCWqUqoxqKnbc2PJj9Xxhjg6_du-ovEA8Wz1Ng/exec';


const formEl   = document.getElementById('search-form');
const resultsEl = document.getElementById('results');

formEl.addEventListener('submit', e => {
  e.preventDefault();
  const q = document.getElementById('query').value.trim();
  if (!q) return;
  resultsEl.innerHTML = '<p>Loading…</p>';

  // Clean up any old JSONP <script>
  const old = document.getElementById('jsonp-script');
  if (old) old.remove();

  // Insert new <script> to invoke our Apps Script JSONP
  const s = document.createElement('script');
  s.src = `${API_BASE}?q=${encodeURIComponent(q)}&callback=handleAmazon`;
  s.id = 'jsonp-script';
  document.body.appendChild(s);
});

// JSONP callback
function handleAmazon(data) {
  // Remove loading indicator
  resultsEl.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    resultsEl.innerHTML = '<p>No results.</p>';
    return;
  }

  // Render each item
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
    resultsEl.appendChild(card);
  });
}
