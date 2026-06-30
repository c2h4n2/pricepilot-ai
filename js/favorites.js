function getFavorites() {
  return JSON.parse(localStorage.getItem("pricepilotFavorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("pricepilotFavorites", JSON.stringify(favorites));
}

function isFavorite(productId) {
  return getFavorites().includes(productId);
}

function toggleFavorite(productId) {
  let favorites = getFavorites();

  if (favorites.includes(productId)) {
    favorites = favorites.filter((id) => id !== productId);
  } else {
    favorites.push(productId);
  }

  saveFavorites(favorites);
  render();
}