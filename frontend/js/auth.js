function token() {
    return localStorage.getItem("access_token");
}

function user() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

function requireAuth() {
    if (!token()) {
        window.location.href = "login.html";
    }
}

function msg(text, type = "error") {
    const element = document.getElementById("message");
    if (!element) return;
    element.textContent = text;
    element.className = `message ${type}`;
}

async function api(endpoint, options = {}) {

    const accessToken =
        localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    const publicEndpoints = [
        "/auth/register/",
        "/auth/login/"
    ];

    if (
        accessToken &&
        !publicEndpoints.includes(endpoint)
    ) {
        headers.Authorization =
            `Bearer ${accessToken}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: headers
        }
    );

    const data =
        await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.message ||
            "Something went wrong."
        );
    }

    return data;
}

async function doLogin(username, password) {

    const data = await api("/auth/login/", {
        method: "POST",
        body: JSON.stringify({
            username,
            password
        })
    });

    localStorage.setItem(
        "access_token",
        data.access
    );

    localStorage.setItem(
        "refresh_token",
        data.refresh
    );

    localStorage.setItem(
        "user",
        JSON.stringify(data.user)
    );

    try {

        const profile = await api("/auth/me/");

        localStorage.setItem(
            "user",
            JSON.stringify(profile)
        );

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );
    }

    // Redirect according to user role
    redirectByRole();
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            msg("Signing in...", "");
            try {
                await doLogin(username, password);
            } catch (error) {
                msg(error.message);
            }
        });
    }

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            msg("Creating account...", "");
            try {
                await api("/auth/register/", {
                    method: "POST",
                    body: JSON.stringify({ username, email, password })
                });
                await doLogin(username, password);
            } catch (error) {
                msg(error.message);
            }
        });
    }
});


function redirectByRole() {

    const currentUser = user();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    if (currentUser.role === "ADMIN") {
        window.location.href = "admin-dashboard.html";
        return;
    }

    if (currentUser.role === "AGENT") {
        window.location.href = "agent-dashboard.html";
        return;
    }

    if (currentUser.role === "CUSTOMER") {
        window.location.href = "dashboard.html";
        return;
    }

    logout();
}



/* =========================================================
   ROLE PROTECTION
   ========================================================= */

function requireRole(...allowedRoles) {

    const currentUser = user();

    // User login nahi hai
    if (!currentUser) {
        window.location.href = "login.html";
        return false;
    }

    // User ka role allowed hai
    if (allowedRoles.includes(currentUser.role)) {
        return true;
    }

    // Wrong role ke liye correct dashboard
    if (currentUser.role === "ADMIN") {
        window.location.href = "admin-dashboard.html";
        return false;
    }

    if (currentUser.role === "AGENT") {
        window.location.href = "agent-dashboard.html";
        return false;
    }

    if (currentUser.role === "CUSTOMER") {
        window.location.href = "dashboard.html";
        return false;
    }

    // Unknown role
    logout();

    return false;
}