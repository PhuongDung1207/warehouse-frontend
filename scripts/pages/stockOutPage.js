(function () {
  const state = {
    selectedProduct: null,
    quantity: 1,
    recipientName: "",
    issuedDate: new Date().toISOString().split("T")[0],
    notes: "",
    currentUser: null
  };

  function updateSummaryUI(shell) {
    const clerkElem = document.getElementById("summary-clerk");
    const dateElem = document.getElementById("summary-date");
    const valueElem = document.getElementById("summary-value");
    const utilizationElem = document.getElementById("summary-utilization");

    if (clerkElem && state.currentUser) {
      clerkElem.textContent = state.currentUser.full_name || state.currentUser.username;
    }

    if (dateElem) {
      dateElem.textContent = new Date(state.issuedDate).toLocaleDateString();
    }

    if (valueElem) {
      const price = 10; // Mock price
      const total = state.quantity * price;
      valueElem.textContent = "$" + total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (utilizationElem) {
      const space = (state.quantity * 0.0015).toFixed(2);
      utilizationElem.textContent = space + "m³";
    }
  }

  function updateProductUI(product, shell) {
    const preview = document.getElementById("product-preview");
    if (!product || !preview) return;

    state.selectedProduct = product;
    preview.classList.remove("hidden");

    document.getElementById("product-name").textContent = product.name;
    document.getElementById("product-category").textContent = (product.category && product.category.name) || "General";
    
    const img = document.getElementById("product-image");
    if (img && product.imageUrl) img.src = product.imageUrl;

    if (product.stock) {
      document.getElementById("product-stock").textContent = shell.formatNumber(product.stock.quantityOnHand || 0) + " Units";
    }
    if (product.unit) {
      document.getElementById("product-unit").textContent = product.unit.name + " (" + product.unit.symbol + ")";
    }

    updateSummaryUI(shell);
  }

  async function loadRecentTransactions(api) {
    const listContainer = document.getElementById("recent-transactions-list");
    if (!listContainer) return;

    try {
      const response = await api.listStockOuts({ limit: 5 });
      const transactions = response.data || [];
      
      if (transactions.length === 0) {
        listContainer.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-slate-400 text-sm">No transactions yet.</td></tr>`;
        return;
      }

      listContainer.innerHTML = transactions.map(t => {
        const date = new Date(t.issuedDate).toLocaleDateString();
        const itemCount = t.items ? t.items.length : 0;
        const statusClass = t.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';
        
        return `
          <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4 text-xs font-bold text-primary">#${t.code}</td>
            <td class="px-6 py-4 text-xs font-semibold text-slate-600">${t.recipientName || 'N/A'}</td>
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

  async function initializeStockOutPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) return;

    state.currentUser = await shell.initializeProtectedPage();
    if (!state.currentUser) return;

    // 1. Setup Elements
    const skuInput = document.getElementById("stock-out-sku");
    const qtyInput = document.getElementById("stock-out-quantity");
    const qtyPlus = document.getElementById("qty-plus");
    const qtyMinus = document.getElementById("qty-minus");
    const recipientInput = document.getElementById("stock-out-recipient");
    const notesInput = document.getElementById("stock-out-notes");
    const submitBtn = document.getElementById("stock-out-submit");

    // Initialize UI
    updateSummaryUI(shell);
    loadRecentTransactions(api);

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
        
        const recipient = recipientInput ? recipientInput.value.trim() : "";
        if (!recipient) {
          window.alert("Please enter a recipient or destination name.");
          return;
        }

        const originalText = submitBtn.innerHTML;
        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = "<span>Processing...</span>";

          const createPayload = {
            recipient_name: recipient,
            issued_date: state.issuedDate,
            note: notesInput ? notesInput.value : "",
            items: [
              {
                product_id: state.selectedProduct.id,
                quantity: state.quantity,
                unit_price: 10
              }
            ]
          };

          const createResult = await api.createStockOut(createPayload);
          if (!createResult.success) throw new Error(createResult.message || "Failed to create record");

          const stockOutId = createResult.data.id;
          const confirmResult = await api.confirmStockOut(stockOutId);
          if (!confirmResult.success) throw new Error(confirmResult.message || "Failed to confirm record");

          window.alert("Stock Out successful! Inventory has been updated.");
          
          // Clear inputs
          skuInput.value = "";
          qtyInput.value = "1";
          state.quantity = 1;
          state.selectedProduct = null;
          if (recipientInput) recipientInput.value = "";
          if (notesInput) notesInput.value = "";
          document.getElementById("product-preview").classList.add("hidden");
          
          loadRecentTransactions(api);
          updateSummaryUI(shell);
          
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;

        } catch (err) {
          console.error("Stock out error:", err);
          window.alert("ERROR: " + err.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initializeStockOutPage);
})();
