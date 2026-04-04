(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  function createProductCard(product) {
    return `
      <article class="product-card">
        <div class="product-card-head">
          <span class="category-badge">${product.category}</span>
          <div class="product-actions">
            <button
              class="card-action"
              type="button"
              aria-label="Edit ${product.name}"
              data-href="/pages/inventory/inventory.html"
            >
              <svg viewBox="0 0 24 24">
                <path d="m4 20 4.5-1 9-9-3.5-3.5-9 9L4 20Z" />
                <path d="M13.5 6.5 17 10" />
              </svg>
            </button>
            <button
              class="card-action"
              type="button"
              aria-label="Delete ${product.name}"
              data-href="/pages/inventory/inventory.html"
            >
              <svg viewBox="0 0 24 24">
                <path d="M5 7h14M9 7V5h6v2M9 10v6M15 10v6M7 7l1 12h8l1-12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="product-visual">
          ${app.createProductArtMarkup(product.art)}
        </div>
        <div class="product-pricing">
          <strong>${product.price}</strong>
          <span>${product.compareAt}</span>
        </div>
        <span class="product-title">${product.name}</span>
        <span class="product-caption">${product.category}</span>
        <div class="product-card-footer">
          <span class="inventory-note">${product.unitsRemaining}</span>
          <span class="stock-pill stock-pill-${product.stockTone}">${product.stockLabel}</span>
        </div>
      </article>
    `;
  }

  app.createProductShowcaseView = function createProductShowcaseView(products) {
    return `
      <section class="product-showcase" aria-label="Featured products">
        ${products.map(createProductCard).join("")}
      </section>
    `;
  };
})();
