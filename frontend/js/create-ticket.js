function init() {
    requireAuth();

    document.getElementById("app").innerHTML = `
        <header class="topbar">
            <a class="brand" href="dashboard.html">HelpDesk<span>Pro</span></a>
            <button class="btn btn-outline" onclick="logout()">Logout</button>
        </header>
        <main class="content">
            <a class="back" href="tickets.html">← Back</a>
            <div class="form-card">
                <span class="eyebrow">NEW REQUEST</span>
                <h1>Create Ticket</h1>
                <p class="muted">Tell the support team what went wrong.</p>
                <form id="form">
                    <label>Title<input id="title" type="text" required maxlength="200"></label>
                    <label>Description<textarea id="description" required></textarea></label>
                    <label>Category<input id="category" type="text" value="General" maxlength="100"></label>
                    <label>Priority<select id="priority"><option value="LOW">LOW</option><option value="MEDIUM" selected>MEDIUM</option><option value="HIGH">HIGH</option><option value="URGENT">URGENT</option></select></label>
                    <div id="message" class="message"></div>
                    <button type="submit" class="btn btn-primary">Create Ticket</button>
                </form>
            </div>
        </main>
    `;

    document.getElementById("form").addEventListener("submit", createTicket);
}

async function createTicket(event) {
    event.preventDefault();
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value.trim() || "General";
    const priority = document.getElementById("priority").value;
    const message = document.getElementById("message");
    const button = event.target.querySelector('button[type="submit"]');

    try {
        button.disabled = true;
        button.textContent = "Creating Ticket...";
        const ticket = await api("/tickets/", {
            method: "POST",
            body: JSON.stringify({ title, description, category, priority })
        });
        if (!ticket.id) throw new Error("Ticket created, but ticket ID was not returned.");
        window.location.href = `ticket-details.html?id=${ticket.id}`;
    } catch (error) {
        message.textContent = error.message;
        message.className = "message error";
        button.disabled = false;
        button.textContent = "Create Ticket";
    }
}

document.addEventListener("DOMContentLoaded", init);
