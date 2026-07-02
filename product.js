let products = [];

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const container = getById("product-detail");

function productTypeLabel(product) {
  if (product.type === "monitor") return "Monitor";
  if (product.type === "laptop") return "Laptop";
  return "Product";
}

function bestForTags(product) {
  const tags = [productTypeLabel(product), product.bestFor, product.category, product.ram];
  return tags.filter(Boolean).map((tag) => `<span>${tag}</span>`).join("");
}

function productSpecChips(product) {
  return [product.ram, product.storage, product.processor]
    .filter(Boolean)
    .map((spec) => `<span>${spec}</span>`)
    .join("");
}

function ratingBreakdown(product) {
  const value = Math.min(5, Math.max(1, product.score / 20)).toFixed(1);

  const rows =
    product.type === "monitor"
      ? [
          ["Display quality", product.rating],
          ["Value", value],
          ["Color & clarity", 4.7],
          ["Gaming / motion", product.category === "gaming" ? 4.8 : 4.1],
          ["Productivity", 4.8]
        ]
      : [
          ["Performance", product.rating],
          ["Value", value],
          ["Portability", product.category === "gaming" ? 3.8 : 4.7],
          ["Battery", product.category === "gaming" ? 3.7 : 4.6],
          ["Everyday use", 4.8]
        ];

  return rows
    .map(
      ([label, score]) => `
        <div class="rating-breakdown-row">
          <span>${label}</span>
          <strong>${stars(score)} ${score}</strong>
        </div>
      `
    )
    .join("");
}

function verdict(product) {
  if (product.type === "monitor") {
    return `${product.name} is one of the strongest picks for ${product.bestFor.toLowerCase()} because it combines ${product.ram}, ${product.storage}, ${product.processor}, and a ${product.score}/100 value score. It is a smart option if you want a quality display without spending hours comparing monitor specs.`;
  }

  return `${product.name} is one of the strongest picks for ${product.bestFor.toLowerCase()} because it combines ${product.processor}, ${product.ram} RAM, ${product.storage}, and a ${product.score}/100 value score. It is a smart option if you want a reliable laptop without spending hours comparing specs.`;
}

function recommendationText(product) {
  if (product.type === "monitor") {
    return `${product.name} is a strong choice for ${product.bestFor.toLowerCase()} because it balances ${product.ram}, ${product.storage}, ${product.processor}, and a ${product.score}/100 value score.`;
  }

  return `${product.name} is a strong choice for ${product.bestFor.toLowerCase()} because it balances ${product.processor}, ${product.ram} RAM, ${product.storage}, and a ${product.score}/100 value score.`;
}

function buyingTip(product) {
  if (product.type === "monitor") {
    return `
      Monitor prices can change during holiday sales, back-to-school promotions, and gaming events.
      Before purchasing, compare resolution, refresh rate, panel type, ports, and whether the monitor fits your desk setup.
    `;
  }

  return `
    Laptop prices can change during back-to-school sales, holiday events, and manufacturer promotions.
    Before purchasing, compare current offers and check whether upgraded RAM or storage is worth the extra cost.
  `;
}

function specsTable(product) {
  if (product.type === "monitor") {
    return `
      <div><strong>Brand</strong><span>${product.brand}</span></div>
      <div><strong>Size</strong><span>${product.ram}</span></div>
      <div><strong>Display</strong><span>${product.storage}</span></div>
      <div><strong>Panel</strong><span>${product.processor}</span></div>
      <div><strong>Screen</strong><span>${product.display}</span></div>
      <div><strong>Weight</strong><span>${product.weight}</span></div>
      <div><strong>Best For</strong><span>${product.bestFor}</span></div>
    `;
  }

  return `
    <div><strong>Brand</strong><span>${product.brand}</span></div>
    <div><strong>Display</strong><span>${product.display}</span></div>
    <div><strong>Processor</strong><span>${product.processor}</span></div>
    <div><strong>RAM</strong><span>${product.ram}</span></div>
    <div><strong>Storage</strong><span>${product.storage}</span></div>
    <div><strong>Battery</strong><span>${product.battery}</span></div>
    <div><strong>Weight</strong><span>${product.weight}</span></div>
    <div><strong>Best For</strong><span>${product.bestFor}</span></div>
  `;
}

function relatedProducts(currentProduct) {
  return products
    .filter((p) => p.id !== currentProduct.id && p.type === currentProduct.type)
    .slice(0, 3)
    .map(
      (p) => `
        <a class="related-card" href="product.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}">
          <strong>${p.name}</strong>
          <span>${money(p.price)}</span>
        </a>
      `
    )
    .join("");
}

async function loadProduct() {
  try {
    const response = await fetch("data/products.json");
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

    const typeLabel = productTypeLabel(product);
    document.title = `${product.name} | PricePilot AI`;

    container.innerHTML = `
      <a href="index.html" class="back-link">← Back to all products</a>

      <section class="review-meta">
        <span>Reviewed by PricePilot AI</span>
        <span>${typeLabel}</span>
        <span>Last updated ${formatDate()}</span>
      </section>

      <section class="product-hero">
        <div class="product-hero-image">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-hero-content">
          <p class="eyebrow">${product.brand} ${typeLabel}</p>
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
            ${productSpecChips(product)}
          </div>

          <a class="buy product-buy" href="${product.link}" target="_blank" rel="nofollow sponsored noopener">
            Check price at ${product.store}
          </a>
        </div>
      </section>

      <section class="trust-grid">
        <article class="score-card">
          <p class="eyebrow">Overall score</p>
          <strong>${product.score}</strong>
          <span>${scoreLabel(product.score)}</span>
        </article>

        <article class="award-card">
          <p class="eyebrow">Award</p>
          <h2>${product.badge}</h2>
          <p>Selected by PricePilot AI for ${product.bestFor.toLowerCase()}.</p>
        </article>
      </section>

      <section class="verdict-card">
        <p class="eyebrow">PricePilot verdict</p>
        <h2>Our quick take</h2>
        <p>${verdict(product)}</p>
      </section>

      <section class="review-card">
        <p class="eyebrow">Rating breakdown</p>
        <h2>How this ${typeLabel.toLowerCase()} scores</h2>
        <div class="rating-breakdown">
          ${ratingBreakdown(product)}
        </div>
      </section>

      <section class="review-card">
        <p class="eyebrow">Best for</p>
        <h2>Who should buy this?</h2>
        <div class="best-for-tags">
          ${bestForTags(product)}
        </div>
      </section>

      <section class="product-review-grid">
        <article class="review-card">
          <h2>Why you'll love it</h2>
          <ul class="positive-list">
            ${listItems(product.pros || [])}
          </ul>
        </article>

        <article class="review-card">
          <h2>Things to consider</h2>
          <ul class="negative-list">
            ${listItems(product.cons || [])}
          </ul>
        </article>
      </section>

      <section class="review-card">
        <p class="eyebrow">PricePilot recommendation</p>
        <h2>Why PricePilot AI recommends this</h2>
        <p>${recommendationText(product)}</p>
      </section>

      <section class="review-card">
        <p class="eyebrow">Buying tip</p>
        <h2>Buy smarter</h2>
        <p>${buyingTip(product)}</p>
      </section>

      <section class="review-card">
        <p class="eyebrow">${typeLabel} specifications</p>
        <h2>Detailed specs</h2>

        <div class="spec-table">
          ${specsTable(product)}
        </div>
      </section>

      <section class="review-card">
        <p class="eyebrow">Keep comparing</p>
        <h2>You may also like</h2>
        <div class="related-grid">
          ${relatedProducts(product)}
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