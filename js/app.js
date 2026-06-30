let products = [];
let currentFilter = "all";
let selectedCompareIds = [];

function productText(p) {
  return `${p.name} ${p.brand} ${p.category} ${p.bestFor} ${p.price} ${p.ram} ${p.storage} ${p.processor}`.toLowerCase();
}

function getFiltered() {
  const q = (getById("searchInput")?.value || "").toLowerCase().trim();

  let list = products.filter((p) => currentFilter === "all" || p.category === currentFilter);

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
  const top = [...products].sort((a, b) => b.score - a.score)[0];

  if (top) {
    getById("topPickName").textContent = top.name;
    getById("topPickSummary").textContent = top.summary;
    getById("topPickScore").textContent = `${top.score}/100 value score`;
  }
}

function render() {
  const list = getFiltered();

  getById("productCount").textContent = products.length;

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

    document.querySelectorAll(".filters button").forEach((button) => {
      button.classList.toggle("active", button.dataset.filter === "all");
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

  render();
}

async function loadProducts() {
  try {
    const response = await fetch("data/laptops.json");

    if (!response.ok) throw new Error("Laptop data could not be loaded.");

    products = await response.json();
    init();
  } catch (error) {
    console.error("Could not load laptop data:", error);

    getById("productGrid").innerHTML = `
      <p class="empty">Could not load product data. Please try again later.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);