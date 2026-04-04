(function () {
  function renderMovementChart(series) {
    const chartRoot = document.getElementById("dashboard-movement-chart");
    if (!chartRoot) {
      return;
    }

    const recentSeries = (series || []).slice(-7);
    if (recentSeries.length === 0) {
      chartRoot.innerHTML =
        '<div class="flex h-full items-center justify-center text-sm text-slate-400">No movement data available.</div>';
      return;
    }

    const maxValue = recentSeries.reduce(function (currentMax, item) {
      return Math.max(
        currentMax,
        Number(item.in && item.in.totalQty) || 0,
        Number(item.out && item.out.totalQty) || 0
      );
    }, 1);

    chartRoot.innerHTML = recentSeries
      .map(function (item) {
        const inbound = Number(item.in && item.in.totalQty) || 0;
        const outbound = Number(item.out && item.out.totalQty) || 0;
        const inboundHeight = Math.max(8, Math.round((inbound / maxValue) * 100));
        const outboundHeight = Math.max(8, Math.round((outbound / maxValue) * 100));
        const label = String(item.period || "").slice(5);

        return (
          '<div class="flex-1 flex flex-col items-center gap-2 relative z-10">' +
          '<div class="w-full flex justify-center gap-1 items-end h-full">' +
          '<div class="w-4 bg-primary rounded-t-sm" style="height:' +
          inboundHeight +
          '%"></div>' +
          '<div class="w-4 bg-secondary rounded-t-sm" style="height:' +
          outboundHeight +
          '%"></div>' +
          "</div>" +
          '<span class="text-[10px] font-bold text-secondary">' +
          label +
          "</span>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderActivities(dashboardData, lowStockData, shell) {
    const activityRoot = document.getElementById("dashboard-activities");
    if (!activityRoot) {
      return;
    }

    const topIn = (dashboardData.topStockIn || []).slice(0, 2).map(function (item) {
      const totalQty = Number(
        item.totalQty || (item.dataValues && item.dataValues.totalQty) || 0
      );

      return {
        iconClass: "bg-cyan-100 text-cyan-800",
        iconName: "move_to_inbox",
        title:
          "Stock In: " +
          shell.escapeHtml((item.product && item.product.name) || "Inventory item"),
        time: "This month",
        description:
          shell.formatNumber(totalQty) +
          " units received"
      };
    });

    const lowStockActivities = (lowStockData.stocks || []).slice(0, 1).map(function (item) {
      const quantity = Number(item.quantityOnHand || item.quantity_on_hand || 0);
      return {
        iconClass: "bg-error-container text-error",
        iconName: "warning",
        title:
          "Low Stock Alert: " +
          shell.escapeHtml((item.product && item.product.name) || "Product"),
        time: "Live",
        description:
          "Current stock is " +
          shell.formatNumber(quantity) +
          " units"
      };
    });

    const topOut = (dashboardData.topStockOut || []).slice(0, 1).map(function (item) {
      const totalQty = Number(
        item.totalQty || (item.dataValues && item.dataValues.totalQty) || 0
      );

      return {
        iconClass: "bg-secondary-container text-on-secondary-container",
        iconName: "outbox",
        title:
          "Stock Out: " +
          shell.escapeHtml((item.product && item.product.name) || "Inventory item"),
        time: "This month",
        description:
          shell.formatNumber(totalQty) +
          " units issued"
      };
    });

    const activities = topIn.concat(lowStockActivities, topOut);

    activityRoot.innerHTML = activities
      .map(function (activity) {
        return (
          '<div class="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">' +
          '<div class="mt-1 w-8 h-8 rounded-full flex items-center justify-center ' +
          activity.iconClass +
          '">' +
          '<span class="material-symbols-outlined text-sm">' +
          activity.iconName +
          "</span>" +
          "</div>" +
          '<div class="flex-1">' +
          '<div class="flex items-center justify-between">' +
          '<h5 class="text-sm font-bold">' +
          activity.title +
          "</h5>" +
          '<span class="text-[10px] text-secondary font-medium uppercase tracking-tight">' +
          activity.time +
          "</span>" +
          "</div>" +
          '<p class="text-sm text-secondary mt-1">' +
          activity.description +
          "</p>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  async function initializeDashboardPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) {
      return;
    }

    const currentUser = await shell.initializeProtectedPage();
    if (!currentUser) {
      return;
    }

    const [dashboardPayload, lowStockPayload, suppliersPayload, chartPayload] =
      await Promise.all([
        api.getDashboardReport(),
        api.getLowStocks({ limit: 5, offset: 0 }),
        api.listSuppliersPage({ page: 1, limit: 1 }),
        api.getStockMovementChart({ groupBy: "day" })
      ]);

    const dashboardData = dashboardPayload.data || {};
    const overview = dashboardData.overview || {};
    const monthSummary = dashboardData.thisMonth || {};
    const suppliersMeta = suppliersPayload.meta || {};
    const lowStockData = lowStockPayload.data || {};

    document.getElementById("dashboard-total-products").textContent =
      shell.formatNumber(overview.totalProducts);
    document.getElementById("dashboard-total-products-caption").textContent =
      shell.formatNumber(overview.totalStockOnHand) + " units currently on hand";

    document.getElementById("dashboard-low-stock").textContent =
      shell.formatNumber(overview.lowStockCount);
    document.getElementById("dashboard-low-stock-caption").textContent =
      "Products that need immediate review";

    document.getElementById("dashboard-suppliers").textContent =
      shell.formatNumber(suppliersMeta.totalItems);
    document.getElementById("dashboard-suppliers-caption").textContent =
      "Active supplier profiles in the network";

    document.getElementById("dashboard-stock-in-amount").textContent =
      shell.formatCurrency(monthSummary.stockIn && monthSummary.stockIn.totalAmount);
    document.getElementById("dashboard-stock-in-caption").textContent =
      "Inbound value for " + (monthSummary.label || "this month");

    renderMovementChart((chartPayload.data && chartPayload.data.series) || []);
    renderActivities(dashboardData, lowStockData, shell);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeDashboardPage().catch(function (error) {
      console.error(error);
    });
  });
})();
