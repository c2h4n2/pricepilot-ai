const products = window.PRICEPILOT_PRODUCTS || [];

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const container = document.getElementById("product-detail");

const product = products.find(p => String(p.id) === String(productId));

if (!product) {
  container.innerHTML = `
    <h1>Product not found</h1>
    <p>This product may not exist yet.</p>
    <p><a href="index.html">← Back to homepage</a></p>
  `;
} else {
  document.title = `${product.name} | PricePilot AI`;

  container.innerHTML = `
    <a href="index.html" class="back-link">← Back to all laptops</a>

    <div class="product-detail-card">
      <div class="product-info">
        <p class="eyebrow">${product.category}</p>

        <h1>${product.name}</h1>

        <p>${product.summary}</p>

        <h2>$${Number(product.price).toLocaleString()}</h2>

        <table>
          <tr><th>Brand</th><td>${product.brand}</td></tr>
          <tr><th>Best For</th><td>${product.bestFor}</td></tr>
          <tr><th>Processor</th><td>${product.processor}</td></tr>
          <tr><th>RAM</th><td>${product.ram}</td></tr>
          <tr><th>Storage</th><td>${product.storage}</td></tr>
          <tr><th>Store</th><td>${product.store}</td></tr>
          <tr><th>Rating</th><td>${product.rating} / 5</td></tr>
          <tr><th>Value Score</th><td>${product.score} / 100</td></tr>
        </table>

        <br>

        <a class="buy" href="${product.link}" target="_blank" rel="nofollow sponsored noopener">
          Check Price
        </a>
      </div>
    </div>
  `;
}