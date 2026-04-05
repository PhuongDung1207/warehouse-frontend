(function () {
  let trendChart = null;
  let categoryChart = null;

  function destroyCharts() {
    if (window.Chart && typeof window.Chart.getChart === "function") {
      const existingTrendChart = window.Chart.getChart("trendChart");
      const existingCategoryChart = window.Chart.getChart("categoryChart");

      if (existingTrendChart) {
        existingTrendChart.destroy();
      }

      if (existingCategoryChart) {
        existingCategoryChart.destroy();
      }
    }

    if (trendChart) {
      trendChart.destroy();
      trendChart = null;
    }

    if (categoryChart) {
      categoryChart.destroy();
      categoryChart = null;
    }
  }

  function buildCategoryChartData(stockRows) {
    const totals = {};

    (stockRows || []).forEach(function (row) {
      const categoryName =
        (row.product && row.product.category && row.product.category.name) ||
        "Uncategorized";
      const quantity = Number(row.quantityOnHand || row.quantity_on_hand || 0);
      totals[categoryName] = (totals[categoryName] || 0) + quantity;
    });

    return Object.keys(totals)
      .map(function (categoryName) {
        return { name: categoryName, quantity: totals[categoryName] };
      })
      .sort(function (left, right) {
        return right.quantity - left.quantity;
      })
      .slice(0, 4);
  }

  function renderCharts(chartSeries, stockRows) {
    const trendContext = document.getElementById("trendChart").getContext("2d");
    const categoryContext = document.getElementById("categoryChart").getContext("2d");
    const labels = (chartSeries || []).map(function (item) {
      return item.period;
    });
    const inboundValues = (chartSeries || []).map(function (item) {
      return Number(item.in && item.in.totalQty) || 0;
    });
    const outboundValues = (chartSeries || []).map(function (item) {
      return Number(item.out && item.out.totalQty) || 0;
    });
    const categoryData = buildCategoryChartData(stockRows);

    destroyCharts();

    trendChart = new window.Chart(trendContext, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Inbound",
            data: inboundValues,
            borderColor: "#004f69",
            backgroundColor: "rgba(0, 79, 105, 0.1)",
            tension: 0.35,
            fill: true
          },
          {
            label: "Outbound",
            data: outboundValues,
            borderColor: "#536167",
            borderDash: [6, 4],
            tension: 0.35,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" }
        }
      }
    });

    categoryChart = new window.Chart(categoryContext, {
      type: "doughnut",
      data: {
        labels: categoryData.map(function (item) {
          return item.name;
        }),
        datasets: [
          {
            data: categoryData.map(function (item) {
              return item.quantity;
            }),
            backgroundColor: ["#004f69", "#1a6886", "#8dcff2", "#e1e3e4"],
            borderWidth: 0
          }
        ]
      },
      options: {
        cutout: "70%",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  async function initializeReportsPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell || !window.Chart) {
      return;
    }

    const currentUser = await shell.initializeProtectedPage();
    if (!currentUser) {
      return;
    }

    const results = await Promise.allSettled([
      api.getStockSummary({ limit: 100, offset: 0 }),
      api.getStockInSummary({ limit: 20, offset: 0 }),
      api.getStockOutSummary({ limit: 20, offset: 0 }),
      api.getStockMovementChart({ groupBy: "week" })
    ]);

    const stockSummaryPayload = results[0].status === "fulfilled" ? results[0].value : { data: {} };
    const stockInPayload = results[1].status === "fulfilled" ? results[1].value : { data: {} };
    const stockOutPayload = results[2].status === "fulfilled" ? results[2].value : { data: {} };
    const chartPayload = results[3].status === "fulfilled" ? results[3].value : { data: {} };

    const stockSummary = stockSummaryPayload.data || {};
    const stockInSummary = stockInPayload.data || {};
    const stockOutSummary = stockOutPayload.data || {};
    const stockRows = stockSummary.stocks || [];
    const categoryTotals = buildCategoryChartData(stockRows);

    document.getElementById("reports-inbound-qty").textContent =
      shell.formatNumber(stockInSummary.summary && stockInSummary.summary.totalQty);
    document.getElementById("reports-outbound-qty").textContent =
      shell.formatNumber(stockOutSummary.summary && stockOutSummary.summary.totalQty);
    document.getElementById("reports-top-category").textContent =
      (categoryTotals[0] && categoryTotals[0].name) || "No data";
    document.getElementById("reports-top-category-caption").textContent =
      (categoryTotals[0] ? shell.formatNumber(categoryTotals[0].quantity) : "0") +
      " units currently in stock";
    document.getElementById("reports-on-hand").textContent =
      shell.formatNumber(stockSummary.summary && stockSummary.summary.totalOnHand);
    document.getElementById("reports-on-hand-caption").textContent =
      shell.formatNumber(stockSummary.summary && stockSummary.summary.totalAvailable) +
      " units available";

    renderCharts((chartPayload.data && chartPayload.data.series) || [], stockRows);

    document
      .getElementById("reports-export-pdf")
      .addEventListener("click", function () {
        api
          .download("/api/v1/reports/stock-summary/export", {
            query: { format: "pdf" },
            filename: "stock-summary.pdf"
          })
          .catch(function (error) {
            window.alert(error.message || "Unable to export PDF.");
          });
      });

    document
      .getElementById("reports-export-excel")
      .addEventListener("click", function () {
        api
          .download("/api/v1/reports/stock-summary/export", {
            query: { format: "excel" },
            filename: "stock-summary.xlsx"
          })
          .catch(function (error) {
            window.alert(error.message || "Unable to export Excel.");
          });
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeReportsPage().catch(function (error) {
      console.error(error);
    });
  });
})();
