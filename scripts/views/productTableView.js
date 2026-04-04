(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  function renderPagination(container, tableState) {
    const pageButtons = Array.from({ length: tableState.totalPages }, function (_, index) {
      const page = index + 1;

      return `
        <button
          class="page-btn${page === tableState.currentPage ? " active" : ""}"
          type="button"
          data-page="${page}"
          aria-label="Go to page ${page}"
          ${page === tableState.currentPage ? 'aria-current="page"' : ""}
        >
          ${page}
        </button>
      `;
    }).join("");

    container.innerHTML = pageButtons;
  }

  app.createInventoryTableSectionView = function createInventoryTableSectionView() {
    return `
      <section class="inventory-panel">
        <div class="inventory-panel-head">
          <div class="section-copy">
            <h2>Batch Inventory Overview</h2>
            <p>Track stock health, product batches and warehouse update cadence.</p>
          </div>
          <div class="section-actions">
            <button class="icon-button" type="button" aria-label="Download inventory">
              <svg viewBox="0 0 24 24">
                <path d="M12 4v10M8.5 10.5 12 14l3.5-3.5M5 19h14" />
              </svg>
            </button>
            <button class="icon-button" type="button" aria-label="More actions">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>
        </div>
        <div class="inventory-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product Detail</th>
                <th>Category</th>
                <th>Stock Status</th>
                <th>Last Update</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="inventory-table-body"></tbody>
          </table>
        </div>
        <div class="table-footer">
          <p id="results-summary">Showing 1-2 of 6 items</p>
          <div class="pagination" id="inventory-pagination" aria-label="Pagination"></div>
        </div>
      </section>
    `;
  };

  app.renderInventoryTable = function renderInventoryTable(elements, tableState) {
    elements.inventoryTableBody.innerHTML = tableState.visibleBatches
      .map(function (batch) {
        return `
          <tr>
            <td>
              <div class="product-detail">
                <div class="product-thumb">
                  ${app.createProductArtMarkup(batch.art, "product-art-small")}
                </div>
                <div>
                  <span class="product-name">${batch.name}</span>
                  <span class="product-subtitle">${batch.subtitle}</span>
                </div>
              </div>
            </td>
            <td>${batch.category}</td>
            <td>
              <span class="stock-pill stock-pill-${batch.stockTone}">${batch.stockLabel}</span>
            </td>
            <td><span class="inventory-date">${batch.updatedAt}</span></td>
            <td>
              <button class="row-action" type="button" aria-label="Open ${batch.name}">
                <svg viewBox="0 0 24 24">
                  <path d="M7 12h10M13 7l5 5-5 5" />
                </svg>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    const start = (tableState.currentPage - 1) * tableState.pageSize + 1;
    const end = start + tableState.visibleBatches.length - 1;

    elements.resultsSummary.textContent =
      "Showing " + start + "-" + end + " of " + tableState.totalItems + " items";

    renderPagination(elements.pagination, tableState);
  };
})();
