(function () {
  const state = {
    warehouses: [],
    currentUser: null
  };

  async function initializeStoragePage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) return;

    state.currentUser = await shell.initializeProtectedPage();
    if (!state.currentUser) return;

    // Load Data
    await loadStorageData(api, shell);
    
    // Setup listeners
    setupEventListeners(api, shell);
  }

  async function loadStorageData(api, shell) {
    try {
      const result = await api.getWarehouses();
      if (result.success) {
        state.warehouses = result.data || [];
        updateUI(shell);
      }
    } catch (err) {
      console.error("Error loading storage data:", err);
    }
  }

  function updateUI(shell) {
    // 1. Update Global Metrics (Aggregate from all warehouses)
    let totalZones = 0;
    let totalOccupancy = 0;
    let totalCapacity = 0;
    
    state.warehouses.forEach(wh => {
      const zones = wh.zones || [];
      totalZones += zones.length;
      zones.forEach(z => {
        totalOccupancy += (z.occupancy || 0);
        totalCapacity += (z.capacity || 0);
      });
    });

    const avgOccupancy = totalZones > 0 ? (totalOccupancy / totalZones) : 0;
    
    const occupancyValEl = document.getElementById("stat-occupancy");
    const occupancyBarEl = document.getElementById("occupancy-bar");
    const binsValEl = document.getElementById("stat-bins");

    if (occupancyValEl) occupancyValEl.textContent = avgOccupancy.toFixed(1) + "%";
    if (occupancyBarEl) occupancyBarEl.style.width = avgOccupancy + "%";
    if (binsValEl) binsValEl.textContent = shell.formatNumber(totalZones * 48); // Mocked bin multiplier

    // 2. Render Warehouse Cards
    renderWarehouses(shell);
  }

  function renderWarehouses(shell) {
    const grid = document.getElementById("warehouses-grid");
    if (!grid) return;

    if (state.warehouses.length === 0) {
      grid.innerHTML = '<div class="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-secondary font-medium">No warehouses registered yet. Click "Add Warehouse" to get started.</div>';
      return;
    }

    grid.innerHTML = state.warehouses.map(wh => {
      const zoneCount = (wh.zones || []).length;
      const statusColor = wh.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400';
      
      return `
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col h-full">
            <div class="h-32 bg-slate-900 relative">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" alt="${wh.name}" class="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div class="absolute bottom-4 left-6">
                    <h4 class="text-white font-bold font-headline text-xl leading-tight">${wh.name}</h4>
                    <p class="text-xs text-white/60 font-medium mt-1 flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">location_on</span>
                        ${wh.location || 'Global Facility'}
                    </p>
                </div>
                <div class="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                    <div class="w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse"></div>
                    <span class="text-[8px] font-bold text-white uppercase tracking-widest">${wh.status}</span>
                </div>
            </div>
            <div class="p-6 flex-1 flex flex-col gap-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <p class="text-[9px] text-secondary font-bold uppercase tracking-widest mb-1">Operational Zones</p>
                        <p class="text-lg font-black text-primary">${zoneCount}</p>
                    </div>
                    <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <p class="text-[9px] text-secondary font-bold uppercase tracking-widest mb-1">Active Staff</p>
                        <p class="text-lg font-black text-primary">--</p>
                    </div>
                </div>
                
                <p class="text-xs text-secondary leading-relaxed line-clamp-2 italic">${wh.description || 'No specialized description provided for this facility.'}</p>
                
                <div class="mt-auto pt-4 flex gap-2">
                    <button class="flex-1 py-3 bg-slate-50 text-slate-600 font-bold text-[10px] rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest">Details</button>
                    <button class="flex-1 py-3 bg-primary text-white font-bold text-[10px] rounded-xl hover:bg-primary-container transition-all shadow-md shadow-primary/10 uppercase tracking-widest">Manage Zones</button>
                </div>
            </div>
        </div>
      `;
    }).join("");
  }

  function setupEventListeners(api, shell) {
    const warehouseForm = document.getElementById("warehouse-form");
    if (!warehouseForm) return;

    warehouseForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById("warehouse-submit-button");
      const feedback = document.getElementById("warehouse-form-feedback");
      
      const formData = new FormData(warehouseForm);
      const payload = {
        name: formData.get("name"),
        location: formData.get("location"),
        description: formData.get("description")
      };

      try {
        if (submitBtn) submitBtn.disabled = true;
        if (feedback) {
          feedback.classList.remove("hidden", "bg-red-100", "text-red-700", "bg-green-100", "text-green-700");
          feedback.classList.add("bg-blue-50", "text-blue-700");
          feedback.textContent = "Processing...";
        }

        const result = await api.createWarehouse(payload);

        if (result.success) {
          if (feedback) {
            feedback.classList.replace("bg-blue-50", "bg-green-100");
            feedback.classList.replace("text-blue-700", "text-green-700");
            feedback.textContent = "Warehouse initialized successfully!";
          }
          
          warehouseForm.reset();
          
          setTimeout(() => {
            document.getElementById("warehouse-modal").classList.add("hidden");
            if (feedback) feedback.classList.add("hidden");
            loadStorageData(api, shell).catch(console.error);
          }, 1500);
        } else {
          throw new Error(result.message || "Failed to create warehouse");
        }
      } catch (err) {
        if (feedback) {
          feedback.classList.remove("hidden", "bg-blue-50", "text-blue-700");
          feedback.classList.add("bg-red-100", "text-red-700");
          feedback.textContent = err.message;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initializeStoragePage);
})();
