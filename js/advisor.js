function requestSummaryItems(intent) {
  const items = [];

  items.push({
    label: "Product",
    value: intent.productType ? readableType(intent.productType) : "Any tech product"
  });

  if (intent.budget) {
    items.push({
      label: "Budget",
      value: `Under ${money(intent.budget)}`
    });
  }

  if (intent.student) items.push({ label: "Use", value: "Student / College" });
  if (intent.gaming) items.push({ label: "Use", value: "Gaming" });
  if (intent.business) items.push({ label: "Use", value: "Business / Productivity" });
  if (intent.creator) items.push({ label: "Use", value: "Creator work" });
  if (intent.coding) items.push({ label: "Workload", value: "Coding / Programming" });
  if (intent.budgetFocused) items.push({ label: "Priority", value: "Best value" });

  return items;
}

function renderRequestSummary(query) {
  const intent = analyzeQuery(query);
  const items = requestSummaryItems(intent);

  return `
    <section class="advisor-decision">
      <p class="eyebrow">PricePilot Decision</p>
      <h3>We understood your request</h3>

      <div class="decision-grid">
        ${items
          .map(
            (item) => `
              <div>
                <span>${item.label}</span>
                <strong>${item.value}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function buildRecommendationExplanation(product, query) {
  const intent = analyzeQuery(query);
  const highlights = (product.highlights || []).slice(0, 3).join(", ");

  let explanation = `We recommend ${product.name} because it combines ${highlights} with a ${product.score}/100 value score`;

  if (intent.budget && product.price <= intent.budget) {
    explanation += ` while staying within your ${money(intent.budget)} budget`;
  }

  if (intent.coding && product.type === "laptop") {
    explanation += `. Those specs make it a strong fit for coding, multitasking, and college coursework`;
  } else if (intent.gaming) {
    explanation += `. That makes it a strong fit for gaming-focused shoppers`;
  } else if (intent.business) {
    explanation += `. That makes it a practical choice for work and productivity`;
  } else if (intent.creator) {
    explanation += `. That makes it useful for creative work and visual tasks`;
  } else if (intent.student) {
    explanation += `. That makes it a smart option for students`;
  }

  return `${explanation}.`;
}

function buildRunnerUpExplanation(product) {
  const reasons = product.reasons.slice(0, 2).join(" ");
  return reasons || `${product.name} is also a strong alternative based on value, rating, and product fit.`;
}

function runAdvisor() {
  const input = getById("advisorInput");
  const result = getById("advisorResult");
  if (!input || !result) return;

  const query = input.value.trim();

  if (!query) {
    result.classList.remove("hidden");
    result.innerHTML = `
      <h3>Tell us what you need</h3>
      <p>Try: <strong>I need a laptop under $900 for college and coding.</strong></p>
    `;
    return;
  }

  const recommendations = getRecommendations(query, products);

  result.classList.remove("hidden");

  if (!recommendations.length) {
    result.innerHTML = `
      <h3>No matching products yet</h3>
      <p>Try a broader search like <strong>gaming monitor</strong>, <strong>student laptop</strong>, or <strong>wireless keyboard</strong>.</p>
    `;
    return;
  }

  const best = recommendations[0];

  result.innerHTML = `
    ${renderRequestSummary(query)}

    <h3>🎯 PricePilot AI recommends</h3>
    <p>Based on: “${query}”</p>

    <div class="advisor-highlight">
      <p class="eyebrow">Best match</p>
      <h2>${best.name}</h2>
      <p>
        <strong>${best.advisorScore}% match</strong> ·
        ${money(best.price)} ·
        ${stars(best.rating)} ${best.rating}
      </p>

      <h3>Why we picked it</h3>
      <p>${buildRecommendationExplanation(best, query)}</p>

      <ul>
        ${best.reasons.slice(0, 4).map((reason) => `<li>${reason}</li>`).join("")}
      </ul>

      <a class="buy" href="product.html?id=${best.id}">View Best Match</a>
    </div>

    <div class="advisor-recommendations">
      ${recommendations
        .slice(1)
        .map(
          (product) => `
            <article class="advisor-card">
              <img src="${product.image}" alt="${product.name}" loading="lazy">
              <div>
                <p class="eyebrow">Runner-up · ${product.advisorScore}% match</p>
                <h2>${product.name}</h2>
                <p><strong>${money(product.price)}</strong> · ${stars(product.rating)} ${product.rating}</p>
                <p>${buildRunnerUpExplanation(product)}</p>
                <a class="buy" href="product.html?id=${product.id}">View Details</a>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}