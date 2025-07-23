const apiKey = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e';
const apiHost = 'real-time-flipkart-data2.p.rapidapi.com';
let originalProducts = [];

// DARK MODE TOGGLE
const toggleBtn = document.getElementById('darkModeToggle');
const isDark = localStorage.getItem('darkMode') === 'true';
if (isDark) document.body.classList.add('dark');
toggleBtn.textContent = isDark ? '☀️' : '🌙';

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const nowDark = document.body.classList.contains('dark');
  toggleBtn.textContent = nowDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', nowDark);
});

// SEARCH & FILTER LOGIC
async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;
  const resultsDiv = document.getElementById('results');
  const brandSelect = document.getElementById('brandSelect');

  if (!query) return alert("Enter a product name");

  resultsDiv.innerHTML = `<p>🔄 Searching for "${query}" in ${country}...</p>`;
  brandSelect.innerHTML = `<option value="">All</option>`;

  try {
    const url = `https://${apiHost}/search?query=${encodeURIComponent(query)}&country=${country}`;
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      }
    });
    const data = await response.json();
    originalProducts = data?.data?.products || [];

    populateBrands(originalProducts);
    applyFiltersAndDisplay();
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p>❌ Error fetching results.</p>`;
  }
}

function populateBrands(products) {
  const brandSet = new Set();
  products.forEach(p => p.product_brand && brandSet.add(p.product_brand));
  const brandSelect = document.getElementById('brandSelect');
  brandSet.forEach(brand => {
    const opt = document.createElement('option');
    opt.value = brand;
    opt.textContent = brand;
    brandSelect.appendChild(opt);
  });
}

function applyFiltersAndDisplay() {
  let products = [...originalProducts];
  const min = parseFloat(document.getElementById('minPrice').value) || 0;
  const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const sort = document.getElementById('sortSelect').value;
  const brand = document.getElementById('brandSelect').value;

  products = products.filter(p => {
    const price = parseFloat((p.product_price || '').replace(/[^\d.]/g, '')) || 0;
    return price >= min && price <= max &&
      (!brand || p.product_brand === brand);
  });

  products.sort((a, b) => {
    const priceA = parseFloat((a.product_price || '').replace(/[^\d.]/g, '')) || 0;
    const priceB = parseFloat((b.product_price || '').replace(/[^\d.]/g, '')) || 0;
    if (sort === 'low') return priceA - priceB;
    if (sort === 'high') return priceB - priceA;
    return 0;
  });

  displayResults(products);
}

function displayResults(products) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  if (!products.length) {
    resultsDiv.innerHTML = `<p>No products found for selected filters.</p>`;
    return;
  }
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.product_photo}" alt="Product image">
      <h4>${p.product_title}</h4>
      <p><strong>${p.product_price || 'N/A'}</strong></p>
      <p>🧵 ${p.product_brand || 'Unknown'}</p>
      <a href="${p.product_url}" target="_blank">🔗 View on Amazon</a>
    `;
    resultsDiv.appendChild(card);
  });
}

// Re-filter when filters change
['sortSelect','minPrice','maxPrice','brandSelect'].forEach(id => {
  document.getElementById(id).addEventListener('change', applyFiltersAndDisplay);
});
