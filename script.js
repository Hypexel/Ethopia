const API_KEY = "YOUR_RAPIDAPI_KEY";
const headersTemplate = {
  "x-rapidapi-key": API_KEY,
  "x-rapidapi-host": ""
};

const sources = [
  {
    name: 'Amazon',
    host: 'pricejson-amazon.p.rapidapi.com',
    url: q => `https://pricejson-amazon.p.rapidapi.com/pricejson/search?q=${encodeURIComponent(q)}&category=all`,
    parser: data => data.products.map(p => ({
      title: p.title,
      price: parseFloat(p.price.replace(/[^0-9\.]/g, '')) || Infinity,
      image: p.image,
      link: p.link
    }))
  },
  {
    name: 'Flipkart',
    host: 'flipkart-store.p.rapidapi.com',
    url: q => `https://flipkart-store.p.rapidapi.com/search?query=${encodeURIComponent(q)}`,
    parser: data => data.products.map(p => ({
      title: p.title,
      price: parseFloat(p.price.replace(/[^0-9\.]/g, '')) || Infinity,
      image: p.image,
      link: p.link
    }))
  },
  {
    name: 'eBay',
    host: 'ebay-com.p.rapidapi.com',
    url: q => `https://ebay-com.p.rapidapi.com/search?query=${encodeURIComponent(q)}`,
    parser: data => data.searchResult.map(p => ({
      title: p.title,
      price: parseFloat(p.price.value) || Infinity,
      image: p.image.imageUrl,
      link: p.itemWebUrl
    }))
  }
];

const form = document.getElementById('search-form');
const resultsDiv = document.getElementById('results');
const spinner = document.getElementById('spinner');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const query = document.getElementById('query').value.trim();
  if (!query) return;
  resultsDiv.innerHTML = '';
  spinner.classList.remove('hidden');

  try {
    // fetch all sources in parallel
    const allPromises = sources.map(s => {
      headersTemplate["x-rapidapi-host"] = s.host;
      return fetch(s.url(query), { headers: headersTemplate })
        .then(r => r.json())
        .then(json => s.parser(json))
        .catch(() => []);
    });
    const resultsArrays = await Promise.all(allPromises);
    let merged = resultsArrays.flat();
    // sort by price ascending
    merged.sort((a, b) => a.price - b.price);

    // render results
    if (!merged.length) {
      resultsDiv.innerHTML = `<p>No products found.</p>`;
    } else {
      for (let item of merged) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <img src="${item.image}" onerror="this.src='https://via.placeholder.com/200x180?text=No+Image'">
          <div class="card-content">
            <h2>${item.title}</h2>
            <div class="price">₹${item.price.toLocaleString()}</div>
            <div class="source">${item.link.includes('amazon')?'Amazon':item.link.includes('flipkart')?'Flipkart':'eBay'}</div>
            <a href="${item.link}" target="_blank">View</a>
          </div>`;
        resultsDiv.appendChild(card);
      }
    }
  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = `<p>Error fetching results. Check console.</p>`;
  } finally {
    spinner.classList.add('hidden');
  }
});
