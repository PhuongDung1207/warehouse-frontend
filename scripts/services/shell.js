(function () {
  const app = (window.WarehouseShell = window.WarehouseShell || {});
  const LOGIN_PATH = "/pages/auth/login.html";
  const DEFAULT_HOME_PATH = "/pages/dashboard/dashboard.html";
  const NAVIGATION_MAP = {
    Dashboard: "/pages/dashboard/dashboard.html",
    Products: "/pages/inventory/inventory.html",
    Reports: "/pages/reports/reports.html",
    Users: "/pages/settings/team.html",
    "Stock In": "/pages/inventory/stock_in.html",
    "Stock Out": "/pages/inventory/stock_out.html",
    "DashBoard StockIn": "/pages/dashboard/dashboard-stockin.html",
    "DashBoard StockOut": "/pages/dashboard/dashboard-stockout.html",
    Categories: "/pages/inventory/inventory.html",
    Storage: "/pages/inventory/inventory.html",
    Suppliers: "/pages/inventory/inventory.html",
    Settings: "/pages/settings/team.html"
  };

  function getApi() {
    return window.SupplierDirectory && window.SupplierDirectory.api;
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(Number(value) || 0);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setNavigationLinks() {
    document.querySelectorAll("nav a").forEach(function (anchor) {
      const label = anchor.textContent.replace(/\s+/g, " ").trim();
      const target = NAVIGATION_MAP[label];

      if (target) {
        anchor.setAttribute("href", target);
      }
    });

    document.querySelectorAll("aside h1").forEach(function (heading) {
      const container = heading.closest("div");
      if (container && container.parentElement) {
        container.parentElement.style.cursor = "pointer";
        container.parentElement.addEventListener("click", function () {
          window.location.assign(DEFAULT_HOME_PATH);
        });
      }
    });
  }

  function applyActiveNavigationState() {
    const currentPath = window.location.pathname;

    document.querySelectorAll("nav a").forEach(function (anchor) {
      const anchorPath = anchor.getAttribute("href");
      const isActive = anchorPath && anchorPath === currentPath;

      anchor.removeAttribute("aria-current");

      if (isActive) {
        anchor.setAttribute("aria-current", "page");
      }
    });
  }

  function applyUserToLayout(user) {
    if (!user) {
      return;
    }

    const displayName = user.fullName || user.username || "Warehouse User";
    const displayRole = (user.role && user.role.name) || "Authenticated User";

    document.querySelectorAll("[data-user-name]").forEach(function (element) {
      element.textContent = displayName;
    });

    document.querySelectorAll("[data-user-role]").forEach(function (element) {
      element.textContent = displayRole;
    });
  }

  function redirectToLogin() {
    const loginUrl = new URL(LOGIN_PATH, window.location.origin);
    loginUrl.searchParams.set(
      "redirect",
      window.location.pathname + window.location.search
    );
    window.location.assign(loginUrl.pathname + loginUrl.search);
  }

  function redirectAfterLogin() {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectTarget = searchParams.get("redirect") || DEFAULT_HOME_PATH;
    window.location.assign(redirectTarget);
  }

  async function initializeProtectedPage() {
    setNavigationLinks();
    applyActiveNavigationState();

    const api = getApi();
    if (!api) {
      throw new Error("Frontend API service is not loaded.");
    }

    const session = api.getStoredSession();
    if (!session || !session.accessToken) {
      redirectToLogin();
      return null;
    }

    try {
      const currentUser = await api.getCurrentUser();
      applyUserToLayout(currentUser);
      return currentUser;
    } catch (error) {
      api.clearSession();
      redirectToLogin();
      return null;
    }
  }

  function initializePublicPage() {
    setNavigationLinks();
    applyActiveNavigationState();

    const api = getApi();
    if (!api) {
      return null;
    }

    const session = api.getStoredSession();
    if (session && session.user) {
      applyUserToLayout(session.user);
    }

    return session;
  }

  app.shell = {
    applyUserToLayout: applyUserToLayout,
    escapeHtml: escapeHtml,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    formatNumber: formatNumber,
    initializeProtectedPage: initializeProtectedPage,
    initializePublicPage: initializePublicPage,
    redirectAfterLogin: redirectAfterLogin,
    redirectToLogin: redirectToLogin,
    setNavigationLinks: setNavigationLinks
  };

  document.addEventListener("DOMContentLoaded", function () {
    setNavigationLinks();
    applyActiveNavigationState();
  });
})();
