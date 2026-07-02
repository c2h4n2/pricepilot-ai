function toggleCompare(productId) {
  if (selectedCompareIds.includes(productId)) {
    selectedCompareIds = selectedCompareIds.filter((id) => id !== productId);
  } else {
    if (selectedCompareIds.length >= 4) {
      alert("You can compare up to 4 products at a time.");
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

function numberFromText(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function storageToGB(storage) {
  const text = String(storage).toLowerCase();
  const number = numberFromText(text);

  if (text.includes("tb")) return number * 1024;

  return number;
}

function getSpecLabels(product) {
  if (product.type === "monitor") {
    return {
      spec1: "Size",
      spec2: "Display",
      spec3: "Panel"
    };
  }

  return {
    spec1: "RAM",
    spec2: "Storage",
    spec3: "Processor"
  };
}

function getSpecValues(product) {
  return {
    spec1: product.ram || "—",
    spec2: product.storage || "—",
    spec3: product.processor || "—"
  };
}

function getComparisonWinners(selectedProducts) {
  return {
    price: Math.min(...selectedProducts.map((p) => p.price)),
    spec1: Math.max(...selectedProducts.map((p) => numberFromText(getSpecValues(p).spec1))),
    spec2: Math.max(...selectedProducts.map((p) => storageToGB(getSpecValues(p).spec2))),
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
  if (product.type === "monitor") {
    return `${product.ram} size, ${product.storage} display, ${product.processor}, a ${product.score}/100 value score, and a ${product.rating}/5 rating`;
  }

  return `${product.ram} RAM, ${product.storage}, ${product.processor}, a ${product.score}/100 value score, and a ${product.rating}/5 rating`;
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
        <td colspan="8">Select products above to compare them here.</td>
      </tr>
    `;

    getById("compareStatus").textContent = "Select products to compare.";
    renderCompareRecommendation([]);
    return;
  }

  const winners = getComparisonWinners(selectedProducts);

  getById("compareRows").innerHTML = selectedProducts
    .map((p) => {
      const labels = getSpecLabels(p);
      const specs = getSpecValues(p);

      return `
        <tr>
          <td>
            <strong>${p.name}</strong>
            <br>
            <small>${p.type ? p.type.toUpperCase() : "PRODUCT"}</small>
          </td>
          <td>${p.bestFor}</td>
          <td>${money(p.price)} ${winnerBadge(p.price === winners.price)}</td>
          <td><small>${labels.spec1}</small><br>${specs.spec1} ${winnerBadge(numberFromText(specs.spec1) === winners.spec1)}</td>
          <td><small>${labels.spec2}</small><br>${specs.spec2} ${winnerBadge(storageToGB(specs.spec2) === winners.spec2)}</td>
          <td><small>${labels.spec3}</small><br>${specs.spec3}</td>
          <td>${p.rating} ${winnerBadge(Number(p.rating) === winners.rating)}</td>
          <td>${p.score} ${winnerBadge(Number(p.score) === winners.score)}</td>
        </tr>
      `;
    })
    .join("");

  getById("compareStatus").textContent =
    `${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""} selected. Best values are highlighted.`;

  renderCompareRecommendation(selectedProducts);
}