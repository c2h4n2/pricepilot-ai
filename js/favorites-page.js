let products = [];

async function loadFavoritesPage() {
  getById("year").textContent = new Date().getFullYear();

  const response = await fetch("data/laptops.json");
  products = await response.json();

  const favoriteIds = getFavorites();
  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  const grid = getById("favoritesGrid");
  const empty = getById("favoritesEmpty");

  empty.classList.toggle("hidden", favoriteProducts.length > 0);

  grid.innerHTML = favoriteProducts
    .map(
      (p) => `
        <article class="card product-card">
          <div class="product-image">
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <span class="image-badge">${p.badge}</span>
          </div>

          <h3>${p.name}</h3>
          <p>${p.summary}</p>

          <div class="price">${money(p.price)}</div>

          <div class="spec-chips">
            <span>${p.ram}</span>
            <span>${p.storage}</span>
            <span>${p.processor}</span>
          </div>

          <a class="buy" href="product.html?id=${p.id}">View details</a>
        </article>
      `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", loadFavoritesPage);
