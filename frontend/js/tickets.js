function topbar() {

    const currentUser = user() || {};

    const dashboardLink =
        currentUser.role === "AGENT" ||
        currentUser.role === "ADMIN"
            ? "agent-dashboard.html"
            : "dashboard.html";

    return `
        <header class="topbar">

            <a class="brand" href="${dashboardLink}">
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


async function loadTickets() {

    const list =
        document.getElementById("list");

    const status =
        document.getElementById("statusFilter").value;

    const priority =
        document.getElementById("priorityFilter").value;

    const search =
        document.getElementById("searchInput")
            .value
            .trim();


    const params =
        new URLSearchParams();


    if (status) {
        params.set("status", status);
    }

    if (priority) {
        params.set("priority", priority);
    }

    if (search) {
        params.set("search", search);
    }


    try {

        const query =
            params.toString()
                ? `?${params.toString()}`
                : "";

        const data =
            await api(`/tickets/${query}`);


        const tickets =
            Array.isArray(data)
                ? data
                : data.results || [];


        list.innerHTML = tickets
            .map(ticket => `

                <a
                    class="ticket-card"
                    href="ticket-details.html?id=${ticket.id}"
                >

                    <div class="ticket-main">

                        <h3>
                            #${ticket.id}
                            —
                            ${ticket.title}
                        </h3>

                        <p>
                            ${(ticket.description || "")
                                .slice(0, 140)}
                        </p>

                        <small>
                            Customer:
                            ${ticket.created_by || "—"}

                            ·

                            Agent:
                            ${ticket.assigned_to || "Unassigned"}
                        </small>

                    </div>


                    <div class="ticket-meta">

                        <span
                            class="badge ${String(
                                ticket.status
                            ).toLowerCase()}"
                        >
                            ${ticket.status}
                        </span>

                        <span class="badge">
                            ${ticket.priority || "MEDIUM"}
                        </span>

                    </div>

                </a>

            `)
            .join("");


        if (!tickets.length) {

            list.innerHTML = `
                <div class="empty">
                    No tickets found.
                </div>
            `;
        }

    } catch (error) {

        console.error(
            "Ticket loading error:",
            error
        );

        list.innerHTML = `
            <div class="empty">
                ${error.message}
            </div>
        `;
    }
}


function init() {

    requireAuth();


    const currentUser =
        user() || {};


    const isAgent =
        currentUser.role === "AGENT" ||
        currentUser.role === "ADMIN";


    document.getElementById("app").innerHTML = `

        ${topbar()}


        <main class="content">


            <div class="page-head">

                <div>

                    <span class="eyebrow">
                        ${isAgent ? "SUPPORT MANAGEMENT" : "SUPPORT"}
                    </span>

                    <h1>
                        ${isAgent
                            ? "Manage Tickets"
                            : "My Tickets"}
                    </h1>

                </div>


                ${
                    !isAgent
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
                                href="agent-dashboard.html"
                            >
                                Dashboard
                            </a>
                        `
                }

            </div>


            <div class="filters">

                <input
                    id="searchInput"
                    type="search"
                    placeholder="Search tickets..."
                >


                <select id="statusFilter">

                    <option value="">
                        All Statuses
                    </option>

                    <option value="OPEN">
                        OPEN
                    </option>

                    <option value="ASSIGNED">
                        ASSIGNED
                    </option>

                    <option value="IN_PROGRESS">
                        IN_PROGRESS
                    </option>

                    <option value="RESOLVED">
                        RESOLVED
                    </option>

                    <option value="CLOSED">
                        CLOSED
                    </option>

                </select>


                ${
                    isAgent
                        ? `
                            <select id="priorityFilter">

                                <option value="">
                                    All Priorities
                                </option>

                                <option value="LOW">
                                    LOW
                                </option>

                                <option value="MEDIUM">
                                    MEDIUM
                                </option>

                                <option value="HIGH">
                                    HIGH
                                </option>

                                <option value="URGENT">
                                    URGENT
                                </option>

                            </select>
                        `
                        : ""
                }

            </div>


            <div
                id="list"
                class="ticket-list"
            >
            </div>


        </main>

    `;


    document
        .getElementById("statusFilter")
        .addEventListener(
            "change",
            loadTickets
        );


    document
        .getElementById("searchInput")
        .addEventListener(
            "input",
            loadTickets
        );


    if (isAgent) {

        document
            .getElementById("priorityFilter")
            .addEventListener(
                "change",
                loadTickets
            );

    }


    loadTickets();
}


document.addEventListener(
    "DOMContentLoaded",
    init
);