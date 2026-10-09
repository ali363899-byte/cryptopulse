const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false";

let marketData = [];

const grid = document.getElementById("cryptoGrid");
const searchInput = document.getElementById("searchInput");
const refreshBtn = document.getElementById("refreshBtn");
const loader = document.getElementById("loader");
const errorBanner = document.getElementById("errorMessage");

async function fetchPrices() {
  loader.classList.remove("hidden");
  errorBanner.classList.add("hidden");

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("API rate limit or network issue");
    marketData = await res.json();
    renderCards(marketData);
  } catch (err) {
    errorBanner.textContent = "Could not fetch latest rates. Please wait a minute and retry.";
    errorBanner.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
}

function renderCards(coins) {
  grid.innerHTML = "";

  if (coins.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No matching assets found.</p>`;
    return;
  }

  coins.forEach((coin) => {
    const isUp = (coin.price_change_percentage_24h ?? 0) >= 0;
    const changeSymbol = isUp ? "▲ +" : "▼ ";
    const changeClass = isUp ? "positive" : "negative";

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-top">
        <div class="coin-info">
          <img src="${coin.image}" alt="${coin.name}" loading="lazy" />
          <div>
            <div class="coin-name">${coin.name}</div>
            <div class="coin-symbol">${coin.symbol}</div>
          </div>
        </div>
        <span class="rank">#${coin.market_cap_rank}</span>
      </div>
      <div class="price">$${coin.current_price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
      <div class="change ${changeClass}">
        ${changeSymbol}${(coin.price_change_percentage_24h ?? 0).toFixed(2)}% (24h)
      </div>
    `;
    grid.appendChild(card);
  });
}

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtered = marketData.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
  );
  renderCards(filtered);
});

refreshBtn.addEventListener("click", fetchPrices);

fetchPrices();