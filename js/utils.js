// ======================================
// PricePilot AI - Shared Utility Functions
// ======================================

function money(n) {
  return "$" + Number(n).toLocaleString();
}

function stars(rating) {
  const fullStars = Math.round(Number(rating));
  return "★★★★★".slice(0, fullStars) + "☆☆☆☆☆".slice(0, 5 - fullStars);
}

function getById(id) {
  return document.getElementById(id);
}

function listItems(items = []) {
  return items.map(item => `<li>${item}</li>`).join("");
}

function formatDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function scoreLabel(score) {
  if (score >= 95) return "Excellent";
  if (score >= 90) return "Great";
  if (score >= 80) return "Very Good";
  return "Good";
}