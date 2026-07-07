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

function getHighlights(product) {
  return product.highlights || [];
}

function getSpecs(product) {
  return getHighlights(product).slice(0, 3);
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

function getCompareStrengths(product) {
  const strengths = [];

  if (Number(product.score) >= 94) strengths.push("excellent value score");
  if (Number(product.rating) >= 4.7) strengths.push("strong customer-style rating");
  if (product.price <= 300) strengths.push("lower price");
  if (product.badge) strengths.push(product.badge.toLowerCase());
  if (product.bestFor) strengths.push(`best for ${product.bestFor.toLowerCase()}`);

  return strengths.slice(0, 3);
}

function buildComparisonVerdict(selectedProducts, pick) {
  const alternatives = selectedProducts.filter((product) => product.id !== pick.id);
  const specs = getSpecs(pick).join(", ");
  const strengths = getCompareStrengths(pick);

  return `
    <section class="comparison-verdict">
      <p class="eyebrow">AI comparison verdict</p>
      <h3>🏆 ${pick.name} is the best overall choice</h3>

      <p>
        PricePilot recommends ${pick.name} because it offers ${specs},
        a ${pick.score}/100 value score, and a ${pick.rating}/5 rating.
        ${strengths.length ? `It stands out for ${strengths.join(", ")}.` : ""}
      </p>

      <div class="verdict-grid">
        <div>
          <strong>Choose ${pick.name} if...</strong>
          <ul>
            ${(pick.pros || [])
              .slice(0, 3)
              .map((pro) => `<li>${pro}</li>`)
              .join("")}
          </ul>
        </div>

        <div>
          <strong>Also consider...</strong>
          <ul>
            ${alternatives
              .slice(0, 3)
              .map(
                (product) => `
                  <li>
                    <b>${product.name}</b> if you prefer ${product.bestFor.toLowerCase()}
                    or want ${getSpecs(product).slice(0, 2).join(", ")}.
                  </li>
                `
              )
              .join("")}
          </ul>
        </div>
      </div>

      <a class="buy" href="product.html?id=${pick.id}">View recommended product</a>
    </section>
  `;
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
  box.innerHTML = buildComparisonVerdict(selectedProducts, pick);
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