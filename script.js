const RAPIDAPI_KEY = "your_rapidapi_key_here"; // Replace with your key

async function searchProducts() {
  const query = document.getElementById("search").value.trim();
  if (!query) return;

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "🔍 Searching...";

  try {
    const [amazonData, ebayData] = await Promise.all([
      fetchAmazon(query),
      fetchEbay(query),
    ]);

    const merged = mergeAndSort([...amazonData, ...ebayData]);

    if (merged.length === 0) {
      resultsContainer.innerHTML = "No products found.";
      return;
    }

    resultsContainer.innerHTML = merged.map(renderCard).join("");
  } catch (err) {
    console.error(err);
    resultsContainer.innerHTML = "❌ Error fetching results.";
  }
}

async function fetchAmazon(query) {
  const res = await fetch(`https://amazon23.p.rapidapi.com/product-search?query=${query}&page=1&country=IN`, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": "amazon23.p.rapidapi.com"
    }
  });
  const json = await res.json();
  return (json?.result || []).map(item => ({
    id: item.asin,
    title: item.title,
    price: parseFloat(item.price?.raw?.replace(/[^0-9.]/g, '') || 0),
    rating: item.rating || 0,
    image: item.thumbnail,
    url: item.url
  }));
}

async function fetchEbay(query) {
  const res = await fetch(`https://ebay-data-scraper.p.rapidapi.com/search/${query}`, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": "ebay-data-scraper.p.rapidapi.com"
    }
  });
  const json = await res.json();
  return (json?.data || []).map(item => ({
    id: item.id,
    title: item.title,
    price: parseFloat(item.price?.replace(/[^0-9.]/g, '') || 0),
    rating: item.rating || 0,
    image: item.image,
    url: item.url
  }));
}

function mergeAndSort(products) {
  const unique = new Map();
  products.forEach(p => {
    if (p.title && p.price > 0 && !unique.has(p.title)) {
      unique.set(p.title, p);
    }
  });
  return Array.from(unique.values()).sort((a, b) => a.price - b.price);
}

function renderCard(item) {
  return `
    <div class="card">
      <img src="${item.image}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>₹${item.price}</p>
      <p>⭐ ${item.rating || "No rating"}</p>
      <a href="${item.url}" target="_blank">
        <button>View</button>
      </a>
      <button onclick="saveToFavorites('${item.id}', '${item.title}')">❤️</button>
    </div>
  `;
}

function saveToFavorites(id, title) {
  let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favs.find(f => f.id === id)) {
    favs.push({ id, title });
    localStorage.setItem("favorites", JSON.stringify(favs));
    alert(`Added "${title}" to favorites.`);
  } else {
    alert(`"${title}" is already in favorites.`);
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
