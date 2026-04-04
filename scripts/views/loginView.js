(function () {
  const app = (window.SupplierDirectory = window.SupplierDirectory || {});

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  app.createLoginView = function createLoginView(message) {
    const alertMarkup = message
      ? '<p class="inline-alert inline-alert-error">' +
        escapeHtml(message) +
        "</p>"
      : "";

    return (
      '<section class="auth-shell">' +
      '<article class="auth-card">' +
      '<span class="auth-kicker">Backend Connection</span>' +
      "<h1>Sign in to sync suppliers</h1>" +
      "<p>Frontend now reads live data from the warehouse backend. Enter a backend account to load suppliers and export the current dataset.</p>" +
      alertMarkup +
      '<form id="login-form" class="auth-form">' +
      '<label class="form-field" for="identifier-input">' +
      "<span>Username or email</span>" +
      '<input class="text-input" id="identifier-input" name="identifier" type="text" autocomplete="username" placeholder="admin" required />' +
      "</label>" +
      '<label class="form-field" for="password-input">' +
      "<span>Password</span>" +
      '<input class="text-input" id="password-input" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required />' +
      "</label>" +
      '<button class="button-primary" id="login-submit-button" type="submit">Connect Backend</button>' +
      "</form>" +
      '<p class="auth-hint">If you are using <code>backend/.env.example</code>, the seeded admin account is <code>admin</code> / <code>ChangeMe123!</code>.</p>' +
      "</article>" +
      "</section>"
    );
  };
})();
