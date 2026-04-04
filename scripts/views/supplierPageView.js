(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.createSupplierPageView = function createSupplierPageView() {
    return [
      app.createPageHeaderView(),
      app.createStatsSectionView(),
      app.createSupplierTableSectionView(),
      app.createInsightsSectionView()
    ].join("");
  };
})();
