(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.createSupplierStore = function createSupplierStore(config) {
    const suppliers = config.suppliers;
    const filterModes = config.filterModes;
    const dashboardSnapshot = config.dashboardSnapshot;
    const pageSize = config.pageSize;
    let currentPage = 1;
    let currentFilterIndex = 0;

    function getCurrentFilter() {
      return filterModes[currentFilterIndex];
    }

    function getFilteredSuppliers() {
      return suppliers.filter(getCurrentFilter().predicate);
    }

    function getTotalPages() {
      return Math.ceil(getFilteredSuppliers().length / pageSize);
    }

    function getVisibleSuppliers() {
      const filteredSuppliers = getFilteredSuppliers();
      const start = (currentPage - 1) * pageSize;

      return filteredSuppliers.slice(start, start + pageSize);
    }

    function getMetrics() {
      return {
        totalVendors: dashboardSnapshot.totalVendors,
        activeDeliveries: dashboardSnapshot.activeDeliveries,
        reliabilityRate: dashboardSnapshot.reliabilityRate,
        flaggedVendors: dashboardSnapshot.flaggedVendors
      };
    }

    function getOverview() {
      return {
        performanceSummary:
          "Our automated auditing system has flagged " +
          dashboardSnapshot.auditHighlights +
          " vendors with exceptional fulfillment rates this quarter. Consider expanding their SKU allocation.",
        onboardingSummary:
          "You have " +
          dashboardSnapshot.reviewApplications +
          " supplier applications awaiting review for the \"Frozen Goods\" category."
      };
    }

    function getTableState() {
      return {
        filter: getCurrentFilter(),
        filteredSuppliers: getFilteredSuppliers(),
        visibleSuppliers: getVisibleSuppliers(),
        currentPage: currentPage,
        totalPages: getTotalPages(),
        pageSize: pageSize,
        directorySize: dashboardSnapshot.totalVendors
      };
    }

    function nextFilter() {
      currentFilterIndex = (currentFilterIndex + 1) % filterModes.length;
      currentPage = 1;
    }

    function setPage(nextPage) {
      const totalPages = Math.max(1, getTotalPages());
      currentPage = Math.min(Math.max(nextPage, 1), totalPages);
    }

    function getCurrentPage() {
      return currentPage;
    }

    function getExportRows() {
      const filteredSuppliers = getFilteredSuppliers();
      const rows = [
        ["Organization", "Segment", "Contact", "Role", "Status", "Next Delivery", "Notes"]
      ];

      filteredSuppliers.forEach(function (supplier) {
        rows.push([
          supplier.organization,
          supplier.segment,
          supplier.contact,
          supplier.role,
          supplier.status,
          supplier.nextDelivery,
          supplier.eta
        ]);
      });

      return rows;
    }

    return {
      getCurrentFilter: getCurrentFilter,
      getCurrentPage: getCurrentPage,
      getMetrics: getMetrics,
      getOverview: getOverview,
      getTableState: getTableState,
      getExportRows: getExportRows,
      nextFilter: nextFilter,
      setPage: setPage
    };
  };
})();
