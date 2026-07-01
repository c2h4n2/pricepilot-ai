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

function renderCompareTable() {
  const selectedProducts = getSelectedProducts();

  if (!selectedProducts.length) {
    getById("compareRows").innerHTML = `
      <tr>
        <td colspan="8">Select laptops above to compare them here.</td>
      </tr>
    `;

    getById("compareStatus").textContent = "Select laptops to compare.";
    return;
  }

  const winners = getComparisonWinners(selectedProducts);

  getById("compareRows").innerHTML = selectedProducts
    .map(
      (p) => `
        <tr>
          <td>
            <strong>${p.name}</strong>
          </td>
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
}