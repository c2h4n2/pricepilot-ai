function getBudget(text) {
  const match = text.match(/(?:under|max|budget|below|less than)\s*\$?(\d+)/);
  return match ? Number(match[1]) : null;
}

function getProductTypeFromQuery(text) {
  const typeRules = [
    {
      type: "laptop",
      words: ["laptop", "laptops", "notebook", "notebooks", "macbook", "computer", "college computer"]
    },
    {
      type: "monitor",
      words: ["monitor", "monitors", "display", "displays", "screen", "screens"]
    },
    {
      type: "keyboard",
      words: ["keyboard", "keyboards", "mechanical keyboard", "keys"]
    }
  ];

  const rule = typeRules.find((item) => item.words.some((word) => text.includes(word)));
  return rule ? rule.type : null;
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

function readableType(type) {
  const labels = {
    laptop: "laptop",
    monitor: "monitor",
    keyboard: "keyboard"
  };

  return labels[type] || "product";
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function scoreProduct(product, query) {
  const text = query.toLowerCase();
  const searchable = productSearchText(product);
  const budget = getBudget(text);
  const requestedType = getProductTypeFromQuery(text);

  let advisorScore = 50;
  const reasons = [];
  const warnings = [];

  advisorScore += Math.min(25, Math.round((Number(product.score) || 0) / 4));

  if (requestedType) {
    if (product.type === requestedType) {
      advisorScore += 30;
      reasons.push(`Matches your requested category: ${readableType(requestedType)}.`);
    } else {
      advisorScore -= 200;
      warnings.push("Different product category.");
    }
  }

  if (budget) {
    if (product.price <= budget) {
      advisorScore += 25;
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
      reason: "Good fit for gaming-focused needs."
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
    if (hasAny(text, rule.words) && product.category === rule.category) {
      advisorScore += 22;
      reasons.push(rule.reason);
    }
  });

  if (
    product.type === "laptop" &&
    hasAny(text, ["coding", "programming", "developer", "computer science", "cs"])
  ) {
    advisorScore += 26;
    reasons.push("Good fit for coding and programming work.");

    if (searchable.includes("16 gb")) {
      advisorScore += 14;
      reasons.push("16 GB memory is helpful for coding and multitasking.");
    }

    if (searchable.includes("ssd")) {
      advisorScore += 8;
      reasons.push("SSD storage helps keep development workflows responsive.");
    }
  }

  const featureWords = [
    "wireless",
    "mechanical",
    "hot-swappable",
    "hot swappable",
    "rgb",
    "low profile",
    "4k",
    "qhd",
    "240 hz",
    "240hz",
    "1440p",
    "16 gb",
    "16gb",
    "1 tb",
    "1tb",
    "ssd",
    "usb-c",
    "portable",
    "quiet"
  ];

  featureWords.forEach((word) => {
    const normalizedWord = word.replace(/\s+/g, "");
    const normalizedSearchable = searchable.replace(/\s+/g, "");

    if (text.includes(word) && searchable.includes(word)) {
      advisorScore += 10;
      reasons.push(`Matches your requested feature: ${word}.`);
    } else if (text.includes(normalizedWord) && normalizedSearchable.includes(normalizedWord)) {
      advisorScore += 10;
      reasons.push(`Matches your requested feature: ${word}.`);
    }
  });

  if (Number(product.rating) >= 4.7) {
    advisorScore += 6;
    reasons.push(`Strong ${product.rating}/5 rating.`);
  }

  if (Number(product.score) >= 94) {
    advisorScore += 6;
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
  const text = query.toLowerCase();
  const requestedType = getProductTypeFromQuery(text);

  let candidates = products;

  if (requestedType) {
    candidates = products.filter((product) => product.type === requestedType);
  }

  return candidates
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
      <p>Try: <strong>I need a laptop under $900 for college and coding.</strong></p>
    `;
    return;
  }

  const recommendations = getRecommendations(query);

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