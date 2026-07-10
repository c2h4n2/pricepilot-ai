function getTypeLabel(product) {
  const labels = {
    laptop: "Laptop",
    monitor: "Monitor",
    keyboard: "Keyboard",
    mouse: "Mouse",
    headphones: "Headphones",
    tablet: "Tablet",
    smartwatch: "Smartwatch",
    tv: "TV",
    ssd: "SSD",
    router: "Router",
    camera: "Camera",
    printer: "Printer"
  };

  return labels[product.type] || "Product";
}

function getTypeIcon(product) {
  const icons = {
    laptop: "💻",
    monitor: "🖥️",
    keyboard: "⌨️",
    mouse: "🖱️",
    headphones: "🎧",
    tablet: "📱",
    smartwatch: "⌚",
    tv: "📺",
    ssd: "💾",
    router: "📡",
    camera: "📷",
    printer: "🖨️"
  };

  return icons[product.type] || "📦";
}

function getSpecChips(product) {
  return (product.highlights || [])
    .map((highlight) => `<span>${highlight}</span>`)
    .join("");
}

function getSmartBadge(product) {
  const score = Number(product.score) || 0;

  if (score >= 97) return "🏆 Best Overall";
  if (product.category === "budget") return "💰 Best Budget";
  if (product.category === "student") return "🎓 Student Pick";
  if (product.category === "gaming") return "🎮 Gaming Pick";
  if (product.category === "creator") return "🎨 Creator Pick";
  if (product.category === "business") return "💼 Business Pick";
  if (score >= 94) return "⭐ Editor's Choice";

  return product.badge || "Recommended";
}

function renderProductCards(list) {
  const firstCompared = selectedCompareIds.length
    ? products.find((product) => product.id === selectedCompareIds[0])
    : null;

  getById("productGrid").innerHTML = list
    .map((p, index) => {
      const isSelected = selectedCompareIds.includes(p.id);
      const favorite = isFavorite(p.id);
      const image = p.image || "assets/images/placeholder.svg";
      const compareLocked =
        firstCompared &&
        firstCompared.type !== p.type &&
        !isSelected;

      return `
        <article
          class="card product-card"
          style="animation-delay: ${index * 70}ms"
        >
          <div class="product-image">
            <img
              src="${image}"
              alt="${p.name}"
              loading="lazy"
              onerror="this.src='assets/images/placeholder.svg'"
            >
            <span class="image-badge">${getSmartBadge(p)}</span>
          </div>

          <div class="card-topline">
            <span class="brand-pill">${p.brand}</span>
            <span class="score-pill">${p.score}/100</span>
          </div>

          <p class="product-type">${getTypeIcon(p)} ${getTypeLabel(p)}</p>

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
            ${getSpecChips(p)}
          </div>

          <div class="card-actions">
            <div class="card-action-row">
              <button
                class="favorite-btn ${favorite ? "selected" : ""}"
                data-id="${p.id}"
                type="button"
                aria-label="${favorite ? `Remove ${p.name} from favorites` : `Save ${p.name} to favorites`}"
              >
                ${favorite ? "♥ Saved" : "♡ Save"}
              </button>

              <button
                class="compare-btn ${isSelected ? "selected" : ""} ${compareLocked ? "locked" : ""}"
                data-id="${p.id}"
                type="button"
                ${compareLocked ? "disabled" : ""}
                aria-label="${
                  isSelected
                    ? `Remove ${p.name} from comparison`
                    : compareLocked
                      ? `${p.name} cannot be compared with the currently selected product type`
                      : `Add ${p.name} to comparison`
                }"
              >
                ${
                  isSelected
                    ? "Selected ✓"
                    : compareLocked
                      ? "🔒 Unavailable"
                      : "Compare"
                }
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

  document
    .querySelectorAll(".compare-btn:not(:disabled)")
    .forEach((button) => {
      button.addEventListener("click", () => {
        toggleCompare(button.dataset.id);
      });
    });

  document.querySelectorAll(".favorite-btn").forEach((button) => {
    button.addEventListener("click", () => {
      toggleFavorite(button.dataset.id);
    });
  });
}