// === CONFIGURE YOUR RAPIDAPI KEYS HERE ===
const API_KEYS = {
  amazon:   { host: 'real-time-amazon-data.p.rapidapi.com',    key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' },
  flipkart: { host: 'real-time-flipkart-data2.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' }
};

let allProducts = [];
let currentPage = 1;
const RESULTS_PER_PAGE = 12;

// Loader
const loader = document.getElementById('loader');
function showLoader() { loader.style.display = 'flex'; }
function hideLoader() { loader.style.display = 'none'; }
window.addEventListener('load', hideLoader);

// Dark Mode
const toggle = document.getElementById('darkModeToggle');
if (localStorage.darkMode === 'true') document.body.classList.add('dark');
toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  toggle.textContent = dark ? '☀️' : '🌙';
  localStorage.darkMode = dark;
});

// Fetch helper (Amazon & Flipkart)
// Fetch helper (Amazon & Flipkart)
async function fetchPlatform(platform, query, country) {
  const { host, key } = API_KEYS[platform];
  const url = `https://${host}/search?query=${encodeURIComponent(query)}&country=${country}`;
  try {
    const res  = await fetch(url, { headers: { 'x-rapidapi-host': host, 'x-rapidapi-key': key } });
    const json = await res.json();
    const items = json.data?.products || [];

    return items.map(p => {
      // pick the brand field depending on platform
      let brand = '';
      if (platform === 'flipkart') {
        // Flipkart often nests details in productBaseInfoV1
        brand = p.productBaseInfoV1?.productBrand 
             || p.productBaseInfoV1?.productTitle 
             || '';
      } else {
        // Amazon & others
        brand = p.product_brand || p.brand || '';
      }

      return {
        title:    p.product_title || p.title,
        price:    p.product_price || p.price?.raw || 'N/A',
        image:    p.product_photo  || p.thumbnail  || '',
        url:      p.product_url    || p.url        || '#',
        brand:    brand
      };
    });
  } catch (e) {
    console.error(`Error ${platform}:`, e);
    return [];
  }
}

// Main search
async function searchProducts() {
  const q       = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;
  if (!q) return alert('Enter a product name');

  showLoader();
  document.getElementById('results').innerHTML = `<p>🔄 Searching "${q}"...<\/p>`;
  allProducts = [];
  currentPage = 1;

  const [amazon, flipkart] = await Promise.all([
    fetchPlatform('amazon', q, country),
    fetchPlatform('flipkart', q, country)
  ]);
  allProducts = [...amazon, ...flipkart];

  populateBrands();
  applyFiltersAndDisplay();
  updatePagination();
  hideLoader();
}

// Populate brands
function populateBrands() {
  const brands = [...new Set(allProducts.map(p => p.brand).filter(b => b))];
  document.getElementById('brand-list').innerHTML =
    brands.map(b => `<option value="${b}">`).join('');
}

// Filters + Sort + Paginate + Render
function applyFiltersAndDisplay() {
  let items = [...allProducts];
  const min   = parseFloat(document.getElementById('minPrice').value) || 0;
  const max   = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const sort  = document.getElementById('sortSelect').value;
  const brand = document.getElementById('brandFilter').value.toLowerCase();

  // Filter
  items = items.filter(p => {
    const priceNum = parseFloat((p.price || '').replace(/[^\d.]/g,'')) || 0;
    return priceNum >= min
        && priceNum <= max
        && (!brand || p.brand.toLowerCase().includes(brand));
  });

  // Sort
  if (sort === 'low')  items.sort((a,b) => parseFloat(a.price.replace(/[^\d.]/g,'')) - parseFloat(b.price.replace(/[^\d.]/g,'')));
  if (sort === 'high') items.sort((a,b) => parseFloat(b.price.replace(/[^\d.]/g,'')) - parseFloat(a.price.replace(/[^\d.]/g,'')));

  // Paginate
  const start = (currentPage - 1) * RESULTS_PER_PAGE;
  const pageItems = items.slice(start, start + RESULTS_PER_PAGE);

  displayResults(pageItems);
  updatePagination(items.length);
}

// Display product cards with discount badge
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
      <div class="card-img-wrapper">
        <img src="${p.image}" alt="${p.title}" />
        ${p.discount ? `<span class="discount-badge">-${p.discount}</span>` : ''}
      </div>
      <h4>${p.title}</h4>
      <p><strong>${p.price}</strong></p>
      <p>🏷️ ${p.brand || 'Unknown'}</p>
      <a href="${p.url}" target="_blank">View</a>
    `;
    container.appendChild(div);
  });
}

// Pagination controls (infinite style)
function updatePagination(totalItems = null) {
  const prev = document.getElementById('prevPage');
  const next = document.getElementById('nextPage');
  // Always allow next if there are more items
  const maxPage = totalItems
    ? Math.ceil(totalItems / RESULTS_PER_PAGE)
    : Infinity;

  prev.disabled = currentPage <= 1;
  next.disabled = currentPage >= maxPage;
  document.getElementById('pageIndicator').textContent = `Page ${currentPage}`;
}

function changePage(delta) {
  currentPage += delta;
  applyFiltersAndDisplay();
  updatePagination();
}

// Reapply on filter changes
['sortSelect','minPrice','maxPrice','brandFilter']
  .forEach(id => document.getElementById(id).addEventListener('input', () => {
    currentPage = 1;
    applyFiltersAndDisplay();
    updatePagination();
  }));
