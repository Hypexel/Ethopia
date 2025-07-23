const apiKey = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e';
const apiHost = 'real-time-amazon-data.p.rapidapi.com';
let originalProducts = [];

async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;
  const resultsDiv = document.getElementById('results');
  const brandSelect = document.getElementById('brandSelect');

  if (!query) {
    alert("Enter a product name");
    return;
  }

  resultsDiv.innerHTML = `<p>🔄 Searching for "${query}" in ${country}...</p>`;
  brandSelect.innerHTML = `<option value="">All</option>`;

  try {
    const url = `https://${apiHost}/search?query=${encodeURIComponent(query)}&country=${country}`;
    const response = await fetch(url, {
      method: 'GET',
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
  products.forEach(p => {
    if (p.product_brand) brandSet.add(p.product_brand);
  });

  const brandSelect = document.getElementById('brandSelect');
  brandSet.forEach(brand => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
}

function applyFiltersAndDisplay() {
  let products = [...originalProducts];
  const min = parseFloat(document.getElementById('minPrice').value) || 0;
  const max = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const sort = document.getElementById('sortSelect').value;
  const brand = document.getElementById('brandSelect').value;

  // Filter by price
  products = products.filter(p => {
    const price = parseFloat((p.product_price || '').replace(/[^\d.]/g, ''));
    return !isNaN(price) && price >= min && price <= max;
  });

  // Filter by brand
  if (brand) {
    products = products.filter(p => p.product_brand === brand);
  }

  // Sort
  products.sort((a, b) => {
    const priceA = parseFloat((a.product_price || '').replace(/[^\d.]/g, ''));
    const priceB = parseFloat((b.product_price || '').replace(/[^\d.]/g, ''));

    if (sort === "low") return priceA - priceB;
    if (sort === "high") return priceB - priceA;
    return 0;
  });

  displayResults(products);
}

function displayResults(products) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "";

  if (products.length === 0) {
    resultsDiv.innerHTML = "<p>No products found for selected filters.</p>";
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
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

// Re-filter when filter inputs change
document.getElementById("sortSelect").addEventListener("change", applyFiltersAndDisplay);
document.getElementById("minPrice").addEventListener("input", applyFiltersAndDisplay);
document.getElementById("maxPrice").addEventListener("input", applyFiltersAndDisplay);
document.getElementById("brandSelect").addEventListener("change", applyFiltersAndDisplay);
