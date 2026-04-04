(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.createPageHeaderView = function createPageHeaderView() {
    return (
      '<section class="page-header">' +
      '<div class="page-copy">' +
      "<h1>Supplier Directory</h1>" +
      "<p>Manage and monitor 24 active vendor partners across the globe.</p>" +
      "</div>" +
      '<div class="toolbar-actions">' +
      '<button class="toolbar-btn" id="filter-button" type="button">' +
      '<span class="toolbar-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24">' +
      '<path d="M5 7h14M8 12h8M10.5 17h3" />' +
      "</svg>" +
      "</span>" +
      '<span id="filter-button-label">Filter</span>' +
      "</button>" +
      '<button class="toolbar-btn" id="export-button" type="button">' +
      '<span class="toolbar-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24">' +
      '<path d="M12 4v10M8.5 10.5 12 14l3.5-3.5M5 18.5h14" />' +
      "</svg>" +
      "</span>" +
      "Export" +
      "</button>" +
      "</div>" +
      "</section>"
    );
  };

  app.renderPageHeader = function renderPageHeader(elements, filter) {
    elements.filterButtonLabel.textContent =
      filter.id === "all" ? "Filter" : "Filter: " + filter.label;
  };
})();
