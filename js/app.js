let products = [];
let currentFilter = "all";
let currentTypeFilter = "all";
let selectedCompareIds = [];

function getHighlights(product) {
  return product.highlights || [
    product.spec1,
    product.spec2,
    product.spec3,
    product.ram,
    product.storage,
    product.processor
  ].filter(Boolean);
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
    getById("topPickName").textContent = top.name;
    getById("topPickSummary").textContent = top.summary;
    getById("topPickScore").textContent = `${top.score}/100 value score`;
  }
}

function render() {
  const list = getFiltered();

  getById("productCount").textContent = list.length;

  renderProductCards(list);
  renderCompareTable();
  renderTopPick();

  getById("emptyState").classList.toggle("hidden", list.length > 0);
}

function init() {
  getById("year").textContent = new Date().getFullYear();

  getById("searchInput").addEventListener("input", render);
  getById("sortSelect").addEventListener("change", render);
  getById("clearCompareBtn").addEventListener("click", clearCompare);

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
    currentFilter = "all";
    currentTypeFilter = "all";

    document.querySelectorAll(".filters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === "all");
    });

    document.querySelectorAll(".type-filters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.type === "all");
    });

    render();
  });

  document.querySelectorAll(".filters button").forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;

      document.querySelectorAll(".filters button").forEach((b) => b.classList.remove("active"));

      button.classList.add("active");
      render();
    });
  });

  document.querySelectorAll(".type-filters button").forEach((button) => {
    button.addEventListener("click", () => {
      currentTypeFilter = button.dataset.type;

      document.querySelectorAll(".type-filters button").forEach((b) => b.classList.remove("active"));

      button.classList.add("active");
      render();
    });
  });

  render();
}

async function loadProducts() {
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
