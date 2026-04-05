(function () {
  const state = {
    suppliers: [],
    meta: {}
  };

  const statusMap = {
    'In Transit': { class: 'bg-cyan-100 text-cyan-700', label: 'In Transit' },
    'Pending': { class: 'bg-slate-100 text-slate-600', label: 'Pending' },
    'Delayed': { class: 'bg-red-100 text-red-700', label: 'Delayed' },
    'Processing': { class: 'bg-blue-100 text-blue-700', label: 'Processing' }
  };

  const mockLogos = [
    { icon: 'rocket_launch', color: 'bg-blue-50 text-blue-600' },
    { icon: 'potted_plant', color: 'bg-green-50 text-green-600' },
    { icon: 'precision_manufacturing', color: 'bg-orange-50 text-orange-600' },
    { icon: 'warehouse', color: 'bg-purple-50 text-purple-600' }
  ];

  async function initializeSupplierPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) return;

    const currentUser = await shell.initializeProtectedPage();
    if (!currentUser) return;

    try {
      const result = await api.listSuppliers();
      if (result.success) {
        state.suppliers = result.data || [];
        state.meta = result.meta || {};
        updateUI(shell);
      }
    } catch (err) {
      console.error("Error loading suppliers:", err);
    }
  }

  function updateUI(shell) {
    const totalVendorsEl = document.getElementById("stat-total-vendors");
    if (totalVendorsEl) {
      totalVendorsEl.textContent = state.suppliers.length;
    }

    const infoEl = document.getElementById("pagination-info");
    if (infoEl) {
      infoEl.textContent = `Showing 1 to ${state.suppliers.length} of ${state.suppliers.length} suppliers`;
    }

    renderTable(shell);
  }

  function renderTable(shell) {
    const tbody = document.getElementById("supplier-table-body");
    if (!tbody) return;

    if (state.suppliers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-secondary">No suppliers found.</td></tr>';
      return;
    }

    tbody.innerHTML = state.suppliers.map((supplier, index) => {
      const logo = mockLogos[index % mockLogos.length];
      const statusKeys = Object.keys(statusMap);
      const status = statusMap[statusKeys[index % statusKeys.length]];
      
      // Mocked additional fields since they might not be in DB yet
      const contactName = "Sarah Jenkins";
      const contactRole = "Key Account Manager";
      const nextDelivery = "Oct 24, 2023";
      const deliveryStatus = "Arriving 09:00 AM";

      return `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer">
            <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl ${logo.color} flex items-center justify-center">
                        <span class="material-symbols-outlined text-lg">${logo.icon}</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">${supplier.name}</p>
                        <p class="text-[10px] text-secondary">Global Freight & Distribution</p>
                    </div>
                </div>
            </td>
            <td class="px-8 py-5">
                <p class="text-xs font-bold text-on-surface">${contactName}</p>
                <p class="text-[10px] text-secondary font-medium">${contactRole}</p>
            </td>
            <td class="px-8 py-5">
                <span class="px-3 py-1 rounded-full ${status.class} text-[9px] font-bold flex items-center gap-1 w-fit">
                    <span class="w-1 h-1 rounded-full bg-current"></span>
                    ${status.label}
                </span>
            </td>
            <td class="px-8 py-5">
                <p class="text-xs font-bold text-on-surface">${nextDelivery}</p>
                <p class="text-[10px] text-secondary font-medium">${deliveryStatus}</p>
            </td>
            <td class="px-8 py-5 text-right">
                <button class="p-2 text-slate-300 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined text-lg">more_horiz</span>
                </button>
            </td>
        </tr>
      `;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", initializeSupplierPage);
})();
