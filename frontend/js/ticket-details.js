const ticketId = new URLSearchParams(window.location.search).get("id");

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
}

async function loadTicket() {
    if (!ticketId) throw new Error("Ticket ID is missing.");
    const ticket = await api(`/tickets/${ticketId}/`);
    renderTicket(ticket);
    await loadComments();
}

function renderTicket(ticket) {
    const currentUser = user() || {};
    document.getElementById("ticket").innerHTML = `
        <article class="detail-card">
            <div class="detail-title">
                <div><span class="eyebrow">TICKET #${ticket.id}</span><h1>${escapeHtml(ticket.title)}</h1></div>
                <span class="badge ${String(ticket.status).toLowerCase()}">${ticket.status}</span>
            </div>
            <p class="description">${escapeHtml(ticket.description)}</p>
            ${ticket.resolution ? `<div class="resolution"><strong>Resolution</strong><p>${escapeHtml(ticket.resolution)}</p></div>` : ""}
            <div class="actions">${actionButtons(ticket, currentUser)}</div>
            <div class="comments">
                <h2>Conversation</h2>
                <div id="comments"></div>
                <form id="commentForm">
                    <label>Comment<textarea id="comment" required placeholder="Write a message..."></textarea></label>
                    <button type="submit" class="btn btn-primary">Send Comment</button>
                </form>
            </div>
        </article>
    `;

    document.getElementById("side").innerHTML = `
        <div class="meta-list">
            <div class="meta-item"><small>Status</small><strong>${ticket.status}</strong></div>
            <div class="meta-item"><small>Priority</small><strong>${ticket.priority}</strong></div>
            <div class="meta-item"><small>Customer</small><strong>${escapeHtml(ticket.created_by || "—")}</strong></div>
            <div class="meta-item"><small>Agent</small><strong>${escapeHtml(ticket.assigned_to || "Unassigned")}</strong></div>
            <div class="meta-item"><small>Created</small><strong>${new Date(ticket.created_at).toLocaleString()}</strong></div>
        </div>
    `;
    document.getElementById("commentForm").addEventListener("submit", addComment);
}

function actionButtons(ticket, currentUser) {
    let html = "";
    if ((currentUser.role === "AGENT" || currentUser.role === "ADMIN") && ticket.status === "OPEN") {
        html += `<button class="btn btn-primary" onclick="assignToMe()">Assign To Me</button>`;
    }
    if ((currentUser.role === "AGENT" || currentUser.role === "ADMIN") && ticket.status === "ASSIGNED") {
        html += `<button class="btn btn-primary" onclick="setStatus('IN_PROGRESS')">Start Work</button>`;
    }
    if ((currentUser.role === "AGENT" || currentUser.role === "ADMIN") && !["RESOLVED", "CLOSED"].includes(ticket.status)) {
        html += `<button class="btn btn-success" onclick="resolveTicket()">Resolve Ticket</button>`;
    }
    if (currentUser.role === "CUSTOMER" && ticket.status === "RESOLVED") {
        html += `<button class="btn btn-success" onclick="closeTicket()">Close Ticket</button>`;
    }
    return html;
}

async function loadComments() {
    const container = document.getElementById("comments");
    try {
        const data = await api(`/tickets/${ticketId}/comments/`);
        const comments = Array.isArray(data) ? data : data.results || [];
        container.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-head"><strong>${escapeHtml(comment.author || "User")}</strong><span>${comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}</span></div>
                <p>${escapeHtml(comment.message)}</p>
            </div>
        `).join("") || `<p class="muted">No comments yet.</p>`;
    } catch (error) {
        container.textContent = error.message;
    }
}

async function addComment(event) {
    event.preventDefault();
    const input = document.getElementById("comment");
    try {
        await api(`/tickets/${ticketId}/comments/`, { method: "POST", body: JSON.stringify({ message: input.value.trim() }) });
        input.value = "";
        await loadComments();
    } catch (error) {
        alert(error.message);
    }
}

async function assignToMe() {
    const currentUser = user() || {};
    if (!currentUser.id) return alert("User profile is missing.");
    try {
        await api(`/tickets/${ticketId}/assign/`, { method: "PATCH", body: JSON.stringify({ agent_id: currentUser.id }) });
        await loadTicket();
    } catch (error) { alert(error.message); }
}

async function setStatus(status) {
    try {
        await api(`/tickets/${ticketId}/status/`, { method: "PATCH", body: JSON.stringify({ status }) });
        await loadTicket();
    } catch (error) { alert(error.message); }
}

async function resolveTicket() {
    const resolution = prompt("Enter resolution details:");
    if (!resolution || !resolution.trim()) return;
    try {
        await api(`/tickets/${ticketId}/resolve/`, { method: "POST", body: JSON.stringify({ resolution: resolution.trim() }) });
        await loadTicket();
    } catch (error) { alert(error.message); }
}

async function closeTicket() {
    try {
        await api(`/tickets/${ticketId}/close/`, { method: "PATCH" });
        await loadTicket();
    } catch (error) { alert(error.message); }
}

function init() {
    requireAuth();
    document.getElementById("app").innerHTML = `
        <header class="topbar"><a class="brand" href="dashboard.html">HelpDesk<span>Pro</span></a><button class="btn btn-outline" onclick="logout()">Logout</button></header>
        <main class="details-layout"><section><a class="back" href="tickets.html">← Back to tickets</a><div id="ticket"></div></section><aside><div id="side" class="side-card">Loading...</div></aside></main>
    `;
    loadTicket().catch(error => {
        document.getElementById("ticket").innerHTML = `<div class="detail-card">${escapeHtml(error.message)}</div>`;
        document.getElementById("side").textContent = "Unable to load ticket.";
    });
}

document.addEventListener("DOMContentLoaded", init);
