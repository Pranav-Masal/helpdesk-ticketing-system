
/* =========================================================
   HELP DESK PRO
   ADMIN DASHBOARD
   ========================================================= */


/* =========================================================
   NAVIGATION
   ========================================================= */

function adminNav(currentUser) {
    return `
        <header class="topbar">
            <a
                class="brand"
                href="admin-dashboard.html"
            >
                HelpDesk<span>Pro</span>
            </a>

            <div class="user-menu">
                <strong>
                    ${escapeHtml(
                        currentUser.username || "Admin"
                    )}
                </strong>

                <span class="badge">
                    ADMIN
                </span>

                <button
                    class="btn btn-outline"
                    onclick="logout()"
                >
                    Logout
                </button>
            </div>
        </header>
    `;
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initAdminDashboard() {

    if (!requireRole("ADMIN")) {
        return;
    }

    const currentUser = user() || {};

    document.getElementById("app").innerHTML = `
        ${adminNav(currentUser)}

        <main class="main">

            <!-- =========================================
                 HEADER
                 ========================================= -->

            <div class="welcome">
                <div>
                    <span class="eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p class="muted">
                        Monitor support operations
                        and manage your support team.
                    </p>
                </div>

                <a
                    class="btn btn-primary"
                    href="tickets.html"
                >
                    View All Tickets
                </a>
            </div>


            <!-- =========================================
                 TICKET STATISTICS
                 ========================================= -->

            <section class="stats-grid">

                <div class="stat-card">
                    <span class="stat-label">
                        Total Tickets
                    </span>

                    <strong
                        id="totalTickets"
                        class="stat-value"
                    >
                        -
                    </strong>
                </div>


                <div class="stat-card">
                    <span class="stat-label">
                        Open
                    </span>

                    <strong
                        id="openTickets"
                        class="stat-value"
                    >
                        -
                    </strong>
                </div>


                <div class="stat-card">
                    <span class="stat-label">
                        Assigned
                    </span>

                    <strong
                        id="assignedTickets"
                        class="stat-value"
                    >
                        -
                    </strong>
                </div>


                <div class="stat-card">
                    <span class="stat-label">
                        In Progress
                    </span>

                    <strong
                        id="progressTickets"
                        class="stat-value"
                    >
                        -
                    </strong>
                </div>


                <div class="stat-card">
                    <span class="stat-label">
                        Resolved
                    </span>

                    <strong
                        id="resolvedTickets"
                        class="stat-value"
                    >
                        -
                    </strong>
                </div>


                <div class="stat-card">
                    <span class="stat-label">
                        Closed
                    </span>

                    <strong
                        id="closedTickets"
                        class="stat-value"
                    >
                        -
                    </strong>
                </div>

            </section>


            <!-- =========================================
                 PENDING AGENT APPROVAL
                 ========================================= -->

            <section class="section">

                <div class="section-head">

                    <div>
                        <span class="eyebrow">
                            APPROVAL QUEUE
                        </span>

                        <h2>
                            Pending Agents
                        </h2>

                        <p class="muted">
                            Review agent registrations
                            waiting for your approval.
                        </p>
                    </div>

                    <button
                        class="btn btn-outline"
                        onclick="loadPendingAgents()"
                    >
                        Refresh
                    </button>

                </div>


                <div
                    id="pendingAgentsContainer"
                    class="panel admin-panel"
                >
                    <div class="loading">
                        Loading pending agents...
                    </div>
                </div>

            </section>


            <!-- =========================================
                 AGENT MANAGEMENT
                 ========================================= -->

            <section class="section">

                <div class="section-head">

                    <div>
                        <span class="eyebrow">
                            SUPPORT TEAM
                        </span>

                        <h2>
                            Agent Management
                        </h2>
                    </div>

                    <button
                        class="btn btn-outline"
                        onclick="loadAgents()"
                    >
                        Refresh
                    </button>

                </div>


                <div
                    id="agentsContainer"
                    class="panel admin-panel"
                >
                    <div class="loading">
                        Loading agents...
                    </div>
                </div>

            </section>


            <!-- =========================================
                 TICKET MANAGEMENT
                 ========================================= -->

            <section class="section">

                <div class="section-head">

                    <div>
                        <span class="eyebrow">
                            TICKET OPERATIONS
                        </span>

                        <h2>
                            Ticket Management
                        </h2>

                        <p class="muted">
                            Review and manage all customer tickets.
                        </p>
                    </div>

                    <a
                        class="btn btn-primary"
                        href="tickets.html"
                    >
                        Manage Tickets
                    </a>

                </div>

            </section>

        </main>
    `;


    await loadStats();

    await loadPendingAgents();

    await loadAgents();
}


/* =========================================================
   LOAD STATISTICS
   ========================================================= */

async function loadStats() {

    try {

        const stats = await api(
            "/tickets/dashboard/stats/"
        );


        setText(
            "totalTickets",
            stats.total ?? 0
        );

        setText(
            "openTickets",
            stats.open ?? 0
        );

        setText(
            "assignedTickets",
            stats.assigned ?? 0
        );

        setText(
            "progressTickets",
            stats.in_progress ?? 0
        );

        setText(
            "resolvedTickets",
            stats.resolved ?? 0
        );

        setText(
            "closedTickets",
            stats.closed ?? 0
        );

    } catch (error) {

        console.error(
            "Admin stats error:",
            error
        );

        [
            "totalTickets",
            "openTickets",
            "assignedTickets",
            "progressTickets",
            "resolvedTickets",
            "closedTickets"
        ].forEach(id => {

            setText(id, "—");

        });
    }
}


/* =========================================================
   LOAD PENDING AGENTS
   ========================================================= */

async function loadPendingAgents() {

    const container =
        document.getElementById(
            "pendingAgentsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading">
            Loading pending agents...
        </div>
    `;


    try {

        const data = await api(
            "/tickets/agents/pending/"
        );


        const agents =
            Array.isArray(data)
                ? data
                : data.results || [];


        if (!agents.length) {

            container.innerHTML = `
                <div class="empty">
                    No pending agent registrations.
                </div>
            `;

            return;
        }


        container.innerHTML =
            agents.map(agent => {

                const initial =
                    String(
                        agent.username || "A"
                    )
                        .charAt(0)
                        .toUpperCase();


                const joinedDate =
                    agent.created_at
                        ? new Date(
                            agent.created_at
                        ).toLocaleDateString()
                        : "Recently";


                return `
                    <div class="agent-row">

                        <div class="agent-info">

                            <div class="agent-avatar">
                                ${escapeHtml(initial)}
                            </div>


                            <div>

                                <strong>
                                    ${escapeHtml(
                                        agent.username
                                    )}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        agent.email ||
                                        "No email"
                                    )}
                                </small>

                                <small>
                                    Registered:
                                    ${escapeHtml(
                                        joinedDate
                                    )}
                                </small>

                            </div>

                        </div>


                        <div class="agent-actions">

                            <span class="badge">
                                PENDING
                            </span>


                            <button
                                class="btn btn-primary"
                                onclick="approveAgent(${agent.id})"
                            >
                                Approve
                            </button>


                            <button
                                class="btn btn-outline"
                                onclick="rejectAgent(${agent.id})"
                            >
                                Reject
                            </button>

                        </div>

                    </div>
                `;
            }).join("");


    } catch (error) {

        console.error(
            "Pending agent loading error:",
            error
        );


        container.innerHTML = `
            <div class="error-state">

                <strong>
                    Unable to load pending agents
                </strong>

                <span>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}
                </span>

            </div>
        `;
    }
}


/* =========================================================
   APPROVE AGENT
   ========================================================= */

async function approveAgent(agentId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to approve this agent?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await api(
            `/tickets/agents/${agentId}/approval/`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    approval_status: "APPROVED"
                })
            }
        );


        alert(
            "Agent approved successfully."
        );


        await loadPendingAgents();

        await loadAgents();


    } catch (error) {

        console.error(
            "Agent approval error:",
            error
        );


        alert(
            error.message ||
            "Unable to approve agent."
        );
    }
}


/* =========================================================
   REJECT AGENT
   ========================================================= */

async function rejectAgent(agentId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to reject this agent?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await api(
            `/tickets/agents/${agentId}/approval/`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    approval_status: "REJECTED"
                })
            }
        );


        alert(
            "Agent rejected successfully."
        );


        await loadPendingAgents();

        await loadAgents();


    } catch (error) {

        console.error(
            "Agent rejection error:",
            error
        );


        alert(
            error.message ||
            "Unable to reject agent."
        );
    }
}


/* =========================================================
   LOAD AGENTS
   ========================================================= */

async function loadAgents() {

    const container =
        document.getElementById(
            "agentsContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading">
            Loading agents...
        </div>
    `;


    try {

        const data = await api(
            "/tickets/agents/"
        );


        const agents =
            Array.isArray(data)
                ? data
                : data.results || [];


        if (!agents.length) {

            container.innerHTML = `
                <div class="empty">
                    No support agents found.
                </div>
            `;

            return;
        }


        container.innerHTML =
            agents.map(agent => {

                const active =
                    agent.is_active !== false;


                const initial =
                    String(
                        agent.username || "A"
                    )
                        .charAt(0)
                        .toUpperCase();


                return `
                    <div class="agent-row">

                        <div class="agent-info">

                            <div class="agent-avatar">
                                ${escapeHtml(initial)}
                            </div>


                            <div>

                                <strong>
                                    ${escapeHtml(
                                        agent.username
                                    )}
                                </strong>

                                <small>
                                    ${escapeHtml(
                                        agent.email ||
                                        "No email"
                                    )}
                                </small>

                            </div>

                        </div>


                        <div class="agent-actions">

                            <span
                                class="badge ${
                                    active
                                        ? "resolved"
                                        : "closed"
                                }"
                            >
                                ${
                                    active
                                        ? "ACTIVE"
                                        : "INACTIVE"
                                }
                            </span>


                            <button
                                class="btn btn-outline"
                                onclick="toggleAgent(${agent.id})"
                            >
                                ${
                                    active
                                        ? "Deactivate"
                                        : "Activate"
                                }
                            </button>

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        console.error(
            "Agent loading error:",
            error
        );


        container.innerHTML = `
            <div class="error-state">

                <strong>
                    Unable to load agents
                </strong>

                <span>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}
                </span>

            </div>
        `;
    }
}


/* =========================================================
   TOGGLE AGENT
   ========================================================= */

async function toggleAgent(agentId) {

    const confirmed =
        window.confirm(
            "Are you sure you want to change this agent's status?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await api(
            `/tickets/agents/${agentId}/toggle/`,
            {
                method: "PATCH"
            }
        );


        await loadAgents();


    } catch (error) {

        console.error(
            "Agent status error:",
            error
        );


        alert(
            error.message ||
            "Unable to update agent status."
        );
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent = value;
    }
}


function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /[&<>'"]/g,
            char => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;"
            }[char])
        );
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initAdminDashboard
);

