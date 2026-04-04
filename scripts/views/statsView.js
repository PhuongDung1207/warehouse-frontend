(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.createStatsSectionView = function createStatsSectionView() {
    return (
      '<section class="stats-grid" aria-label="Supplier statistics">' +
      '<article class="metric-card">' +
      "<span>Total Vendors</span>" +
      '<strong id="total-vendors">0</strong>' +
      "</article>" +
      '<article class="metric-card">' +
      "<span>Active Deliveries</span>" +
      '<strong id="active-deliveries">0</strong>' +
      "</article>" +
      '<article class="metric-card">' +
      "<span>Reliability Rate</span>" +
      '<strong id="reliability-rate">0%</strong>' +
      "</article>" +
      '<article class="metric-card metric-card-alert">' +
      "<span>Total Vendors</span>" +
      '<strong id="flagged-vendors">0</strong>' +
      "</article>" +
      "</section>"
    );
  };

  app.renderStatsSection = function renderStatsSection(elements, metrics) {
    elements.totalVendors.textContent = String(metrics.totalVendors);
    elements.activeDeliveries.textContent = String(metrics.activeDeliveries);
    elements.reliabilityRate.textContent = metrics.reliabilityRate;
    elements.flaggedVendors.textContent = String(metrics.flaggedVendors);
  };
})();
