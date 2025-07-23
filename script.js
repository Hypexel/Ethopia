async function search() {
  const query = document.getElementById("search").value;

  // Example API call (from RapidAPI or similar)
  const amazon = await fetch(`https://example.com/amazon?q=${query}`, { headers: { "X-RapidAPI-Key": "your_key" } });
  const ebay = await fetch(`https://example.com/ebay?q=${query}`, { headers: { "X-RapidAPI-Key": "your_key" } });

  const amazonData = await amazon.json();
  const ebayData = await ebay.json();

  renderResults(mergeAndSort(amazonData, ebayData));
}

function mergeAndSort(a, b) {
  return [...a, ...b].sort((x, y) => x.price - y.price);
}

function renderResults(items) {
  const results = document.getElementById("results");
  results.innerHTML = items.map(item => `
    <div class="card">
      <img src="${item.image}" />
      <h3>${item.title}</h3>
      <p>Price: ₹${item.price}</p>
      <p>Rating: ${item.rating}</p>
      <button onclick="saveToFavorites('${item.id}')">❤️</button>
    </div>
  `).join('');
}

function saveToFavorites(id) {
  let favs = JSON.parse(localStorage.getItem("favs") || "[]");
  favs.push(id);
  localStorage.setItem("favs", JSON.stringify(favs));
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}
