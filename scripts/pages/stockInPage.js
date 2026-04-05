(function () {
  const state = {
    selectedProduct: null,
    quantity: 1,
    supplierId: "",
    zoneId: "",
    receivedDate: new Date().toISOString().split("T")[0],
    notes: "",
    currentUser: null
  };

  function updateSummaryUI(shell) {
    const clerkElem = document.getElementById("summary-clerk");
    const valueElem = document.getElementById("summary-value");
    const utilizationElem = document.getElementById("summary-utilization");

    if (clerkElem && state.currentUser) {
      clerkElem.textContent = state.currentUser.full_name || state.currentUser.username;
    }

    if (valueElem) {
      const price = 10; 
      const total = state.quantity * price;
      valueElem.textContent = "$" + total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (utilizationElem) {
      const space = (state.quantity * 0.0015).toFixed(2);
      utilizationElem.textContent = space + "m³";
    }
  }

  function updateProductUI(product, shell) {
    if (!product) return;
    state.selectedProduct = product;

    const cardTitle = document.querySelector("h4.font-manrope.font-bold");
    if (cardTitle) cardTitle.textContent = product.name;

    const categoryBadge = document.querySelector(".px-2.5.py-0.5.rounded-full");
    if (categoryBadge) categoryBadge.textContent = (product.category && product.category.name) || "General";

    const img = document.querySelector(".w-24.h-24 img");
    if (img && product.imageUrl) img.src = product.imageUrl;

    const stockStats = document.querySelectorAll(".text-sm.font-bold.text-cyan-900");
    if (stockStats.length >= 1 && product.stock) {
      stockStats[0].textContent = shell.formatNumber(product.stock.quantityOnHand || 0) + " Units";
    }
    if (stockStats.length >= 2 && product.unit) {
      stockStats[1].textContent = product.unit.name + " (" + product.unit.symbol + ")";
    }

    updateSummaryUI(shell);
  }

  async function loadRecentTransactions(api) {
    const listContainer = document.getElementById("recent-transactions-list");
    if (!listContainer) return;

    try {
      const response = await api.listStockIns({ limit: 5 });
      const transactions = response.data || [];
      
      if (transactions.length === 0) {
        listContainer.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400 text-sm">No transactions yet.</td></tr>`;
        return;
      }

      listContainer.innerHTML = transactions.map(t => {
        const date = new Date(t.receivedDate).toLocaleDateString();
        const itemCount = t.items ? t.items.length : 0;
        const statusClass = t.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
        
        return `
          <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4 text-xs font-bold text-primary">#${t.code}</td>
            <td class="px-6 py-4 text-xs font-semibold text-slate-600">${t.supplier ? t.supplier.name : 'N/A'}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${date}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${itemCount} Items</td>
            <td class="px-6 py-4 text-right">
              <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusClass}">${t.status}</span>
            </td>
          </tr>
        `;
      }).join('');

    } catch (err) {
      console.error("Failed to load transactions:", err);
      listContainer.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-400 text-sm">Error loading transactions.</td></tr>`;
    }
  }

  async function initializeStockInPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) return;

    state.currentUser = await shell.initializeProtectedPage();
    if (!state.currentUser) return;

    // 1. Setup Elements
    const skuInput = document.getElementById("stock-in-sku");
    const qtyInput = document.getElementById("stock-in-quantity");
    const qtyPlus = document.getElementById("qty-plus");
    const qtyMinus = document.getElementById("qty-minus");
    const supplierSelect = document.getElementById("stock-in-supplier-id");
    const locationSelect = document.getElementById("stock-in-location");
    const dateInput = document.getElementById("stock-in-date");
    const notesInput = document.getElementById("stock-in-notes");
    const submitBtn = document.getElementById("stock-in-submit");

    // Initialize UI
    if (dateInput) {
      dateInput.value = state.receivedDate;
      dateInput.addEventListener("change", (e) => state.receivedDate = e.target.value);
    }
    updateSummaryUI(shell);
    loadRecentTransactions(api);

    // 2. Fetch Real Data for Selects
    try {
      const suppliers = await api.listSuppliers();
      if (supplierSelect) {
        suppliers.forEach(s => {
          const opt = document.createElement("option");
          opt.value = s.id;
          opt.textContent = s.name;
          supplierSelect.appendChild(opt);
        });
        supplierSelect.addEventListener("change", (e) => state.supplierId = e.target.value);
      }

      const warehouseResult = await api.getWarehouses();
      const warehouses = warehouseResult.data || [];
      if (locationSelect) {
        warehouses.forEach(w => {
          if (w.zones && w.zones.length > 0) {
            const group = document.createElement("optgroup");
            group.label = w.name;
            w.zones.forEach(z => {
              const opt = document.createElement("option");
              opt.value = z.id;
              opt.textContent = `${z.name} (${z.code})`;
              group.appendChild(opt);
            });
            locationSelect.appendChild(group);
          }
        });
        locationSelect.addEventListener("change", (e) => state.zoneId = e.target.value);
      }
    } catch (err) {
      console.error("Failed to load reference data:", err);
    }

    // 2. SKU Search
    if (skuInput) {
      skuInput.addEventListener("change", async (e) => {
        const sku = e.target.value.trim();
        if (!sku) return;

        try {
          const result = await api.getStocks({ keyword: sku });
          const stocks = result.data.stocks || [];
          if (stocks.length > 0) {
            updateProductUI(stocks[0].product, shell);
          } else {
            window.alert("No product found with SKU: " + sku);
          }
        } catch (err) {
          console.error("Search error:", err);
        }
      });
    }

    // 3. Quantity Controls
    if (qtyInput) {
      qtyInput.addEventListener("change", (e) => {
        state.quantity = parseInt(e.target.value) || 1;
        updateSummaryUI(shell);
      });
      if (qtyPlus) {
        qtyPlus.addEventListener("click", () => {
          state.quantity++;
          qtyInput.value = state.quantity;
          updateSummaryUI(shell);
        });
      }
      if (qtyMinus) {
        qtyMinus.addEventListener("click", () => {
          if (state.quantity > 1) {
            state.quantity--;
            qtyInput.value = state.quantity;
            updateSummaryUI(shell);
          }
        });
      }
    }

    // 4. Submit Logic
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        if (!state.selectedProduct) {
          window.alert("Please search and select a product first.");
          return;
        }
        if (!state.supplierId) {
          window.alert("Please select a supplier.");
          return;
        }

        const originalText = submitBtn.innerHTML;
        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = "<span>Processing...</span>";

          const locationName = locationSelect.options[locationSelect.selectedIndex]?.text || "N/A";
          
          const createPayload = {
            supplier_id: state.supplierId,
            received_date: state.receivedDate,
            note: `${notesInput ? notesInput.value : ""}\nLocation: ${locationName}`.trim(),
            items: [
              {
                product_id: state.selectedProduct.id,
                quantity: state.quantity,
                unit_price: 10
              }
            ]
          };

          const createResult = await api.createStockIn(createPayload);
          if (!createResult.success) throw new Error(createResult.message || "Failed to create record");

          const stockInId = createResult.data.id;
          const confirmResult = await api.confirmStockIn(stockInId);
          if (!confirmResult.success) throw new Error(confirmResult.message || "Failed to confirm record");

          window.alert("Stock In successful! Inventory has been updated.");
          
          // Clear inputs and reload transactions instead of reloading page
          skuInput.value = "";
          qtyInput.value = "1";
          state.quantity = 1;
          state.selectedProduct = null;
          if (notesInput) notesInput.value = "";
          
          loadRecentTransactions(api);
          updateSummaryUI(shell);
          
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;

        } catch (err) {
          console.error("Stock in error:", err);
          window.alert("ERROR: " + err.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initializeStockInPage);
})();
