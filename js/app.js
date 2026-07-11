let products = [];
let currentFilter = "all";
let currentTypeFilter = "all";
let selectedCompareIds = [];

function getHighlights(product) {
  return product.highlights || [];
}

function productText(p) {
  return `
    ${p.name}
    ${p.brand}
    ${p.type}
    ${p.category}
    ${p.bestFor}
    ${p.price}
    ${getHighlights(p).join(" ")}
  `.toLowerCase();
}

function getFiltered() {
  const q = (getById("searchInput")?.value || "")
    .toLowerCase()
    .trim();

  let list = products.filter((p) => {
    const matchesType =
      currentTypeFilter === "all" ||
      p.type === currentTypeFilter;

    const matchesCategory =
      currentFilter === "all" ||
      p.category === currentFilter;

    return matchesType && matchesCategory;
  });

  if (q) {
    const under = q.match(/under\s*\$?(\d+)/);

    if (under) {
      list = list.filter(
        (p) => p.price <= Number(under[1])
      );
    } else {
      list = list.filter((p) =>
        productText(p).includes(q)
      );
    }
  }

  const sort = getById("sortSelect")?.value || "score";

  return list.sort((a, b) => {
    if (sort === "priceLow") return a.price - b.price;
    if (sort === "priceHigh") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;

    return b.score - a.score;
  });
}

function renderTopPick() {
  const list = getFiltered();

  const top =
    [...list].sort((a, b) => b.score - a.score)[0] ||
    [...products].sort((a, b) => b.score - a.score)[0];

  if (!top) return;

  const topHighlights =
    top.highlights?.slice(0, 2).join(" and ") ||
    "strong value and rating";

  const topPickName = getById("topPickName");
  const topPickSummary = getById("topPickSummary");
  const topPickScore = getById("topPickScore");
  const topPickLink = getById("topPickLink");

  if (topPickName) {
    topPickName.textContent = top.name;
  }

  if (topPickSummary) {
    topPickSummary.textContent =
      `${top.summary} It stands out for ${topHighlights}.`;
  }

  if (topPickScore) {
    topPickScore.textContent =
      `${top.score}/100 value score • ${money(top.price)}`;
  }

  if (topPickLink) {
    topPickLink.href = `product.html?id=${top.id}`;
  }
}

function render() {
  const list = getFiltered();

  const productCount = getById("productCount");
  const categoryCount = getById("categoryCount");
  const emptyState = getById("emptyState");

  if (productCount) {
    productCount.textContent = list.length;
  }

  if (categoryCount) {
    const totalCategories = new Set(
      products.map((p) => p.type)
    ).size;

    categoryCount.textContent = totalCategories;
  }

  renderProductCards(list);
  renderCompareTable();
  renderTopPick();

  if (emptyState) {
    emptyState.classList.toggle(
      "hidden",
      list.length > 0
    );
  }
}

function resetFilters() {
  currentFilter = "all";
  currentTypeFilter = "all";

  const typeSelect = getById("typeSelect");
  const sortSelect = getById("sortSelect");

  if (typeSelect) {
    typeSelect.value = "all";
  }

  if (sortSelect) {
    sortSelect.value = "score";
  }
}

function init() {
  const year = getById("year");
  const searchInput = getById("searchInput");
  const sortSelect = getById("sortSelect");
  const clearCompareBtn = getById("clearCompareBtn");
  const clearBtn = getById("clearBtn");
  const typeSelect = getById("typeSelect");
  const advisorBtn = getById("advisorBtn");
  const advisorInput = getById("advisorInput");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", render);
  }

  if (clearCompareBtn) {
    clearCompareBtn.addEventListener(
      "click",
      clearCompare
    );
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      currentTypeFilter = typeSelect.value;
      render();
    });
  }

  if (advisorBtn) {
    advisorBtn.addEventListener(
      "click",
      runAdvisor
    );
  }

  if (advisorInput) {
    advisorInput.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          runAdvisor();
        }
      }
    );
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      resetFilters();
      render();
    });
  }

  render();
}

function showLoadingSkeleton() {
  const grid = getById("productGrid");

  if (!grid) return;

  grid.innerHTML = Array.from({ length: 8 })
    .map(
      () => `
        <article class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
          <div class="skeleton skeleton-button"></div>
        </article>
      `
    )
    .join("");
}

async function loadProducts() {
  showLoadingSkeleton();

  try {
    const cacheBuster = Date.now();

    const response = await fetch(
      `data/products.json?v=${cacheBuster}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        "Product data could not be loaded."
      );
    }

    products = await response.json();

    init();
  } catch (error) {
    console.error(
      "Could not load product data:",
      error
    );

    const grid = getById("productGrid");

    if (grid) {
      grid.innerHTML = `
        <p class="empty">
          Could not load product data.
          Please try again later.
        </p>
      `;
    }
  }
}

document.addEventListener(
  "DOMContentLoaded",
  loadProducts
);