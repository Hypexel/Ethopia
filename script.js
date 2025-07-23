const API_KEY = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e';
const API_HOST = 'real-time-amazon-data.p.rapidapi.com';

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadLanguage();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('language-selector').addEventListener('change', changeLanguage);
  document.getElementById('search-bar').addEventListener('input', showSuggestions);
});

function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('dark-mode', document.body.classList.contains('dark'));
}

function loadTheme() {
  if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark');
  }
}

function changeLanguage() {
  const lang = document.getElementById('language-selector').value;
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (data[key]) el.textContent = data[key];
      });
    });
}

function showSuggestions() {
  const query = document.getElementById('search-bar').value;
  if (query.length < 3) return;

  // Dummy local suggestions for now (real suggestion API can be added)
  const suggestions = ['Laptop', 'iPhone', 'Keyboard', 'Headphones'].filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  const suggestionsBox = document.getElementById('suggestions');
  suggestionsBox.innerHTML = '';
  suggestions.forEach(s => {
    const div = document.createElement('div');
    div.textContent = s;
    div.onclick = () => {
      document.getElementById('search-bar').value = s;
      suggestionsBox.innerHTML = '';
    };
    suggestionsBox.appendChild(div);
  });
}

async function searchProducts() {
  const query = document.getElementById('search-bar').value;
  const country = document.getElementById('country-selector').value;
  const brand = document.getElementById('brand-filter').value.toLowerCase();
  const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
  const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
  const sort = document.getElementById('sort-by').value;

  const url = `https://${API_HOST}/search?query=${encodeURIComponent(query)}&country=${country}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY
    }
  });

  const data = await res.json();
  let products = data.data || [];

  // Filter
  products = products.filter(p => {
    const price = parseFloat(p.price?.raw?.replace(/[^\d.]/g, '')) || 0;
    return (!brand || p.title.toLowerCase().includes(brand)) &&
           price >= minPrice &&
           price <= maxPrice;
  });

  // Sort
  if (sort === 'price-asc') products.sort((a, b) => parseFloat(a.price.raw.replace(/[^\d.]/g, '')) - parseFloat(b.price.raw.replace(/[^\d.]/g, '')));
  if (sort === 'price-desc') products.sort((a, b) => parseFloat(b.price.raw.replace(/[^\d.]/g, '')) - parseFloat(a.price.raw.replace(/[^\d.]/g, '')));

  displayProducts(products);
}

function displayProducts(products) {
  const results = document.getElementById('results');
  results.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <img src="${product.thumbnail}" width="100%">
      <h4>${product.title}</h4>
      <p>${product.price?.raw || 'N/A'}</p>
      <a href="${product.url}" target="_blank">View</a>
    `;
    results.appendChild(div);
  });
}
