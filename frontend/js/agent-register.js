document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("agentRegisterForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "";
        message.className = "message";

        const username =
            document.getElementById("username").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const data = await api(
                "/auth/agent-register/",
                {
                    method: "POST",
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                }
            );

            message.textContent =
                "Registration successful. Your account is waiting for admin approval.";

            message.className =
                "message success";

            form.reset();

        } catch (error) {

            console.error(error);

            message.textContent =
                error.message || "Agent registration failed.";

            message.className =
                "message error";
        }
    });
});