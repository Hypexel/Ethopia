const apiKey = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e'; // Replace with your real API key
const apiHost = 'real-time-amazon-data.p.rapidapi.com';

async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  const country = document.getElementById('countrySelect').value;

  if (!query) return alert("Enter a product name");

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "<p>Loading...</p>";

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
  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "<p>Error loading results.</p>";
  }
}

function displayResults(products) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "";

  if (products.length === 0) {
    resultsDiv.innerHTML = "<p>No products found.</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${product.product_photo}" alt="${product.product_title}" />
      <h4>${product.product_title}</h4>
      <p><strong>Price:</strong> ${product.product_price || 'N/A'}</p>
      <a href="${product.product_url}" target="_blank">View on Amazon</a>
    `;

    resultsDiv.appendChild(card);
  });
}
