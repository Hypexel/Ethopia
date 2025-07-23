// === CONFIGURE YOUR RAPIDAPI KEYS HERE ===
const API_KEYS = {
  amazon:   { host: 'real-time-amazon-data.p.rapidapi.com',    key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' },
  flipkart: { host: 'real-time-flipkart-data2.p.rapidapi.com', key: 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e' }
};

let allProducts = [];
let currentPage = 1;

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

// Fetch one page from a given platform
async function fetchPlatformPage(platform, query, country, page = 1) {
  const { host, key } = API_KEYS[platform];
  const url = platform === 'flipkart'
    ? `https://${host}/search?query=${encodeURIComponent(query)}&pincode=400001&page=${page}`
    : `https://${host}/search?query=${encodeURIComponent(query)}&country=${country}&page=${page}`;
  try {
    const res = await fetch(url, { headers: { 'x-rapidapi-host': host, 'x-rapidapi-key': key } });
    const json = await res.json();
    const items = json.data?.products || [];
    return items.map(p => {
      // Brand
      let brand = '';
      if (platform === 'flipkart') {
        brand = p.productBaseInfoV1?.productBrand || '';
      } else {
        brand = p.product_brand || p.brand || '';
      }
      // Discount
      let discount = '';
      if (platform === 'flipkart') {
        const info = p.productBaseInfoV1;
        if (info?.maximumRetailPrice?.amount && info?.flipkartSpecialPrice?.amount) {
          const mrp = info.maximumRetailPrice.amount,
                sp  = info.flipkartSpecialPrice.amount;
          discount = `-${Math.round((mrp - sp)/mrp*100)}%`;
        }
      } else {
        discount = p.price?.savings?.percentage
          ? `-${p.price.savings.percentage}%`
          : '';
      }
      return {
        title:    p.product_title    || p.title,
        price:    p.product_price    || p.price?.raw   || 'N/A',
        image:    p.product_photo    || p.thumbnail     || '',
        url:      p.product_url      || p.url           || '#',
        brand:    brand,
        discount: discount
      };
    });
  } catch (e) {
    console.error(`Error ${platform} page ${page}:`, e);
    return [];
  }
}

// Load and merge one page from both platforms
async function loadPage(page) {
  const q       = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;
  if (!q) return alert('Enter a product name');

  showLoader();
  document.getElementById('results').innerHTML = `<p>🔄 Loading page ${page}…</p>`;

  const [amz, flp] = await Promise.all([
    fetchPlatformPage('amazon',   q, country, page),
    fetchPlatformPage('flipkart', q, country, page)
  ]);

  // Interleave results
  const merged = [];
  const maxLen = Math.max(amz.length, flp.length);
  for (let i = 0; i < maxLen; i++) {
    if (amz[i]) merged.push(amz[i]);
    if (flp[i]) merged.push(flp[i]);
  }

  allProducts = merged;
  populateBrands();
  applyFiltersAndDisplay();
  updatePagination();
  hideLoader();
}

// Initial search
function searchProducts() {
  currentPage = 1;
  loadPage(1);
}

// Change page
function changePage(delta) {
  currentPage = Math.max(1, currentPage + delta);
  loadPage(currentPage);
}

// Populate brand datalist
function populateBrands() {
  const brands = [...new Set(allProducts.map(p => p.brand).filter(b=>b))];
  document.getElementById('brand-list').innerHTML =
    brands.map(b=>`<option value="${b}">`).join('');
}

// Filter, sort, render
function applyFiltersAndDisplay() {
  let items = [...allProducts];
  const min   = parseFloat(document.getElementById('minPrice').value)||0;
  const max   = parseFloat(document.getElementById('maxPrice').value)||Infinity;
  const sort  = document.getElementById('sortSelect').value;
  const brand = document.getElementById('brandFilter').value.toLowerCase();

  items = items.filter(p=>{
    const priceNum = parseFloat((p.price||'').replace(/[^\d.]/g,''))||0;
    return priceNum>=min && priceNum<=max &&
      (!brand||p.brand.toLowerCase().includes(brand));
  });

  if(sort==='low')
    items.sort((a,b)=>parseFloat(a.price.replace(/[^\d.]/g,''))-parseFloat(b.price.replace(/[^\d.]/g,'')));
  if(sort==='high')
    items.sort((a,b)=>parseFloat(b.price.replace(/[^\d.]/g,''))-parseFloat(a.price.replace(/[^\d.]/g,'')));

  displayResults(items);
}

// Render cards
function displayResults(arr) {
  const container = document.getElementById('results');
  container.innerHTML = arr.length
    ? arr.map(p=>`
      <div class="card">
        <div class="card-img-wrapper">
          <img src="${p.image}" alt="${p.title}" />
          ${p.discount?`<span class="discount-badge">${p.discount}</span>`:''}
        </div>
        <h4>${p.title}</h4>
        <div class="brand-label">${p.brand}</div>
        <p class="price">${p.price}</p>
        <a href="${p.url}" target="_blank">View</a>
      </div>
    `).join('')
    : '<p>No results found.</p>';
}

const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight) backBtn.classList.add('show');
  else backBtn.classList.remove('show');
});


// Update Prev/Next
function updatePagination() {
  document.getElementById('prevPage').disabled = currentPage<=1;
  document.getElementById('pageIndicator').textContent = `Page ${currentPage}`;
}

// Re-run filters on input change
['sortSelect','minPrice','maxPrice','brandFilter']
  .forEach(id=>
    document.getElementById(id)
      .addEventListener('input',applyFiltersAndDisplay)
  );
