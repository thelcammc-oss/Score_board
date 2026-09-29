// DEMO ONLY: Front-end credentials are visible to visitors in source code.
// For a public website, replace this with server-side authentication.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Vibranza@2026";

if (location.pathname.endsWith("/admin.html") || location.pathname === "admin.html") {
  if (sessionStorage.getItem("vibranzaAdminLoggedIn") !== "true") {
    location.replace("login.html");
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("loginError");
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem("vibranzaAdminLoggedIn", "true");
      location.href = "admin.html";
    } else {
      error.textContent = "Incorrect username or password.";
    }
  });
});
function adminLogout() {
  sessionStorage.removeItem("vibranzaAdminLoggedIn");
  location.href = "login.html";
}