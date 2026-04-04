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
      response = await fetch(path, {
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

  async function listSuppliers() {
    const allSuppliers = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const payload = await request(
        "/api/v1/suppliers?page=" +
          page +
          "&limit=100&sortBy=name&sortOrder=asc"
      );

      totalPages = (payload.meta && payload.meta.totalPages) || 1;
      Array.prototype.push.apply(allSuppliers, payload.data || []);
      page += 1;
    }

    return allSuppliers;
  }

  app.api = {
    clearSession: clearSession,
    getCurrentUser: getCurrentUser,
    getStoredSession: getStoredSession,
    listSuppliers: listSuppliers,
    login: login,
    logout: logout
  };
})();
