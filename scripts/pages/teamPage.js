(function () {
  const state = {
    keyword: "",
    page: 1,
    limit: 20,
    roles: []
  };

  function renderUsers(payload, shell) {
    const tbody = document.getElementById("team-table-body");
    const users = payload.data || [];
    const meta = payload.meta || {};
    
    // Filter active users to update the "Active Now" stat
    const activeUsersCount = users.filter(user => user.status === "active").length;

    const totalStaffEl = document.getElementById("team-total-staff");
    const activeUsersEl = document.getElementById("team-active-users");
    const summaryEl = document.getElementById("team-summary");

    if (totalStaffEl) totalStaffEl.textContent = shell.formatNumber(meta.totalItems || users.length);
    if (activeUsersEl) activeUsersEl.textContent = shell.formatNumber(activeUsersCount);
    if (summaryEl) {
      summaryEl.textContent =
        "Showing " +
        shell.formatNumber(users.length) +
        " of " +
        shell.formatNumber(meta.totalItems || 0) +
        " members";
    }

    const prevPageBtn = document.getElementById("team-prev-page");
    const nextPageBtn = document.getElementById("team-next-page");

    if (prevPageBtn) prevPageBtn.disabled = (meta.page || 1) <= 1;
    if (nextPageBtn) nextPageBtn.disabled = (meta.page || 1) >= (meta.totalPages || 1);

    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="px-8 py-12 text-center text-slate-400 italic">No team members found.</td></tr>';
      return;
    }

    tbody.innerHTML = users
      .map(function (user) {
        const roleName = (user.role && user.role.name) || "User";
        const isActive = user.status === "active";
        const initials = (user.fullName || user.username || "U").charAt(0).toUpperCase();

        return `
          <tr class="hover:bg-surface-container-low/30 transition-colors group">
            <td class="px-8 py-5">
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  ${shell.escapeHtml(initials)}
                </div>
                <div>
                  <p class="font-body text-sm font-bold text-on-surface">${shell.escapeHtml(user.fullName || user.username)}</p>
                  <p class="text-xs text-slate-500">${shell.escapeHtml(user.email || 'no-email@precision.com')}</p>
                </div>
              </div>
            </td>
            <td class="px-8 py-5">
              <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">${shell.escapeHtml(roleName)}</span>
            </td>
            <td class="px-8 py-5">
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-300"}"></span>
                <span class="text-sm ${isActive ? "text-emerald-700" : "text-slate-400"} font-medium">${shell.escapeHtml(user.status || 'inactive')}</span>
              </div>
            </td>
            <td class="px-8 py-5 text-sm text-slate-500 font-medium">
              ${shell.formatDate(user.updatedAt || user.createdAt)}
            </td>
            <td class="px-8 py-5 text-right">
              <button class="text-slate-400 hover:text-primary transition-colors p-2 hover:bg-slate-100 rounded-lg">
                <span class="material-symbols-outlined">manage_accounts</span>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  async function loadUsers(api, shell) {
    try {
      const payload = await api.listUsers({
        keyword: state.keyword,
        limit: state.limit,
        page: state.page,
        sortBy: "fullName",
        sortOrder: "asc"
      });
      renderUsers(payload, shell);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }

  async function loadRoles(api) {
    try {
      const response = await api.listRoles();
      state.roles = response.data || [];
      const roleSelect = document.getElementById("role-select");
      if (roleSelect) {
        roleSelect.innerHTML = '<option value="">Select Role</option>' + 
          state.roles.map(role => `<option value="${role.id}">${role.name}</option>`).join('');
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  }

  async function initializeTeamPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) return;

    const currentUser = await shell.initializeProtectedPage();
    if (!currentUser) return;

    // 1. Elements
    const inviteModal = document.getElementById("invite-modal");
    const openModalBtn = document.getElementById("invite-new-card");
    const closeModalBtn = document.getElementById("close-modal");
    const cancelModalBtn = document.getElementById("cancel-invite");
    const inviteForm = document.getElementById("invite-user-form");
    const searchInput = document.getElementById("team-search-input");

    // 2. Event Handlers
    if (openModalBtn && inviteModal) {
      openModalBtn.addEventListener("click", () => {
        inviteModal.classList.remove("hidden");
        loadRoles(api);
      });
    }

    const hideModal = () => {
      if (inviteModal) inviteModal.classList.add("hidden");
      if (inviteForm) inviteForm.reset();
    };

    if (closeModalBtn) closeModalBtn.addEventListener("click", hideModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", hideModal);

    // 3. Form Submit
    if (inviteForm) {
      inviteForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(inviteForm);
        const payload = Object.fromEntries(formData.entries());

        const submitBtn = inviteForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : "";

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Processing...</span>';
          }

          const result = await api.createUser(payload);
          if (result.success) {
            window.alert("User invited successfully!");
            hideModal();
            loadUsers(api, shell);
          } else {
            throw new Error(result.message || "Failed to create user");
          }
        } catch (err) {
          window.alert("Error: " + err.message);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        }
      });
    }

    // 4. Search & Pagination
    let searchTimeout = null;
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        window.clearTimeout(searchTimeout);
        searchTimeout = window.setTimeout(() => {
          state.keyword = searchInput.value.trim();
          state.page = 1;
          loadUsers(api, shell);
        }, 300);
      });
    }

    const prevBtn = document.getElementById("team-prev-page");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (state.page > 1) {
          state.page--;
          loadUsers(api, shell);
        }
      });
    }

    const nextBtn = document.getElementById("team-next-page");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        state.page++;
        loadUsers(api, shell);
      });
    }

    // Initial Load
    await loadUsers(api, shell);
  }

  document.addEventListener("DOMContentLoaded", initializeTeamPage);
})();
