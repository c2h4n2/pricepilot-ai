function toggleCompare(productId) {
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  if (selectedCompareIds.includes(productId)) {
    selectedCompareIds = selectedCompareIds.filter((id) => id !== productId);
    render();
    return;
  }

  if (selectedCompareIds.length > 0) {
    const firstProduct = products.find((p) => p.id === selectedCompareIds[0]);

    if (firstProduct && firstProduct.type !== product.type) {
      alert(
        `You're currently comparing ${firstProduct.type}s. Remove them first if you'd like to compare ${product.type}s instead.`
      );
      return;
    }
  }

  if (selectedCompareIds.length >= 4) {
    alert("You can compare up to 4 products at a time.");
    return;
  }

  selectedCompareIds.push(productId);
  render();
}

function clearCompare() {
  selectedCompareIds = [];
  render();
}

function getSelectedProducts() {
  return products.filter((p) => selectedCompareIds.includes(p.id));
}

function getProductIcon(product) {
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

function getSpecs(product) {
  return [product.ram, product.storage, product.processor].filter(Boolean);
}

function getComparisonWinners(selectedProducts) {
  return {
    price: Math.min(...selectedProducts.map((p) => p.price)),
    rating: Math.max(...selectedProducts.map((p) => Number(p.rating))),
    score: Math.max(...selectedProducts.map((p) => Number(p.score)))
  };
}

function winnerBadge(condition) {
  return condition ? `<span class="winner-badge">Best</span>` : "";
}

function getComparisonRecommendation(selectedProducts) {
  return [...selectedProducts].sort((a, b) => {
    const aValue = Number(a.score) + Number(a.rating) * 5 - a.price / 100;
    const bValue = Number(b.score) + Number(b.rating) * 5 - b.price / 100;
    return bValue - aValue;
  })[0];
}

function comparisonReason(product) {
  const specs = getSpecs(product).join(", ");

  return `${specs}, a ${product.score}/100 value score, and a ${product.rating}/5 rating`;
}

function renderCompareRecommendation(selectedProducts) {
  const box = getById("compareRecommendation");
  if (!box) return;

  if (selectedProducts.length < 2) {
    box.classList.add("hidden");
    box.innerHTML = "";
    return;
  }

  const pick = getComparisonRecommendation(selectedProducts);

  box.classList.remove("hidden");
  box.innerHTML = `
    <p class="eyebrow">PricePilot recommendation</p>
    <h3>🏆 ${pick.name} is the strongest overall pick</h3>
    <p>
      We recommend ${pick.name} because it combines ${comparisonReason(pick)}.
    </p>
    <a class="buy" href="product.html?id=${pick.id}">View recommended product</a>
  `;
}

function renderCompareTable() {
  const selectedProducts = getSelectedProducts();

  if (!selectedProducts.length) {
    getById("compareRows").innerHTML = `
      <tr>
        <td colspan="6">Select products above to compare them here.</td>
      </tr>
    `;

    getById("compareStatus").textContent = "Select products to compare.";
    renderCompareRecommendation([]);
    return;
  }

  const winners = getComparisonWinners(selectedProducts);

  getById("compareRows").innerHTML = selectedProducts
    .map((p) => {
      const specs = getSpecs(p);

      return `
        <tr>
          <td>
            <strong>${getProductIcon(p)} ${p.name}</strong><br>
            <small>${p.brand}</small>
          </td>

          <td>${p.bestFor}</td>

          <td>
            ${p.rating}
            ${winnerBadge(Number(p.rating) === winners.rating)}
          </td>

          <td>
            ${p.score}
            ${winnerBadge(Number(p.score) === winners.score)}
          </td>

          <td>
            <div class="compare-specs">
              ${specs.map((spec) => `<span>${spec}</span>`).join("")}
            </div>
          </td>

          <td>
            ${money(p.price)}
            ${winnerBadge(p.price === winners.price)}
          </td>
        </tr>
      `;
    })
    .join("");

  getById("compareStatus").textContent =
    `${selectedProducts.length} ${selectedProducts[0].type}${selectedProducts.length > 1 ? "s" : ""} selected.`;

  renderCompareRecommendation(selectedProducts);
}