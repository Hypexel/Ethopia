const apiKey = 'YOUR_RAPIDAPI_KEY';
const apiHost = 'pricejson-amazon.p.rapidapi.com';

async function searchProducts() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) return alert("Enter a product name");

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch(`https://${apiHost}/pricejson/search?q=${encodeURIComponent(query)}&category=all`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      }
    });

    const data = await response.json();
    displayResults(data?.data || []);
  } catch (error) {
    resultsDiv.innerHTML = "<p>Error loading results.</p>";
    console.error(error);
  }
}

function displayResults(products) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "";

  if (products.length === 0) {
    resultsDiv.innerHTML = "<p>No products found.</p>";
    return;
  }

  // Sort by price (cheapest first)
  products.sort((a, b) => a.price - b.price);

  products.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}" />
      <h4>${item.title.slice(0, 60)}...</h4>
      <p><strong>₹${item.price}</strong></p>
      <a href="${item.url}" target="_blank">View Product</a>
    `;

    resultsDiv.appendChild(card);
  });
}
