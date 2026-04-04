(function () {
  async function initializeLoginPage() {
    const api = window.SupplierDirectory && window.SupplierDirectory.api;
    const shell = window.WarehouseShell && window.WarehouseShell.shell;

    if (!api || !shell) {
      return;
    }

    shell.initializePublicPage();

    const existingSession = api.getStoredSession();
    if (existingSession && existingSession.accessToken) {
      try {
        await api.getCurrentUser();
        shell.redirectAfterLogin();
        return;
      } catch (error) {
        api.clearSession();
      }
    }

    const form = document.getElementById("login-form");
    const identifierInput = document.getElementById("login-identifier");
    const passwordInput = document.getElementById("login-password");
    const errorBox = document.getElementById("login-error");
    const submitButton = document.getElementById("login-submit");

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      errorBox.classList.add("hidden");
      errorBox.textContent = "";
      submitButton.disabled = true;
      submitButton.textContent = "Signing In...";

      try {
        await api.login({
          identifier: identifierInput.value.trim(),
          password: passwordInput.value
        });

        shell.redirectAfterLogin();
      } catch (error) {
        errorBox.textContent =
          error.message || "Unable to sign in. Please check your credentials.";
        errorBox.classList.remove("hidden");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Sign In";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeLoginPage().catch(function (error) {
      console.error(error);
    });
  });
})();
