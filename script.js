(function () {
  const app = window.WarehouseApp;

  function renderShell() {
    const sidebarRoot = document.querySelector("#sidebar-view");
    const pageRoot = document.querySelector("#product-page-view");

    sidebarRoot.innerHTML = app.createSidebarView({
      navigationItems: app.navigationItems,
      currentUser: app.currentUser
    });
    pageRoot.innerHTML = app.createProductPageView();
  }

  function getElements() {
    return {
      inventoryTableBody: document.querySelector("#inventory-table-body"),
      resultsSummary: document.querySelector("#results-summary"),
      pagination: document.querySelector("#inventory-pagination")
    };
  }

  function renderApp(elements, store) {
    app.renderInventoryTable(
      {
        inventoryTableBody: elements.inventoryTableBody,
        resultsSummary: elements.resultsSummary,
        pagination: elements.pagination
      },
      store.getTableState()
    );
  }

  function handlePaginationClick(event, elements, store) {
    const button = event.target.closest(".page-btn");

    if (!button) {
      return;
    }

    const page = Number(button.dataset.page);

    if (!Number.isNaN(page)) {
      store.setPage(page);
    }

    renderApp(elements, store);
  }

  function initialize() {
    renderShell();

    const elements = getElements();
    const store = app.createProductStore({
      inventoryBatches: app.inventoryBatches,
      pageSize: 2
    });

    elements.pagination.addEventListener("click", function (event) {
      handlePaginationClick(event, elements, store);
    });

    renderApp(elements, store);
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
