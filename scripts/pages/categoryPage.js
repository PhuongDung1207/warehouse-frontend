(function () {
  const state = {
    categories: [],
    dashboardStats: null,
    mockAuditLogs: [
      { id: 1, title: "Electronics stock updated", subtitle: "Managed by Alexander Pierce", time: "2 hours ago", type: "update" },
      { id: 2, title: "Hardware threshold reached", subtitle: "Automated System Alert", time: "5 hours ago", type: "alert" },
      { id: 3, title: "Supplies batch registered", subtitle: "Managed by Sarah Connor", time: "1 day ago", type: "register" }
    ]
  };

  const categoryImages = {
    "Electronics": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    "Hardware": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400",
    "Apparel": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=400",
    "Supplies": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=400",
    "Raw Materials": "https://images.unsplash.com/photo-1504917595217-d4dc5f649774?auto=format&fit=crop&q=80&w=400"
  };

  async function initializeCategoriesPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) return;

    const currentUser = await shell.initializeProtectedPage();
    if (!currentUser) return;

    try {
      const [categoriesRes, dashboardRes] = await Promise.allSettled([
        api.listCategories(),
        api.getDashboardReport()
      ]);

      if (categoriesRes.status === "fulfilled") {
        state.categories = categoriesRes.value.data || [];
      }

      if (dashboardRes.status === "fulfilled") {
        state.dashboardStats = dashboardRes.value.data || {};
        updateStatsUI(state.dashboardStats, shell);
      }

      renderCategories(state.categories, shell);
      renderAuditLogs(state.mockAuditLogs);

    } catch (err) {
      console.error("Error initializing categories page:", err);
    }

    setupEventListeners(api, shell);
  }

  function setupEventListeners(api, shell) {
    const modal = document.getElementById("category-modal");
    const addBtn = document.getElementById("add-category-btn-top");
    const closeBtn = document.getElementById("close-modal-btn");
    const cancelBtn = document.getElementById("cancel-btn");
    const overlay = document.getElementById("modal-overlay");
    const form = document.getElementById("category-form");

    const toggleModal = (show) => {
      if (modal) {
        modal.classList.toggle("hidden", !show);
        if (show) {
          form.reset();
          const errorEl = document.getElementById("modal-error-msg");
          if (errorEl) errorEl.classList.add("hidden");
        }
      }
    };

    if (addBtn) addBtn.onclick = () => toggleModal(true);
    if (closeBtn) closeBtn.onclick = () => toggleModal(false);
    if (cancelBtn) cancelBtn.onclick = () => toggleModal(false);
    if (overlay) overlay.onclick = () => toggleModal(false);

    // Global listener for dynamic "Create New" card
    document.addEventListener('click', (e) => {
      if (e.target.closest('.create-new-card')) {
        toggleModal(true);
      }
    });

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const name = document.getElementById("cat-name").value;
        const description = document.getElementById("cat-desc").value;

        if (!name) return;

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = "Creating...";
          
          const errorEl = document.getElementById("modal-error-msg");
          if (errorEl) errorEl.classList.add("hidden");

          const result = await api.createCategory({ name, description });
          
          if (result.success) {
            toggleModal(false);
            // Refresh categories
            const categoriesRes = await api.listCategories();
            state.categories = categoriesRes.data || [];
            renderCategories(state.categories, shell);
            updateStatsUI(state.dashboardStats || {}, shell);
          }
        } catch (err) {
          console.error("Failed to create category:", err);
          const errorEl = document.getElementById("modal-error-msg");
          if (errorEl) {
            errorEl.textContent = err.message || "Failed to create category";
            errorEl.classList.remove("hidden");
          } else {
            alert(err.message || "Failed to create category");
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Category";
        }
      };
    }
  }

  function updateStatsUI(stats, shell) {
    const totalValEl = document.getElementById("total-val-display");
    const activeCountEl = document.getElementById("active-cat-display");

    if (totalValEl) {
      totalValEl.textContent = shell.formatCurrency(stats.totalValue || 1284500);
    }
    if (activeCountEl) {
      activeCountEl.textContent = (state.categories.length).toString().padStart(2, "0");
    }
  }

  function renderCategories(categories, shell) {
    const grid = document.getElementById("categories-grid-redesigned");
    if (!grid) return;

    const cardsHtml = categories.map((cat, index) => {
      const imageUrl = categoryImages[cat.name] || `https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=400`;
      const chips = index % 2 === 0 ? ["MOAT UREHANE", "PHARMACIES"] : ["STOCK LOW", "SOP'S"];
      
      return `
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col">
          <div class="h-44 relative overflow-hidden">
            <img src="${imageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-4 left-5 flex items-center gap-2">
                <div class="p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white">
                    <span class="material-symbols-outlined text-sm">category</span>
                </div>
                <h4 class="text-lg font-bold text-white font-headline tracking-tight">${cat.name}</h4>
            </div>
          </div>
          
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-1 opacity-60">Items</p>
                    <p class="text-lg font-extrabold font-headline text-on-surface">${shell.formatNumber(cat.products_count || (1000 + index * 200))} <span class="text-[10px] font-normal text-secondary uppercase">units</span></p>
                </div>
                <div class="text-right">
                    <p class="text-[9px] font-bold text-secondary uppercase tracking-widest mb-1 opacity-60">Total Value</p>
                    <p class="text-lg font-extrabold font-headline text-primary">${shell.formatCompactCurrency(cat.total_value || (450000 - index * 50000))}</p>
                </div>
            </div>

            <div class="flex flex-wrap gap-2 mt-auto">
                ${chips.map(chip => `
                    <span class="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-md text-[8px] font-bold tracking-widest uppercase">${chip}</span>
                `).join("")}
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Add "Create New Category" card
    const createNewHtml = `
      <div class="create-new-card bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 group hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[300px]">
        <div class="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-primary/20 mb-4 scale-100 group-hover:scale-110">
            <span class="material-symbols-outlined text-3xl">add</span>
        </div>
        <h4 class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Create New Category</h4>
        <p class="text-[10px] text-secondary text-center max-w-[150px] mt-2 leading-relaxed">Define a new department and allocate storage space.</p>
      </div>
    `;

    grid.innerHTML = cardsHtml + createNewHtml;
  }

  function renderAuditLogs(logs) {
    const container = document.getElementById("audit-logs-container");
    if (!container) return;

    container.innerHTML = logs.map(log => `
      <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50 group hover:border-primary/20 hover:shadow-md hover:-translate-x-1 transition-all cursor-pointer">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl ${log.type === 'alert' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-secondary'} flex items-center justify-center">
                <span class="material-symbols-outlined text-lg">${log.type === 'alert' ? 'report_problem' : 'category'}</span>
            </div>
            <div>
                <p class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">${log.title}</p>
                <p class="text-[10px] text-secondary">${log.subtitle} • ${log.time}</p>
            </div>
        </div>
        <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="material-symbols-outlined text-primary text-xl">chevron_right</span>
        </div>
      </div>
    `).join("");
  }

  document.addEventListener("DOMContentLoaded", initializeCategoriesPage);
})();
