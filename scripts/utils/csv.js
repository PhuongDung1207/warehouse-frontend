(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  function escapeCsv(value) {
    return '"' + String(value).replace(/"/g, '""') + '"';
  }

  app.downloadCsv = function downloadCsv(filename, rows) {
    const csv = rows
      .map(function (row) {
        return row.map(escapeCsv).join(",");
      })
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };
})();
