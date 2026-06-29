function getBudget(text) {
  const under = text.match(/under\s*\$?(\d+)/);
  const max = text.match(/max\s*\$?(\d+)/);
  const budget = text.match(/budget\s*\$?(\d+)/);

  const match = under || max || budget;
  return match ? Number(match[1]) : null;
}

function scoreLaptop(product, query) {
  const text = query.toLowerCase();
  let advisorScore = Number(product.score) || 0;
  const reasons = [];

  const budget = getBudget(text);

  if (budget) {
    if (product.price <= budget) {
      advisorScore += 25;
      reasons.push(`Fits your ${money(budget)} budget.`);
    } else {
      advisorScore -= 40;
      reasons.push(`It is above your ${money(budget)} budget.`);
    }
  }

  if ((text.includes("student") || text.includes("college") || text.includes("school")) && product.category === "student") {
    advisorScore += 30;
    reasons.push("Strong choice for students and college use.");
  }

  if (text.includes("gaming") && product.category === "gaming") {
    advisorScore += 35;
    reasons.push("Built for gaming performance.");
  }

  if ((text.includes("business") || text.includes("work")) && product.category === "business") {
    advisorScore += 25;
    reasons.push("Well suited for business and work.");
  }

  if ((text.includes("budget") || text.includes("cheap") || text.includes("affordable")) && product.category === "budget") {
    advisorScore += 30;
    reasons.push("One of the best value picks.");
  }

  if ((text.includes("programming") || text.includes("coding") || text.includes("computer science")) && String(product.ram).includes("16")) {
    advisorScore += 20;
    reasons.push("16 GB RAM is helpful for coding and multitasking.");
  }

  if (Number(product.rating) >= 4.7) {
    advisorScore += 10;
    reasons.push(`Strong ${product.rating}/5 rating.`);
  }

  if (reasons.length === 0) {
    reasons.push("High overall value score.");
  }

  return {
    ...product,
    advisorScore,
    reasons
  };
}

function getRecommendations(query) {
  return products
    .map((product) => scoreLaptop(product, query))
    .sort((a, b) => b.advisorScore - a.advisorScore)
    .slice(0, 3);
}

function runAdvisor() {
  const input = $("advisorInput");
  const result = $("advisorResult");

  if (!input || !result) return;

  const query = input.value.trim();

  if (!query) {
    result.classList.remove("hidden");
    result.innerHTML = `
      <h3>Tell us what you need</h3>
      <p>Try: <strong>I need a laptop under $900 for college and programming.</strong></p>
    `;
    return;
  }

  const recommendations = getRecommendations(query);

  result.classList.remove("hidden");

  result.innerHTML = `
    <h3>🎯 PricePilot AI recommends</h3>
    <p>Based on: “${query}”</p>

    <div class="advisor-recommendations">
      ${recommendations
        .map(
          (laptop, index) => `
            <article class="advisor-card">
              <img src="${laptop.image}" alt="${laptop.name}" loading="lazy">

              <div>
                <p class="eyebrow">${index === 0 ? "Best match" : "Alternative"}</p>
                <h2>${laptop.name}</h2>
                <p><strong>${money(laptop.price)}</strong> · ${stars(laptop.rating)} ${laptop.rating}</p>
                <p>${laptop.summary}</p>

                <p><strong>Why this fits:</strong></p>
                <ul>
                  ${laptop.reasons.slice(0, 3).map((reason) => `<li>${reason}</li>`).join("")}
                </ul>

                <a class="buy" href="product.html?id=${laptop.id}">View Details</a>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}