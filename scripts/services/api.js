(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});
  const SESSION_STORAGE_KEY = "warehouse-management.session";

  function createApiError(status, message, payload) {
    const error = new Error(message || "Request failed");
    error.status = status;
    error.payload = payload;
    return error;
  }

  function parseJsonSafely(response) {
    return response.text().then(function (text) {
      if (!text) {
        return null;
      }

      try {
        return JSON.parse(text);
      } catch (error) {
        return null;
      }
    });
  }

  function getStoredSession() {
    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }

  function saveSession(session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  function clearSession() {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  function buildQueryString(params) {
    const query = new URLSearchParams();
    const entries = params || {};

    Object.keys(entries).forEach(function (key) {
      const value = entries[key];

      if (value === undefined || value === null || value === "") {
        return;
      }

      query.set(key, String(value));
    });

    const serialized = query.toString();
    return serialized ? "?" + serialized : "";
  }

  function withQuery(path, params) {
    return path + buildQueryString(params);
  }

  async function request(path, options) {
    const config = options || {};
    const headers = new Headers(config.headers || {});
    const session = getStoredSession();

    if (!config.skipAuth && session && session.accessToken) {
      headers.set("Authorization", "Bearer " + session.accessToken);
    }

    if (config.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response;
    try {
      response = await fetch(withQuery(path, config.query), {
        method: config.method || "GET",
        headers: headers,
        body:
          config.body !== undefined ? JSON.stringify(config.body) : undefined
      });
    } catch (error) {
      throw createApiError(
        0,
        "Cannot connect to the frontend proxy. Make sure the frontend server is running.",
        { success: false }
      );
    }

    const payload = await parseJsonSafely(response);

    if (!response.ok || (payload && payload.success === false)) {
      throw createApiError(
        response.status,
        (payload && payload.message) || response.statusText || "Request failed",
        payload
      );
    }

    return payload;
  }

  function getFilenameFromResponse(response, fallbackName) {
    const disposition = response.headers.get("content-disposition") || "";
    const matched = disposition.match(/filename="?([^"]+)"?/i);

    if (matched && matched[1]) {
      return matched[1];
    }

    return fallbackName || "download";
  }

  async function download(path, options) {
    const config = options || {};
    const headers = new Headers(config.headers || {});
    const session = getStoredSession();

    if (!config.skipAuth && session && session.accessToken) {
      headers.set("Authorization", "Bearer " + session.accessToken);
    }

    const response = await fetch(withQuery(path, config.query), {
      method: config.method || "GET",
      headers: headers
    });

    if (!response.ok) {
      const payload = await parseJsonSafely(response);
      throw createApiError(
        response.status,
        (payload && payload.message) || response.statusText || "Download failed",
        payload
      );
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = getFilenameFromResponse(response, config.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  }

  async function login(credentials) {
    const payload = await request("/api/v1/auth/login", {
      method: "POST",
      skipAuth: true,
      body: credentials
    });

    saveSession({
      accessToken: payload.data.access_token,
      user: payload.data.user
    });

    return payload.data.user;
  }

  async function logout() {
    const session = getStoredSession();
    if (!session || !session.accessToken) {
      clearSession();
      return;
    }

    try {
      await request("/api/v1/auth/logout", {
        method: "POST"
      });
    } finally {
      clearSession();
    }
  }

  async function getCurrentUser() {
    const payload = await request("/api/v1/auth/me");
    const session = getStoredSession() || {};

    saveSession({
      accessToken: session.accessToken,
      user: payload.data
    });

    return payload.data;
  }

  async function listSuppliersPage(query) {
    return request("/api/v1/suppliers", {
      query: query || {}
    });
  }

  async function listSuppliers() {
    const allSuppliers = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const payload = await listSuppliersPage({
        page: page,
        limit: 100,
        sortBy: "name",
        sortOrder: "asc"
      });

      totalPages = (payload.meta && payload.meta.totalPages) || 1;
      Array.prototype.push.apply(allSuppliers, payload.data || []);
      page += 1;
    }

    return allSuppliers;
  }

  function listCategories(query) {
    return request("/api/v1/categories", {
      query: query || {}
    });
  }

  function createCategory(payload) {
    return request("/api/v1/categories", {
      method: "POST",
      body: payload
    });
  }

  function listUnits(query) {
    return request("/api/v1/units", {
      query: query || {}
    });
  }

  function createProduct(payload) {
    return request("/api/v1/products", {
      method: "POST",
      body: payload
    });
  }

  function listUsers(query) {
    return request("/api/v1/users", {
      query: query || {}
    });
  }

  function createUser(payload) {
    return request("/api/v1/users", {
      method: "POST",
      body: payload
    });
  }

  function listRoles(query) {
    return request("/api/v1/roles", {
      query: query || {}
    });
  }

  function getStocks(query) {
    return request("/api/v1/stocks", {
      query: query || {}
    });
  }

  function getLowStocks(query) {
    return request("/api/v1/stocks/low-stock", {
      query: query || {}
    });
  }

  function createStockCheck(payload) {
    return request("/api/v1/stock-checks", {
      method: "POST",
      body: payload
    });
  }

  function getDashboardReport() {
    return request("/api/v1/reports/dashboard");
  }
  
  function createStockIn(payload) {
    return request("/api/v1/stock-ins", {
      method: "POST",
      body: payload
    });
  }

  function confirmStockIn(id) {
    return request("/api/v1/stock-ins/" + id + "/confirm", {
      method: "POST"
    });
  }

  function listStockIns(query) {
    return request("/api/v1/stock-ins", {
      query: query || {}
    });
  }

  function createStockOut(payload) {
    return request("/api/v1/stock-outs", {
      method: "POST",
      body: payload
    });
  }

  function confirmStockOut(id) {
    return request("/api/v1/stock-outs/" + id + "/confirm", {
      method: "POST"
    });
  }

  function listStockOuts(query) {
    return request("/api/v1/stock-outs", {
      query: query || {}
    });
  }

  function getWarehouses() {
    return request("/api/v1/warehouses");
  }

  function createWarehouse(payload) {
    return request("/api/v1/warehouses", {
      method: "POST",
      body: payload
    });
  }

  function getStockSummary(query) {
    return request("/api/v1/reports/stock-summary", {
      query: query || {}
    });
  }

  function getStockInSummary(query) {
    return request("/api/v1/reports/stock-in-summary", {
      query: query || {}
    });
  }

  function getStockOutSummary(query) {
    return request("/api/v1/reports/stock-out-summary", {
      query: query || {}
    });
  }

  function getStockMovementChart(query) {
    return request("/api/v1/reports/chart/stock-movement", {
      query: query || {}
    });
  }

  function getProducts(query) {
    return request("/api/v1/products", {
      query: query || {}
    });
  }

  app.api = {
    buildQueryString: buildQueryString,
    clearSession: clearSession,
    createWarehouse: createWarehouse,
    createProduct: createProduct,
    createCategory: createCategory,
    createStockCheck: createStockCheck,
    createStockIn: createStockIn,
    confirmStockIn: confirmStockIn,
    listStockIns: listStockIns,
    createStockOut: createStockOut,
    confirmStockOut: confirmStockOut,
    listStockOuts: listStockOuts,
    download: download,
    getCurrentUser: getCurrentUser,
    getDashboardReport: getDashboardReport,
    getLowStocks: getLowStocks,
    getProducts: getProducts,
    getWarehouses: getWarehouses,
    getStockInSummary: getStockInSummary,
    getStockMovementChart: getStockMovementChart,
    getStocks: getStocks,
    getStockSummary: getStockSummary,
    getStockOutSummary: getStockOutSummary,
    getStoredSession: getStoredSession,
    listCategories: listCategories,
    listUnits: listUnits,
    listSuppliers: listSuppliers,
    listSuppliersPage: listSuppliersPage,
    listUsers: listUsers,
    createUser: createUser,
    listRoles: listRoles,
    login: login,
    logout: logout,
    request: request,
    saveSession: saveSession
  };
})();
