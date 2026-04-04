(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  function getStatusClass(status) {
    return "status-" + status.toLowerCase().replace(/\s+/g, "-");
  }

  function getActionLabel(status) {
    if (status === "Delayed") {
      return "Review";
    }

    if (status === "Pending") {
      return "Confirm";
    }

    return "Track";
  }

  function renderPagination(container, tableState) {
    if (tableState.totalPages <= 1) {
      container.innerHTML = "";
      return;
    }

    const pageButtons = Array.from({ length: tableState.totalPages }, function (_, index) {
      const page = index + 1;

      return (
        '<button class="page-btn' +
        (page === tableState.currentPage ? " active" : "") +
        '" type="button" data-page="' +
        page +
        '">' +
        page +
        "</button>"
      );
    }).join("");

    container.innerHTML =
      '<button class="page-btn" type="button" data-page="prev"' +
      (tableState.currentPage === 1 ? " disabled" : "") +
      ">" +
      "&lt;" +
      "</button>" +
      pageButtons +
      '<button class="page-btn" type="button" data-page="next"' +
      (tableState.currentPage === tableState.totalPages ? " disabled" : "") +
      ">" +
      "&gt;" +
      "</button>";
  }

  app.createSupplierTableSectionView = function createSupplierTableSectionView() {
    return (
      '<section class="panel panel-table">' +
      '<div class="panel-head">' +
      "<div>" +
      "<h2>Supplier Activity</h2>" +
      '<p id="filter-summary">Showing every supplier currently monitored.</p>' +
      "</div>" +
      "</div>" +
      '<div class="table-wrap">' +
      "<table>" +
      "<thead>" +
      "<tr>" +
      "<th>Partner Organization</th>" +
      "<th>Point of Contact</th>" +
      "<th>Status</th>" +
      "<th>Next Delivery</th>" +
      "<th>Actions</th>" +
      "</tr>" +
      "</thead>" +
      '<tbody id="supplier-table-body"></tbody>' +
      "</table>" +
      "</div>" +
      '<div class="table-footer">' +
      '<p id="results-summary">Showing 1 to 4 of 24 suppliers</p>' +
      '<div class="pagination" id="pagination" aria-label="Pagination"></div>' +
      "</div>" +
      "</section>"
    );
  };

  app.renderSupplierTable = function renderSupplierTable(elements, tableState) {
    elements.filterSummary.textContent = tableState.filter.summary;

    if (tableState.visibleSuppliers.length === 0) {
      elements.supplierTableBody.innerHTML =
        "<tr><td colspan=\"5\">No suppliers match the selected filter.</td></tr>";
      elements.resultsSummary.textContent = "Showing 0 of 0 suppliers";
      elements.pagination.innerHTML = "";
      return;
    }

    elements.supplierTableBody.innerHTML = tableState.visibleSuppliers
      .map(function (supplier) {
        return (
          "<tr>" +
          "<td>" +
          '<div class="partner-cell">' +
          '<span class="partner-mark">' +
          supplier.initials +
          "</span>" +
          "<div>" +
          '<span class="partner-name">' +
          supplier.organization +
          "</span>" +
          '<span class="partner-meta">' +
          supplier.segment +
          "</span>" +
          "</div>" +
          "</div>" +
          "</td>" +
          "<td>" +
          '<div class="contact-cell">' +
          "<div>" +
          '<span class="contact-name">' +
          supplier.contact +
          "</span>" +
          '<span class="contact-role">' +
          supplier.role +
          "</span>" +
          "</div>" +
          "</div>" +
          "</td>" +
          "<td>" +
          '<span class="status-pill ' +
          getStatusClass(supplier.status) +
          '">' +
          supplier.status +
          "</span>" +
          "</td>" +
          "<td>" +
          '<span class="delivery-date' +
          (supplier.flagged ? " delivery-link" : "") +
          '">' +
          supplier.nextDelivery +
          "</span>" +
          '<span class="delivery-meta">' +
          supplier.eta +
          "</span>" +
          "</td>" +
          "<td>" +
          '<button class="row-link" type="button" aria-label="' +
          getActionLabel(supplier.status) +
          " " +
          supplier.organization +
          '">' +
          getActionLabel(supplier.status) +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M6 12h12M13 7l5 5-5 5" />' +
          "</svg>" +
          "</button>" +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    const start = (tableState.currentPage - 1) * tableState.pageSize + 1;
    const end = start + tableState.visibleSuppliers.length - 1;
    const summaryTotal =
      tableState.filter.id === "all"
        ? tableState.directorySize
        : tableState.filteredSuppliers.length;

    elements.resultsSummary.textContent =
      "Showing " + start + " to " + end + " of " + summaryTotal + " suppliers";

    renderPagination(elements.pagination, tableState);
  };
})();
