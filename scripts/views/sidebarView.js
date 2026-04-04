(function () {
  const app = (window.WarehouseApp = window.WarehouseApp || {});

  function createNavItem(item) {
    return (
      '<a href="#" class="nav-link' +
      (item.active ? " active" : "") +
      '"' +
      (item.active ? ' aria-current="page"' : "") +
      ">" +
      '<span class="nav-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24">' +
      item.icon +
      "</svg>" +
      "</span>" +
      item.label +
      "</a>"
    );
  }

  app.createSidebarView = function createSidebarView(config) {
    const navigationMarkup = config.navigationItems.map(createNavItem).join("");
    const currentUser = config.currentUser;

    return `
      <div class="brand">
        <div>
          <strong>Logictisc Web</strong>
          <span>Inventory Management</span>
        </div>
      </div>
      <nav class="sidebar-nav" aria-label="Primary">
        ${navigationMarkup}
      </nav>
      <div class="sidebar-user">
        <div class="user-avatar">${currentUser.initial}</div>
        <div class="user-meta">
          <strong>${currentUser.name}</strong>
          <span>${currentUser.role}</span>
        </div>
        <button class="logout-btn" type="button" aria-label="Log out">
          <svg viewBox="0 0 24 24">
            <path d="M14 7l5 5-5 5M19 12H9M10 5H5v14h5" />
          </svg>
        </button>
      </div>
    `;
  };
})();
