(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  app.filterModes = [
    {
      id: "all",
      label: "All",
      summary: "Showing every supplier currently monitored.",
      predicate: function () {
        return true;
      }
    },
    {
      id: "live",
      label: "Live",
      summary: "Showing suppliers with active deliveries in transit or processing.",
      predicate: function (supplier) {
        return supplier.status === "In Transit" || supplier.status === "Processing";
      }
    },
    {
      id: "flagged",
      label: "Flagged",
      summary: "Showing suppliers that need immediate follow-up before the next shipment.",
      predicate: function (supplier) {
        return supplier.flagged;
      }
    }
  ];
})();
