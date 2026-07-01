function renderProductCards(list) {
  getById("productGrid").innerHTML = list
    .map((p) => {
      const isSelected = selectedCompareIds.includes(p.id);
      const favorite = isFavorite(p.id);
      const image = p.image || "assets/images/laptops/placeholder.svg";

      return `
        <article class="card product-card">
          <div class="product-image">
            <img src="${image}" alt="${p.name}" loading="lazy">
            <span class="image-badge">${p.badge}</span>
          </div>

          <div class="card-topline">
            <span class="brand-pill">${p.brand}</span>
            <span class="score-pill">${p.score}/100</span>
          </div>

          <h3>${p.name}</h3>

          <div class="rating-row">
            <span class="stars">${stars(p.rating)}</span>
            <span>${p.rating}</span>
          </div>

          <p>${p.summary}</p>

          <div class="price-row">
            <div>
              <span class="price-label">From</span>
              <div class="price">${money(p.price)}</div>
            </div>
            <span class="category-pill">${p.bestFor}</span>
          </div>

          <div class="spec-chips">
            <span>${p.ram}</span>
            <span>${p.storage}</span>
            <span>${p.processor}</span>
          </div>

          <div class="card-actions">
            <div class="card-action-row">
              <button class="favorite-btn ${favorite ? "selected" : ""}" data-id="${p.id}">
                ${favorite ? "♥ Saved" : "♡ Save"}
              </button>

              <button class="compare-btn ${isSelected ? "selected" : ""}" data-id="${p.id}">
                ${isSelected ? "Selected ✓" : "Compare"}
              </button>
            </div>

            <a class="buy" href="product.html?id=${p.id}">
              View details
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".compare-btn").forEach((button) => {
    button.addEventListener("click", () => toggleCompare(button.dataset.id));
  });

  document.querySelectorAll(".favorite-btn").forEach((button) => {
    button.addEventListener("click", () => toggleFavorite(button.dataset.id));
  });
}