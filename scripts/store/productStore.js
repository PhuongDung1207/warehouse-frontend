(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  app.createProductStore = function createProductStore(config) {
    const pageSize = config.pageSize;
    const inventoryBatches = config.inventoryBatches.slice();
    let currentPage = 1;

    function getTotalPages() {
      return Math.max(1, Math.ceil(inventoryBatches.length / pageSize));
    }

    return {
      setPage(page) {
        currentPage = Math.min(Math.max(page, 1), getTotalPages());
      },

      getTableState() {
        const totalPages = getTotalPages();
        const startIndex = (currentPage - 1) * pageSize;
        const visibleBatches = inventoryBatches.slice(startIndex, startIndex + pageSize);

        return {
          currentPage,
          pageSize,
          totalPages,
          totalItems: inventoryBatches.length,
          visibleBatches
        };
      }
    };
  };
})();
