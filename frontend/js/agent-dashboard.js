/* =========================================================
   HELP DESK PRO
   AGENT DASHBOARD
   ========================================================= */


/* =========================================================
   NAVIGATION
   ========================================================= */

function nav(currentUser) {

    return `
        <header class="topbar">

            <a
                class="brand"
                href="agent-dashboard.html"
            >
                HelpDesk<span>Pro</span>
            </a>


            <div class="user-menu">

                <strong>
                    ${currentUser.username || "Agent"}
                </strong>


                <span class="badge">
                    ${currentUser.role || "AGENT"}
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
   INITIALIZE DASHBOARD
   ========================================================= */

async function init() {

    /*
       Only AGENT can access this dashboard.
       ADMIN goes to admin-dashboard.html.
       CUSTOMER goes to dashboard.html.
    */

    if (!requireRole("AGENT")) {
        return;
    }


    const currentUser =
        user() || {};


    document.getElementById("app").innerHTML = `

        ${nav(currentUser)}


        <main class="main">


            <!-- =========================================
                 WELCOME
                 ========================================= -->

            <div class="welcome">

                <div>

                    <span class="eyebrow">
                        SUPPORT WORKSPACE
                    </span>


                    <h1>
                        Agent Dashboard
                    </h1>


                    <p class="muted">
                        Manage customer support tickets
                        and resolve issues.
                    </p>

                </div>


                <a
                    class="btn btn-primary"
                    href="tickets.html"
                >
                    Manage Tickets
                </a>

            </div>


            <!-- =========================================
                 STATISTICS
                 ========================================= -->

            <section class="stats-grid">


                <!-- Total -->

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


                <!-- Open -->

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


                <!-- Assigned -->

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


                <!-- In Progress -->

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


                <!-- Resolved -->

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


                <!-- Urgent -->

                <div class="stat-card">

                    <span class="stat-label">
                        Urgent
                    </span>


                    <strong
                        id="urgentTickets"
                        class="stat-value"
                    >
                        -
                    </strong>

                </div>


            </section>


            <!-- =========================================
                 RECENT TICKETS
                 ========================================= -->

            <section class="section">


                <div class="section-head">

                    <h2>
                        Recent Tickets
                    </h2>


                    <a
                        class="btn btn-outline"
                        href="tickets.html"
                    >
                        View All
                    </a>

                </div>


                <div
                    id="recentTickets"
                    class="panel"
                >

                    <div class="loading">
                        Loading tickets...
                    </div>

                </div>


            </section>


        </main>
    `;


    /*
       Load dashboard data
    */

    await loadStats();

    await loadTickets();
}


/* =========================================================
   LOAD DASHBOARD STATISTICS
   ========================================================= */

async function loadStats() {

    try {

        const stats =
            await api(
                "/tickets/dashboard/stats/"
            );


        const totalElement =
            document.getElementById(
                "totalTickets"
            );

        const openElement =
            document.getElementById(
                "openTickets"
            );

        const assignedElement =
            document.getElementById(
                "assignedTickets"
            );

        const progressElement =
            document.getElementById(
                "progressTickets"
            );

        const resolvedElement =
            document.getElementById(
                "resolvedTickets"
            );

        const urgentElement =
            document.getElementById(
                "urgentTickets"
            );


        if (totalElement) {

            totalElement.textContent =
                stats.total ?? 0;
        }


        if (openElement) {

            openElement.textContent =
                stats.open ?? 0;
        }


        if (assignedElement) {

            assignedElement.textContent =
                stats.assigned ?? 0;
        }


        if (progressElement) {

            progressElement.textContent =
                stats.in_progress ?? 0;
        }


        if (resolvedElement) {

            resolvedElement.textContent =
                stats.resolved ?? 0;
        }


        if (urgentElement) {

            urgentElement.textContent =
                stats.urgent ?? 0;
        }


    } catch (error) {

        console.error(
            "Stats loading error:",
            error
        );


        /*
           Keep dashboard usable even
           if statistics fail.
        */

        const elements = [
            "totalTickets",
            "openTickets",
            "assignedTickets",
            "progressTickets",
            "resolvedTickets",
            "urgentTickets"
        ];


        elements.forEach(id => {

            const element =
                document.getElementById(id);

            if (element) {
                element.textContent = "—";
            }

        });
    }
}


/* =========================================================
   LOAD RECENT TICKETS
   ========================================================= */

async function loadTickets() {

    const container =
        document.getElementById(
            "recentTickets"
        );


    if (!container) {
        return;
    }


    /*
       Show loading state
    */

    container.innerHTML = `
        <div class="loading">
            Loading tickets...
        </div>
    `;


    try {

        const data =
            await api("/tickets/");


        const tickets =
            Array.isArray(data)
                ? data
                : data.results || [];


        /*
           Empty state
        */

        if (!tickets.length) {

            container.innerHTML = `
                <div class="empty">
                    No tickets available.
                </div>
            `;

            return;
        }


        /*
           Recent 8 tickets
        */

        container.innerHTML =
            tickets
                .slice(0, 8)
                .map(ticket => {

                    const status =
                        String(
                            ticket.status || ""
                        ).toLowerCase();


                    return `

                        <a
                            class="ticket-row"
                            href="ticket-details.html?id=${ticket.id}"
                        >


                            <div class="ticket-info">


                                <strong>
                                    ${escapeHtml(
                                        ticket.title ||
                                        "Untitled Ticket"
                                    )}
                                </strong>


                                <small>

                                    #${ticket.id}

                                    ·

                                    ${
                                        ticket.priority ||
                                        "MEDIUM"
                                    }

                                </small>


                            </div>


                            <span
                                class="badge ${status}"
                            >
                                ${
                                    ticket.status ||
                                    "UNKNOWN"
                                }
                            </span>


                        </a>

                    `;
                })
                .join("");


    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );


        container.innerHTML = `

            <div class="error-state">

                <strong>
                    Unable to load tickets
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
   ESCAPE HTML
   ========================================================= */

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
   START DASHBOARD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);