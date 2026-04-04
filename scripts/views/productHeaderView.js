(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  app.createProductHeaderView = function createProductHeaderView() {
    return `
      <section class="page-header">
        <div class="page-copy">
          <h1>Product Management</h1>
          <p>Manage your industrial inventory and logistics flow</p>
        </div>
        <div class="page-actions">
          <button
            class="primary-button"
            type="button"
            data-href="/pages/inventory/inventory.html"
          >
            <span class="button-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Add new items
          </button>
        </div>
      </section>
    `;
  };
})();
