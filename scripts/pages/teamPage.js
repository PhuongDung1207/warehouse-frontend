(function () {
  const state = {
    keyword: "",
    page: 1,
    limit: 20
  };

  function renderUsers(payload, shell) {
    const tbody = document.getElementById("team-table-body");
    const users = payload.data || [];
    const meta = payload.meta || {};
    const activeUsers = users.filter(function (user) {
      return user.status === "active";
    });

    document.getElementById("team-total-staff").textContent = shell.formatNumber(
      meta.totalItems
    );
    document.getElementById("team-active-users").textContent = shell.formatNumber(
      activeUsers.length
    );
    document.getElementById("team-summary").textContent =
      "Showing " +
      shell.formatNumber(users.length) +
      " of " +
      shell.formatNumber(meta.totalItems || 0) +
      " members";

    document.getElementById("team-prev-page").disabled = (meta.page || 1) <= 1;
    document.getElementById("team-next-page").disabled =
      (meta.page || 1) >= (meta.totalPages || 1);

    tbody.innerHTML = users
      .map(function (user) {
        const roleName = (user.role && user.role.name) || "user";
        const isActive = user.status === "active";

        return (
          '<tr class="hover:bg-surface-container-low/30 transition-colors">' +
          '<td class="px-8 py-5"><div class="flex items-center gap-4"><div class="h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center font-bold text-primary">' +
          shell.escapeHtml((user.fullName || user.username || "U").charAt(0).toUpperCase()) +
          '</div><div><p class="font-body text-sm font-bold text-on-surface">' +
          shell.escapeHtml(user.fullName || user.username || "Unnamed user") +
          '</p><p class="text-xs text-slate-500">' +
          shell.escapeHtml(user.email || user.username || "No contact") +
          "</p></div></div></td>" +
          '<td class="px-8 py-5"><span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">' +
          shell.escapeHtml(roleName) +
          "</span></td>" +
          '<td class="px-8 py-5"><div class="flex items-center gap-2"><span class="h-2 w-2 rounded-full ' +
          (isActive ? "bg-[#1a6886]" : "bg-slate-300") +
          '"></span><span class="text-sm ' +
          (isActive ? "text-on-surface-variant" : "text-slate-400") +
          ' font-medium">' +
          shell.escapeHtml(user.status || "unknown") +
          "</span></div></td>" +
          '<td class="px-8 py-5 text-sm text-slate-500 font-medium">' +
          shell.formatDate(user.updatedAt || user.createdAt) +
          '</td><td class="px-8 py-5 text-right"><button class="text-slate-400 hover:text-primary transition-colors" type="button"><span class="material-symbols-outlined">manage_accounts</span></button></td></tr>'
        );
      })
      .join("");
  }

  async function loadUsers(api, shell) {
    const payload = await api.listUsers({
      keyword: state.keyword,
      limit: state.limit,
      page: state.page,
      sortBy: "fullName",
      sortOrder: "asc"
    });

    renderUsers(payload, shell);
  }

  async function initializeTeamPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) {
      return;
    }

    const currentUser = await shell.initializeProtectedPage();
    if (!currentUser) {
      return;
    }

    const searchInput = document.getElementById("team-search-input");
    let searchTimeout = null;

    searchInput.addEventListener("input", function () {
      window.clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(function () {
        state.keyword = searchInput.value.trim();
        state.page = 1;
        loadUsers(api, shell).catch(function (error) {
          window.alert(error.message || "Unable to load users.");
        });
      }, 250);
    });

    document
      .getElementById("team-prev-page")
      .addEventListener("click", function () {
        if (state.page > 1) {
          state.page -= 1;
          loadUsers(api, shell).catch(console.error);
        }
      });

    document
      .getElementById("team-next-page")
      .addEventListener("click", function () {
        state.page += 1;
        loadUsers(api, shell).catch(console.error);
      });

    await loadUsers(api, shell);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeTeamPage().catch(function (error) {
      console.error(error);
      if (error && error.status === 403) {
        window.alert("This screen requires an admin account.");
      }
    });
  });
})();
