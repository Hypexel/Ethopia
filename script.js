const apiKey = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e';
const apiHost = 'real-time-amazon-data.p.rapidapi.com';

async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;

  if (!query) {
    alert("Enter a product name");
    return;
  }

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<p>🔄 Searching for "${query}" in ${country}...</p>`;

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
    const products = data?.data?.products || [];

    displayResults(products);
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p>❌ Error fetching results.</p>`;
  }
}

function displayResults(products) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "";

  if (products.length === 0) {
    resultsDiv.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.product_photo}" alt="Product image">
      <h4>${p.product_title}</h4>
      <p><strong>${p.product_price || 'N/A'}</strong></p>
      <a href="${p.product_url}" target="_blank">🔗 View on Amazon</a>
    `;
    resultsDiv.appendChild(card);
  });
}
