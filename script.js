// Direct RapidAPI integration for Amazon
const API_URL = 'https://pricejson-amazon.p.rapidapi.com/pricejson/search';
const API_KEY = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e';
const API_HOST = 'pricejson-amazon.p.rapidapi.com';

// Fetch results from Amazon
async function fetchResults(query) {
  const url = `${API_URL}?q=${encodeURIComponent(query)}&category=all`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });
    if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
    const data = await res.json();
    // data format: array of items
    return data.map(item => ({
      title: item.title,
      price: parseFloat(item.price.replace(/[^0-9\.]/g, '')) || 0,
      image: item.image,
      link: item.link,
      source: 'Amazon'
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Render results to DOM
function renderResults(items) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }
  items.sort((a, b) => a.price - b.price);
  items.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('result-item');
    div.innerHTML = `
      <img src="${item.image || ''}" alt="${item.title}">
      <div class="result-info">
        <a href="${item.link}" target="_blank">${item.title}</a>
        <div class="price">₹${item.price.toLocaleString()}</div>
        <div class="source">Source: ${item.source}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

// UI Events
const searchBtn = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
searchBtn.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return;
  const items = await fetchResults(q);
  renderResults(items);
});
searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') searchBtn.click();
});
