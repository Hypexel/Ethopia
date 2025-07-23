const apiKey = 'aba9aeaf40msh620d3e13e35549cp1b2374jsna12c88960a1e';
const apiHost = 'real-time-amazon-data.p.rapidapi.com';

async function fetchInfluencerProducts() {
  const influencerName = document.getElementById('influencerInput').value.trim();
  if (!influencerName) return alert("Please enter an influencer name.");

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    const url = `https://${apiHost}/influencer-profile?influencer_name=${influencerName}&country=US`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': apiHost
      }
    });

    const data = await response.json();
    const products = data?.data?.products || [];

    displayProducts(products);
  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "<p>Error fetching products. Check console.</p>";
  }
}

function displayProducts(products) {
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
