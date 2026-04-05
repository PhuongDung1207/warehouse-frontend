(function () {
  const state = {
    categories: [],
    units: [],
    currentUser: null,
    query: {
      categoryId: "",
      keyword: "",
      limit: 20,
      offset: 0
    },
    stockRows: []
  };
  const MOCK_CATEGORIES = [
    { id: 1, name: "Bearings" },
    { id: 2, name: "Fluids" },
    { id: 3, name: "Machinery" },
    { id: 4, name: "Electrical" },
    { id: 5, name: "Packaging" }
  ];
  const MOCK_UNITS = [
    { id: 1, name: "Pieces", symbol: "pcs" },
    { id: 2, name: "Liters", symbol: "L" },
    { id: 3, name: "Units", symbol: "unit" },
    { id: 4, name: "Boxes", symbol: "box" },
    { id: 5, name: "Kilograms", symbol: "kg" }
  ];

  function getStatusMarkup(quantity, minLevel) {
    if (quantity <= minLevel) {
      return '<span class="inline-flex py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide bg-error-container text-on-error-container">LOW STOCK</span>';
    }

    return '<span class="inline-flex py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide bg-primary-fixed-dim text-on-primary-fixed">OPTIMAL</span>';
  }

  function createStockRow(row, shell) {
    const product = row.product || {};
    const category = product.category || {};
    const unit = product.unit || {};
    const quantity = Number(row.quantityOnHand || row.quantity_on_hand || 0);
    const minLevel = Number(product.minStockLevel || product.min_stock_level || 0);

    return (
      "<tr class=\"hover:bg-slate-50 transition-colors\">" +
      "<td class=\"p-4\">" +
      "<p class=\"font-bold text-on-surface\">" +
      shell.escapeHtml(product.name || "Unnamed product") +
      "</p>" +
      "<p class=\"text-xs text-secondary mt-0.5\">SKU: " +
      shell.escapeHtml(product.sku || "N/A") +
      "</p>" +
      "</td>" +
      "<td class=\"p-4 text-secondary\">" +
      shell.escapeHtml(category.name || "Uncategorized") +
      "</td>" +
      "<td class=\"p-4 text-secondary\">" +
      shell.formatNumber(minLevel) +
      " min</td>" +
      "<td class=\"p-4 text-right font-bold font-headline\">" +
      shell.formatNumber(quantity) +
      ' <span class="text-xs font-normal text-slate-400">' +
      shell.escapeHtml(unit.symbol || unit.name || "units") +
      "</span></td>" +
      "<td class=\"p-4 text-center\">" +
      getStatusMarkup(quantity, minLevel) +
      "</td>" +
      "<td class=\"p-4 text-secondary\">" +
      shell.formatDate(row.updatedAt || row.updated_at) +
      "</td>" +
      '<td class="p-4 text-right"><button class="text-primary hover:bg-surface p-2 rounded-lg transition-colors" type="button"><span class="material-symbols-outlined text-[20px]">inventory</span></button></td>' +
      "</tr>"
    );
  }

  function renderStocktakeItems(shell) {
    const itemsRoot = document.getElementById("inventory-stocktake-items");
    if (!itemsRoot) return;

    const candidateRows = state.stockRows.slice(0, 5);
    itemsRoot.innerHTML = candidateRows
      .map(function (row) {
        // ... (kế thừa logic cũ nhưng bọc trong check itemsRoot)
        const product = row.product || {};
        const quantity = Number(row.quantityOnHand || row.quantity_on_hand || 0);

        return (
          '<div class="p-4 border-b last:border-b-0 border-slate-50 flex items-center justify-between gap-4">' +
          "<div>" +
          '<p class="font-bold text-sm">' +
          shell.escapeHtml(product.name || "Unnamed product") +
          "</p>" +
          '<p class="text-xs text-secondary">SKU: ' +
          shell.escapeHtml(product.sku || "N/A") +
          "</p>" +
          "</div>" +
          '<div class="flex items-center gap-3">' +
          '<span class="text-secondary font-medium">' +
          shell.formatNumber(quantity) +
          "</span>" +
          '<span class="material-symbols-outlined text-sm text-slate-300">arrow_forward</span>' +
          '<input class="w-20 bg-surface-container-low border-none rounded-lg p-2 text-center text-sm font-bold focus:ring-2 focus:ring-primary/30 transition-all outline-none" min="0" step="1" type="number" value="' +
          quantity +
          '" data-product-id="' +
          product.id +
          '" />' +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderInventoryTable(stockData, shell) {
    const tbody = document.getElementById("inventory-table-body");
    const stocks = stockData.stocks || [];
    const total = Number(stockData.total || 0);

    state.stockRows = stocks;

    if (stocks.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="p-6 text-center text-slate-400">No inventory data matched the current filters.</td></tr>';
    } else {
      tbody.innerHTML = stocks.map(function (row) {
        return createStockRow(row, shell);
      }).join("");
    }

    const summaryEl = document.getElementById("inventory-table-summary");
    if (summaryEl) {
      summaryEl.textContent =
        "Showing " +
        shell.formatNumber(stocks.length) +
        " of " +
        shell.formatNumber(total) +
        " items";
    }

    renderStocktakeItems(shell);
  }

  function renderCategoryFilter(categories) {
    const select = document.getElementById("inventory-category-filter");
    if (select) {
      const options = ['<option value="">All Categories</option>']
        .concat(
          categories.map(function (category) {
            return (
              '<option value="' +
              category.id +
              '">' +
              category.name +
              "</option>"
            );
          })
        )
        .join("");

      select.innerHTML = options;
      select.value = state.query.categoryId || "";
    }
  }

  function renderProductFormOptions() {
    const categorySelect = document.getElementById("product-category");
    const unitSelect = document.getElementById("product-unit");

    if (categorySelect) {
      categorySelect.innerHTML = ['<option value="">Choose category</option>']
        .concat(
          state.categories.map(function (category) {
            return (
              '<option value="' +
              category.id +
              '">' +
              category.name +
              "</option>"
            );
          })
        )
        .join("");
    }

    if (unitSelect) {
      unitSelect.innerHTML = ['<option value="">Choose unit</option>']
        .concat(
          state.units.map(function (unit) {
            return (
              '<option value="' +
              unit.id +
              '">' +
              shellEscape(unit.name || unit.symbol || ("Unit #" + unit.id)) +
              "</option>"
            );
          })
        )
        .join("");
    }
  }

  function shellEscape(value) {
    const shell = window.WarehouseShell && window.WarehouseShell.shell;
    return shell ? shell.escapeHtml(value) : String(value || "");
  }

  function setProductFormFeedback(message, tone) {
    const feedback = document.getElementById("product-form-feedback");

    if (!feedback) {
      return;
    }

    if (!message) {
      feedback.className = "hidden rounded-lg px-4 py-3 text-sm font-medium";
      feedback.textContent = "";
      return;
    }

    feedback.className =
      "rounded-lg px-4 py-3 text-sm font-medium " +
      (tone === "error"
        ? "bg-error-container/60 text-on-error-container"
        : "bg-primary-fixed text-on-primary-fixed");
    feedback.textContent = message;
  }

  function closeProductModal() {
    const modal = document.getElementById("product-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  function resetProductForm() {
    const form = document.getElementById("product-form");
    if (!form) {
      return;
    }

    form.reset();
    document.getElementById("product-min-stock").value = "0";
    document.getElementById("product-status").value = "active";
    setProductFormFeedback("", "");
  }

  async function loadInventoryData(api, shell) {
    const results = await Promise.allSettled([
      api.getStocks(state.query),
      api.getLowStocks({ limit: 1, offset: 0 }),
      api.getDashboardReport(),
      api.listCategories({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }),
      api.listUnits({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" })
    ]);

    const stocksPayload =
      results[0].status === "fulfilled" ? results[0].value : { data: { stocks: [], total: 0 } };
    const lowStockPayload =
      results[1].status === "fulfilled" ? results[1].value : { data: { total: 0 } };
    const dashboardPayload =
      results[2].status === "fulfilled"
        ? results[2].value
        : { data: { overview: { pendingStockChecks: 0 } } };
    const categoriesPayload =
      results[3].status === "fulfilled" ? results[3].value : { data: [] };
    const unitsPayload =
      results[4].status === "fulfilled" ? results[4].value : { data: [] };

    const stocksData = stocksPayload.data || {};
    const lowStockData = lowStockPayload.data || {};
    const dashboardData = dashboardPayload.data || {};
    const categories =
      (categoriesPayload && Array.isArray(categoriesPayload.data) && categoriesPayload.data.length > 0)
        ? categoriesPayload.data
        : MOCK_CATEGORIES;

    const units =
      (unitsPayload && Array.isArray(unitsPayload.data) && unitsPayload.data.length > 0)
        ? unitsPayload.data
        : MOCK_UNITS;

    state.categories = categories;
    state.units = units;

    const totalSkusEl = document.getElementById("inventory-total-skus");
    const lowStockEl = document.getElementById("inventory-low-stock");
    const pendingChecksEl = document.getElementById("inventory-pending-checks");
    const auditorNameEl = document.getElementById("inventory-auditor-name");

    if (totalSkusEl) totalSkusEl.textContent = shell.formatNumber(stocksData.total);
    if (lowStockEl) lowStockEl.textContent = shell.formatNumber(lowStockData.total);
    if (pendingChecksEl) {
      pendingChecksEl.textContent = shell.formatNumber(
        dashboardData.overview && dashboardData.overview.pendingStockChecks
      );
    }
    if (auditorNameEl) {
      auditorNameEl.value =
        (state.currentUser && (state.currentUser.fullName || state.currentUser.username)) ||
        "Warehouse User";
    }

    renderCategoryFilter(categories);
    renderProductFormOptions();
    renderInventoryTable(stocksData, shell);
  }

  async function handleProductSubmit(event, api, shell) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = document.getElementById("product-submit-button");
    const formData = new FormData(form);
    const payload = {
      sku: String(formData.get("sku") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      categoryId: Number(formData.get("categoryId")),
      unitId: Number(formData.get("unitId")),
      minStockLevel: Number(formData.get("minStockLevel") || 0),
      status: String(formData.get("status") || "active"),
      description: String(formData.get("description") || "").trim()
    };
    const imageUrl = String(formData.get("imageUrl") || "").trim();

    if (imageUrl) {
      payload.imageUrl = imageUrl;
    }

    submitButton.disabled = true;
    setProductFormFeedback("Saving product...", "success");

    try {
      await api.createProduct(payload);
      setProductFormFeedback("Product created successfully.", "success");
      await loadInventoryData(api, shell);
      window.setTimeout(function () {
        resetProductForm();
        closeProductModal();
      }, 600);
    } catch (error) {
      setProductFormFeedback(
        error.message || "Unable to create product.",
        "error"
      );
    } finally {
      submitButton.disabled = false;
    }
  }

  async function submitStocktake(api) {
    const inputs = Array.from(
      document.querySelectorAll("#inventory-stocktake-items input[data-product-id]")
    );
    const payload = {
      checkDate: new Date().toISOString(),
      note: "Stocktaking submitted from HTML inventory page",
      items: inputs.map(function (input) {
        return {
          productId: Number(input.getAttribute("data-product-id")),
          actualQty: Number(input.value)
        };
      })
    };

    await api.createStockCheck(payload);
    window.alert("Stocktake submitted successfully.");
    document.getElementById("stocktake-modal").classList.add("hidden");
  }

  async function initializeInventoryPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) {
      return;
    }

    state.currentUser = await shell.initializeProtectedPage();
    if (!state.currentUser) {
      return;
    }

    const searchInput = document.getElementById("inventory-search-input");
    const categoryFilter = document.getElementById("inventory-category-filter");
    const productForm = document.getElementById("product-form");
    const stocktakeModal = document.getElementById("stocktake-modal");
    let searchTimeout = null;

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        window.clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(function () {
          state.query.keyword = searchInput.value.trim();
          state.query.offset = 0;
          loadInventoryData(api, shell).catch(console.error);
        }, 250);
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", function () {
        state.query.categoryId = categoryFilter.value;
        state.query.offset = 0;
        loadInventoryData(api, shell).catch(console.error);
      });
    }

    window.submitStocktake = function () {
      submitStocktake(api).catch(function (error) {
        window.alert(error.message || "Unable to submit stocktake.");
      });
    };

    if (productForm) {
      productForm.addEventListener("submit", function (event) {
        handleProductSubmit(event, api, shell).catch(function (error) {
          setProductFormFeedback(
            error.message || "Unable to create product.",
            "error"
          );
        });
      });
    }

    await loadInventoryData(api, shell);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeInventoryPage().catch(function (error) {
      console.error(error);
    });
  });
})();
