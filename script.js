// Configuration: your Apify actor, run ID, and token
const ACTOR_ID   = 'junglee/free-amazon-product-scraper';
const RUN_ID     = 'XVDTQc4a7MDTqSTMJ';
const API_TOKEN  = 'apify_api_6ARG3wKwukfXgjatHQ2IcnsM3mfo9p3l7SU9';

// DOM references
const formEl    = document.getElementById('search-form');
const resultsEl = document.getElementById('results');

// Helper: fetch products from a specific run, filtering by query
async function fetchAmazonFromRun(query) {
  const actorPath = ACTOR_ID.replace('/', '~');
  const url = `https://api.apify.com/v2/acts/${actorPath}` +
              `/runs/${RUN_ID}/dataset/items` +
              `?token=${API_TOKEN}` +
              `&limit=10` +
              `&searchTerms=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Apify error: ${res.status}`);
  return res.json();  // returns array of { title, price, url, image, asin, ... }
}

// Render a loading or message row
function renderMessage(msg, cls = 'loading') {
  resultsEl.innerHTML = `<div class="${cls}">${msg}</div>`;
}

// Event: on form submit, fetch & display
formEl.addEventListener('submit', async e => {
  e.preventDefault();
  const query = document.getElementById('query').value.trim();
  if (!query) return;
  renderMessage('Loading…', 'loading');

  try {
    let items = await fetchAmazonFromRun(query);

    if (!items.length) {
      renderMessage('No products found.', 'no-results');
      return;
    }

    // Sort by numeric price ascending
    items.sort((a, b) => {
      const pa = parseFloat(a.price.replace(/[^0-9.]/g, '')) || Infinity;
      const pb = parseFloat(b.price.replace(/[^0-9.]/g, '')) || Infinity;
      return pa - pb;
    });

    // Clear and build cards
    resultsEl.innerHTML = '';
    for (let it of items) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${it.image || ''}"
             onerror="this.src='https://via.placeholder.com/220x180?text=No+Image'">
        <div class="card-content">
          <h2>${it.title}</h2>
          <div class="price">${it.price}</div>
          <a href="${it.url}" target="_blank">View on Amazon</a>
        </div>`;
      resultsEl.appendChild(card);
    }

  } catch (err) {
    console.error(err);
    renderMessage('Error fetching from Apify.', 'error');
  }
});
