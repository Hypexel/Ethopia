// === CONFIGURE YOUR RAPIDAPI KEYS HERE ===
const API_KEYS = {
  amazon:    { host: 'real-time-amazon-data.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' },
  flipkart:  { host: 'real-time-flipkart-data2.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' },
  ebay:      { host: 'ebay-data-scraper.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' },
  walmart:   { host: 'walmart-data.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' },
  myntra:    { host: 'myntra-product-search.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' }
};

let allProducts = [];

// Dark Mode Toggle
const toggle = document.getElementById('darkModeToggle');
if (localStorage.darkMode === 'true') document.body.classList.add('dark');
toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  toggle.textContent = dark ? '☀️' : '🌙';
  localStorage.darkMode = dark;
});

// Fetch helper
async function fetchPlatform(platform, query, country) {
  const { host, key } = API_KEYS[platform];
  const url = `https://${host}/search?query=${encodeURIComponent(query)}&country=${country}`;
  try {
    const res = await fetch(url, {
      headers: { 'x-rapidapi-host': host, 'x-rapidapi-key': key }
    });
    const json = await res.json();
    const items = json.data?.products || [];
    return items.map(p => ({
      title: p.product_title || p.title,
      price: p.product_price || p.price?.raw,
      image: p.product_photo || p.thumbnail,
      url:   p.product_url   || p.url,
      brand: p.product_brand || p.brand
    }));
  } catch (e) {
    console.error(`Error ${platform}:`, e);
    return [];
  }
}

// Main search: query all platforms in parallel
async function searchProducts() {
  const q       = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;
  if (!q) return alert('Enter product name');
  document.getElementById('results').innerHTML = `<p>🔄 Searching for "${q}"...</p>`;
  allProducts = [];

  const platforms = Object.keys(API_KEYS);
  const promises = platforms.map(p => fetchPlatform(p, q, country));
  const resultsArr = await Promise.all(promises);
  allProducts = resultsArr.flat();

  populateBrands();
  applyFiltersAndDisplay();
}

// Populate Brand datalist
function populateBrands() {
  const brands = [...new Set(allProducts.map(p => p.brand).filter(b => b))];
  const dl = document.getElementById('brand-list');
  dl.innerHTML = brands.map(b => `<option value="${b}">`).join('');
}

// Filter & sort, then render
function applyFiltersAndDisplay() {
  let items = [...allProducts];
  const min   = parseFloat(document.getElementById('minPrice').value) || 0;
  const max   = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const sort  = document.getElementById('sortSelect').value;
  const brand = document.getElementById('brandFilter').value.toLowerCase();

  items = items.filter(p => {
    const priceNum = parseFloat((p.price || '').replace(/[^\d.]/g,'')) || 0;
    return priceNum >= min 
        && priceNum <= max 
        && (!brand || (p.brand || '').toLowerCase().includes(brand));
  });

  if (sort === 'low')  items.sort((a,b)=>parseFloat(a.price.replace(/[^\d.]/g,'')) - parseFloat(b.price.replace(/[^\d.]/g,'')));
  if (sort === 'high') items.sort((a,b)=>parseFloat(b.price.replace(/[^\d.]/g,'')) - parseFloat(a.price.replace(/[^\d.]/g,'')));

  displayResults(items);
}

// Render cards
function displayResults(arr) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  if (!arr.length) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }
  arr.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h4>${p.title}</h4>
      <p><strong>${p.price}</strong></p>
      <p>🏷️ ${p.brand || 'Unknown'}</p>
      <a href="${p.url}" target="_blank">View</a>
    `;
    container.appendChild(div);
  });
}

// Reapply on filter changes
['sortSelect','minPrice','maxPrice','brandFilter']
  .forEach(id => document.getElementById(id).addEventListener('input', applyFiltersAndDisplay));
