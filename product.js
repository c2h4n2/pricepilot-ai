let products = [];

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const container = document.getElementById("product-detail");

function money(n) {
  return "$" + Number(n).toLocaleString();
}

function stars(rating) {
  const fullStars = Math.round(Number(rating));
  return "★★★★★".slice(0, fullStars) + "☆☆☆☆☆".slice(0, 5 - fullStars);
}

async function loadProduct() {
  try {
    const response = await fetch("data/laptops.json");
    products = await response.json();

    const product = products.find((p) => String(p.id) === String(productId));

    if (!product) {
      container.innerHTML = `
        <h1>Product not found</h1>
        <p>This product may not exist yet.</p>
        <p><a href="index.html">← Back to homepage</a></p>
      `;
      return;
    }

    document.title = `${product.name} | PricePilot AI`;

    container.innerHTML = `
      <a href="index.html" class="back-link">← Back to all laptops</a>

      <section class="product-hero">
        <div class="product-hero-image">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-hero-content">
          <p class="eyebrow">${product.brand}</p>
          <h1>${product.name}</h1>

          <div class="rating-row">
            <span class="stars">${stars(product.rating)}</span>
            <span>${product.rating} / 5</span>
            <span class="score-pill">${product.score}/100 value score</span>
          </div>

          <p class="lead">${product.summary}</p>

          <div class="price-row">
            <div>
              <span class="price-label">Starting at</span>
              <div class="price">${money(product.price)}</div>
            </div>
            <span class="category-pill">${product.bestFor}</span>
          </div>

          <div class="spec-chips">
            <span>${product.ram}</span>
            <span>${product.storage}</span>
            <span>${product.processor}</span>
          </div>

          <a class="buy product-buy" href="${product.link}" target="_blank" rel="nofollow sponsored noopener">
            Check price at ${product.store}
          </a>
        </div>
      </section>
    `;
  } catch (error) {
    console.error("Product page failed:", error);

    container.innerHTML = `
      <h1>Something went wrong</h1>
      <p>We could not load this product right now.</p>
      <p><a href="index.html">← Back to homepage</a></p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadProduct);