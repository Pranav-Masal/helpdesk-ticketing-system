// ===============================
// NAVBAR
// ===============================

function nav(currentUser) {

    return `
        <header class="topbar">

            <a
                class="brand"
                href="dashboard.html"
            >
                HelpDesk<span>Pro</span>
            </a>

            <div class="user-menu">

                <strong>
                    ${currentUser.username || "User"}
                </strong>

                <span class="badge">
                    ${currentUser.role || "CUSTOMER"}
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


// ===============================
// INITIALIZE DASHBOARD
// ===============================

async function init() {

    requireAuth();

    const currentUser = user() || {};

    document.getElementById("app").innerHTML = `

        ${nav(currentUser)}

        <main class="main">

            <div class="welcome">

                <div>

                    <span class="eyebrow">
                        SUPPORT WORKSPACE
                    </span>

                    <h1>
                        ${
                            currentUser.role === "CUSTOMER"
                                ? "My Dashboard"
                                : "Support Dashboard"
                        }
                    </h1>

                    <p class="muted">
                        Track tickets and support activity.
                    </p>

                </div>

                ${
                    currentUser.role === "CUSTOMER"

                        ? `
                            <a
                                class="btn btn-primary"
                                href="create-ticket.html"
                            >
                                + New Ticket
                            </a>
                        `

                        : `
                            <a
                                class="btn btn-primary"
                                href="tickets.html"
                            >
                                Manage Tickets
                            </a>
                        `
                }

            </div>


            <!-- ===============================
                 RECENT TICKETS
                 =============================== -->

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
                    id="recent"
                    class="panel"
                >
                    Loading tickets...
                </div>

            </section>

        </main>
    `;


    // ===============================
    // LOAD RECENT TICKETS
    // ===============================

    try {

        const data = await api(
            "/tickets/"
        );

        const tickets =
            Array.isArray(data)
                ? data
                : data.results || [];


        document.getElementById(
            "recent"
        ).innerHTML =

            tickets
                .slice(0, 5)
                .map(ticket => `

                    <a
                        class="ticket-row"
                        href="ticket-details.html?id=${ticket.id}"
                    >

                        <div class="ticket-info">

                            <strong>
                                ${ticket.title}
                            </strong>

                            <small>
                                #${ticket.id}
                                ·
                                ${ticket.priority || "MEDIUM"}
                            </small>

                        </div>


                        <span
                            class="badge ${String(
                                ticket.status
                            ).toLowerCase()}"
                        >
                            ${ticket.status}
                        </span>

                    </a>

                `)
                .join("")

            || `

                <div class="empty">
                    No tickets yet.
                </div>

            `;

    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );

        document.getElementById(
            "recent"
        ).innerHTML = `

            <div class="empty">
                ${error.message}
            </div>

        `;
    }
}


// ===============================
// DOM READY
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    init
);