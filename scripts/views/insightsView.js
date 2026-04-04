(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.createInsightsSectionView = function createInsightsSectionView() {
    return (
      '<section class="insights-grid">' +
      '<article class="insight-card insight-card-primary">' +
      '<div class="insight-card-head">' +
      "<h2>Supplier Performance Overview</h2>" +
      "</div>" +
      '<p id="performance-summary"></p>' +
      '<button class="insight-btn insight-btn-light" type="button">View Audit Report</button>' +
      "</article>" +
      '<article class="insight-card insight-card-secondary">' +
      '<div class="mini-badge" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24">' +
      '<path d="M12 4.5 8 6v4c0 3.1 1.8 6 4 7.5 2.2-1.5 4-4.4 4-7.5V6l-4-1.5Z" />' +
      '<path d="M10.5 11.5 12 13l2.5-2.5" />' +
      "</svg>" +
      "</div>" +
      "<h2>New Onboarding</h2>" +
      '<p id="onboarding-summary"></p>' +
      '<button class="insight-btn insight-btn-dark" type="button">Review Applications</button>' +
      "</article>" +
      "</section>"
    );
  };

  app.renderInsightsSection = function renderInsightsSection(elements, overview) {
    elements.performanceSummary.textContent = overview.performanceSummary;
    elements.onboardingSummary.textContent = overview.onboardingSummary;
  };
})();
