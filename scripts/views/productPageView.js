(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  app.createProductPageView = function createProductPageView() {
    return `
      <div class="product-page">
        ${app.createProductHeaderView()}
        ${app.createProductShowcaseView(app.featuredProducts)}
        ${app.createInventoryTableSectionView()}
      </div>
    `;
  };
})();
