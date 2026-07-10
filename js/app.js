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
  const q = (getById("searchInput")?.value || "").toLowerCase().trim();

  let list = products.filter((p) => {
    const matchesType = currentTypeFilter === "all" || p.type === currentTypeFilter;
    const matchesCategory = currentFilter === "all" || p.category === currentFilter;
    return matchesType && matchesCategory;
  });

  if (q) {
    const under = q.match(/under\s*\$?(\d+)/);

    if (under) {
      list = list.filter((p) => p.price <= Number(under[1]));
    } else {
      list = list.filter((p) => productText(p).includes(q));
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

  if (top) {
    const topHighlights =
      top.highlights?.slice(0, 2).join(" and ") ||
      "strong value and rating";

    getById("topPickName").textContent = top.name;

    getById("topPickSummary").textContent =
      `${top.summary} It stands out for ${topHighlights}.`;

    getById("topPickScore").textContent =
      `${top.score}/100 value score • ${money(top.price)}`;
  }
}
function render() {
  const list = getFiltered();

  getById("productCount").textContent = list.length;

  const categoryCount = new Set(products.map((p) => p.type)).size;
  getById("categoryCount").textContent = categoryCount;

  renderProductCards(list);
  renderCompareTable();
  renderTopPick();

  getById("emptyState").classList.toggle("hidden", list.length > 0);
}

function resetFilters() {
  currentFilter = "all";
  currentTypeFilter = "all";

  const typeSelect = getById("typeSelect");
  const sortSelect = getById("sortSelect");

  if (typeSelect) typeSelect.value = "all";
  if (sortSelect) sortSelect.value = "score";
}

function init() {
  getById("year").textContent = new Date().getFullYear();

  getById("searchInput").addEventListener("input", render);
  getById("sortSelect").addEventListener("change", render);
  getById("clearCompareBtn").addEventListener("click", clearCompare);

  const typeSelect = getById("typeSelect");

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      currentTypeFilter = typeSelect.value;
      render();
    });
  }

  const advisorBtn = getById("advisorBtn");
  const advisorInput = getById("advisorInput");

  if (advisorBtn) advisorBtn.addEventListener("click", runAdvisor);

  if (advisorInput) {
    advisorInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") runAdvisor();
    });
  }

  getById("clearBtn").addEventListener("click", () => {
    getById("searchInput").value = "";
    resetFilters();
    render();
  });

  render();
}
function showLoadingSkeleton() {
  const grid = getById("productGrid");

  if (!grid) return;

  grid.innerHTML = Array.from({ length: 8 })
    .map(() => `
      <article class="skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-button"></div>
      </article>
    `)
    .join("");
}
async function loadProducts() {
  showLoadingSkeleton();
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) throw new Error("Product data could not be loaded.");

    products = await response.json();
    init();
  } catch (error) {
    console.error("Could not load product data:", error);

    getById("productGrid").innerHTML = `
      <p class="empty">Could not load product data. Please try again later.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);