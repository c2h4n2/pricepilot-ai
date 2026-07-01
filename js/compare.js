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

function numberFromText(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

function storageToGB(storage) {
  const text = String(storage).toLowerCase();
  const number = numberFromText(text);

  if (text.includes("tb")) {
    return number * 1024;
  }

  return number;
}

function getComparisonWinners(selectedProducts) {
  return {
    price: Math.min(...selectedProducts.map((p) => p.price)),
    ram: Math.max(...selectedProducts.map((p) => numberFromText(p.ram))),
    storage: Math.max(...selectedProducts.map((p) => storageToGB(p.storage))),
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
      We recommend ${pick.name} because it combines a ${pick.score}/100 value score,
      a ${pick.rating}/5 rating, ${pick.ram} RAM, ${pick.storage}, and a ${pick.processor}.
    </p>
    <a class="buy" href="product.html?id=${pick.id}">View recommended laptop</a>
  `;
}

function renderCompareTable() {
  const selectedProducts = getSelectedProducts();

  if (!selectedProducts.length) {
    getById("compareRows").innerHTML = `
      <tr>
        <td colspan="8">Select laptops above to compare them here.</td>
      </tr>
    `;

    getById("compareStatus").textContent = "Select laptops to compare.";
    renderCompareRecommendation([]);
    return;
  }

  const winners = getComparisonWinners(selectedProducts);

  getById("compareRows").innerHTML = selectedProducts
    .map(
      (p) => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.bestFor}</td>
          <td>${money(p.price)} ${winnerBadge(p.price === winners.price)}</td>
          <td>${p.ram} ${winnerBadge(numberFromText(p.ram) === winners.ram)}</td>
          <td>${p.storage} ${winnerBadge(storageToGB(p.storage) === winners.storage)}</td>
          <td>${p.processor}</td>
          <td>${p.rating} ${winnerBadge(Number(p.rating) === winners.rating)}</td>
          <td>${p.score} ${winnerBadge(Number(p.score) === winners.score)}</td>
        </tr>
      `
    )
    .join("");

  getById("compareStatus").textContent =
    `${selectedProducts.length} laptop${selectedProducts.length > 1 ? "s" : ""} selected. Best values are highlighted.`;

  renderCompareRecommendation(selectedProducts);
}