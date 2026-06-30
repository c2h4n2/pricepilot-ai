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

function renderCompareTable() {
  const selectedProducts = getSelectedProducts();

  getById("compareRows").innerHTML = selectedProducts.length
    ? selectedProducts.map((p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.bestFor}</td>
        <td>${money(p.price)}</td>
        <td>${p.ram}</td>
        <td>${p.storage}</td>
        <td>${p.processor}</td>
        <td>${p.score}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">Select laptops above to compare them here.</td></tr>`;

  getById("compareStatus").textContent =
    selectedProducts.length === 0
      ? "Select laptops to compare."
      : `${selectedProducts.length} laptop${selectedProducts.length > 1 ? "s" : ""} selected.`;
}