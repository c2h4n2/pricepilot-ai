function getBudget(text) {
  const match = text.match(/(?:under|max|budget|below|less than)\s*\$?(\d+)/);
  return match ? Number(match[1]) : null;
}

function getProductTypeFromQuery(text) {
  const types = {
    laptop: ["laptop", "notebook", "macbook", "computer"],
    monitor: ["monitor", "display", "screen"],
    keyboard: ["keyboard", "mechanical keyboard", "keys"]
  };

  return Object.keys(types).find((type) =>
    types[type].some((word) => text.includes(word))
  );
}

function getHighlights(product) {
  return product.highlights || [];
}

function productSearchText(product) {
  return `
    ${product.name}
    ${product.brand}
    ${product.type}
    ${product.category}
    ${product.bestFor}
    ${product.summary}
    ${getHighlights(product).join(" ")}
    ${Object.values(product.specs || {}).join(" ")}
    ${(product.pros || []).join(" ")}
  `.toLowerCase();
}

function scoreProduct(product, query) {
  const text = query.toLowerCase();
  const searchable = productSearchText(product);
  const budget = getBudget(text);
  const requestedType = getProductTypeFromQuery(text);

  let advisorScore = Number(product.score) || 0;
  const reasons = [];
  const warnings = [];

  if (requestedType) {
    if (product.type === requestedType) {
      advisorScore += 35;
      reasons.push(`Matches your requested product category: ${requestedType}.`);
    } else {
      advisorScore -= 80;
      warnings.push(`This is a ${product.type}, not a ${requestedType}.`);
    }
  }

  if (budget) {
    if (product.price <= budget) {
      advisorScore += 30;
      reasons.push(`Fits your ${money(budget)} budget.`);
    } else {
      advisorScore -= 45;
      warnings.push(`Above your ${money(budget)} budget.`);
    }
  }

  const intentRules = [
    {
      words: ["student", "college", "school", "class"],
      category: "student",
      reason: "Strong fit for students and school use."
    },
    {
      words: ["gaming", "game", "esports", "fps"],
      category: "gaming",
      reason: "Built for gaming-focused performance."
    },
    {
      words: ["business", "office", "work", "productivity"],
      category: "business",
      reason: "Well suited for work and productivity."
    },
    {
      words: ["creator", "design", "photo", "video", "editing"],
      category: "creator",
      reason: "Good fit for creators and visual work."
    },
    {
      words: ["budget", "cheap", "affordable", "value"],
      category: "budget",
      reason: "Strong value-focused option."
    }
  ];

  intentRules.forEach((rule) => {
    if (rule.words.some((word) => text.includes(word))) {
      if (product.category === rule.category) {
        advisorScore += 28;
        reasons.push(rule.reason);
      }
    }
  });

  const featureWords = [
    "wireless",
    "mechanical",
    "hot-swappable",
    "rgb",
    "low profile",
    "4k",
    "qhd",
    "240 hz",
    "1440p",
    "16 gb",
    "1 tb",
    "ssd",
    "usb-c",
    "portable",
    "quiet"
  ];

  featureWords.forEach((word) => {
    if (text.includes(word) && searchable.includes(word)) {
      advisorScore += 12;
      reasons.push(`Matches your requested feature: ${word}.`);
    }
  });

  if (Number(product.rating) >= 4.7) {
    advisorScore += 8;
    reasons.push(`Strong ${product.rating}/5 rating.`);
  }

  if (Number(product.score) >= 94) {
    advisorScore += 8;
    reasons.push(`Excellent ${product.score}/100 value score.`);
  }

  advisorScore = Math.max(0, Math.min(100, Math.round(advisorScore)));

  if (!reasons.length) {
    reasons.push("Strong overall match based on value, rating, and product details.");
  }

  return {
    ...product,
    advisorScore,
    reasons,
    warnings
  };
}

function getRecommendations(query) {
  return products
    .map((product) => scoreProduct(product, query))
    .sort((a, b) => b.advisorScore - a.advisorScore)
    .slice(0, 3);
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
      <p>Try: <strong>I need a wireless mechanical keyboard under $150 for work.</strong></p>
    `;
    return;
  }

  const recommendations = getRecommendations(query);
  const best = recommendations[0];

  result.classList.remove("hidden");

  result.innerHTML = `
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
      <p>${best.summary}</p>
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
                <p>${product.summary}</p>
                <ul>
                  ${product.reasons.slice(0, 3).map((reason) => `<li>${reason}</li>`).join("")}
                </ul>
                <a class="buy" href="product.html?id=${product.id}">View Details</a>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}