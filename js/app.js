let products = [];

const $ = (id) => document.getElementById(id);

let currentFilter = "all";
let selectedCompareIds = [];

function money(n) {
  return "$" + Number(n).toLocaleString();
}

function stars(rating) {
  const fullStars = Math.round(Number(rating));
  return "★★★★★".slice(0, fullStars) + "☆☆☆☆☆".slice(0, 5 - fullStars);
}

function productText(p) {
  return `${p.name} ${p.brand} ${p.category} ${p.bestFor} ${p.price} ${p.ram} ${p.storage} ${p.processor}`.toLowerCase();
}

function getFiltered() {
  const q = ($("searchInput")?.value || "").toLowerCase().trim();

  let list = products.filter((p) => {
    return currentFilter === "all" || p.category === currentFilter;
  });

  if (q) {
    const under = q.match(/under\s*\$?(\d+)/);

    if (under) {
      list = list.filter((p) => p.price <= Number(under[1]));
    } else {
      list = list.filter((p) => productText(p).includes(q));
    }
  }

  const sort = $("sortSelect")?.value || "score";

  return list.sort((a, b) => {
    if (sort === "priceLow") return a.price - b.price;
    if (sort === "priceHigh") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.score - a.score;
  });
}

function toggleCompare(productId) {
  if (selectedCompareIds.includes(productId)) {
    selectedCompareIds = selectedCompareIds.filter((id) => id !== productId);
  } else {
    if (selectedCompareIds.length >= 4) {
      alert("You can compare up to 4 laptops at a time.");
      return;
    }

    selectedCompareIds.push(productId);
  }

  render();
}

function clearCompare() {
  selectedCompareIds = [];
  render();
}

function getSelectedProducts() {
  return products.filter((p) => selectedCompareIds.includes(p.id));
}

function renderProductCards(list) {
  $("productGrid").innerHTML = list
    .map((p) => {
      const isSelected = selectedCompareIds.includes(p.id);
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
            <button class="compare-btn ${isSelected ? "selected" : ""}" data-id="${p.id}">
              ${isSelected ? "Selected ✓" : "Compare"}
            </button>

            <a class="buy" href="product.html?id=${p.id}">View details</a>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".compare-btn").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCompare(button.dataset.id);
    });
  });
}

function renderCompareTable() {
  const selectedProducts = getSelectedProducts();

  if (selectedProducts.length === 0) {
    $("compareRows").innerHTML = `
      <tr>
        <td colspan="7">Select laptops above to compare them here.</td>
      </tr>
    `;
  } else {
    $("compareRows").innerHTML = selectedProducts
      .map(
        (p) => `
          <tr>
            <td>${p.name}</td>
            <td>${p.bestFor}</td>
            <td>${money(p.price)}</td>
            <td>${p.ram}</td>
            <td>${p.storage}</td>
            <td>${p.processor}</td>
            <td>${p.score}</td>
          </tr>
        `
      )
      .join("");
  }

  $("compareStatus").textContent =
    selectedProducts.length === 0
      ? "Select laptops to compare."
      : `${selectedProducts.length} laptop${selectedProducts.length > 1 ? "s" : ""} selected.`;
}

function renderTopPick() {
  const top = [...products].sort((a, b) => b.score - a.score)[0];

  if (top) {
    $("topPickName").textContent = top.name;
    $("topPickSummary").textContent = top.summary;
    $("topPickScore").textContent = `${top.score}/100 value score`;
  }
}

function render() {
  const list = getFiltered();

  $("productCount").textContent = products.length;

  renderProductCards(list);
  renderCompareTable();
  renderTopPick();

  $("emptyState").classList.toggle("hidden", list.length > 0);
}

function init() {
  $("year").textContent = new Date().getFullYear();

  $("searchInput").addEventListener("input", render);
  $("sortSelect").addEventListener("change", render);
  $("clearCompareBtn").addEventListener("click", clearCompare);

  $("clearBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    currentFilter = "all";

    document.querySelectorAll(".filters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === "all");
    });

    render();
  });

  document.querySelectorAll(".filters button").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      document.querySelectorAll(".filters button").forEach((b) => {
        b.classList.remove("active");
      });

      button.classList.add("active");
      render();
    });
  });

  render();
}

async function loadProducts() {
  try {
    const response = await fetch("data/laptops.json");

    if (!response.ok) {
      throw new Error("Laptop data could not be loaded.");
    }

    products = await response.json();
    init();
  } catch (error) {
    console.error("Could not load laptop data:", error);

    $("productGrid").innerHTML = `
      <p class="empty">Could not load product data. Please try again later.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);