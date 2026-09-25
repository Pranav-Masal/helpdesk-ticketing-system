/* =========================================================
   ADMIN REGISTRATION
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "adminRegisterForm"
            );


        const message =
            document.getElementById(
                "message"
            );


        const button =
            document.getElementById(
                "registerButton"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                /* =========================================
                   CLEAR MESSAGE
                   ========================================= */

                message.textContent = "";

                message.className =
                    "message";


                /* =========================================
                   GET VALUES
                   ========================================= */

                const username =
                    document
                        .getElementById("username")
                        .value
                        .trim();


                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();


                const password =
                    document
                        .getElementById("password")
                        .value;


                const confirmPassword =
                    document
                        .getElementById("confirmPassword")
                        .value;


                /* =========================================
                   VALIDATION
                   ========================================= */

                if (username.length < 3) {

                    showMessage(
                        "Username must be at least 3 characters.",
                        "error"
                    );

                    return;
                }


                if (password.length < 8) {

                    showMessage(
                        "Password must be at least 8 characters.",
                        "error"
                    );

                    return;
                }


                if (password !== confirmPassword) {

                    showMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    return;
                }


                /* =========================================
                   LOADING STATE
                   ========================================= */

                button.disabled = true;

                button.textContent =
                    "Creating Admin Account...";


                try {

                    /* =====================================
                       API REQUEST
                       ===================================== */

                    const response =
                        await api(
                            "/auth/admin-register/",
                            {
                                method: "POST",

                                body: JSON.stringify({
                                    username,
                                    email,
                                    password
                                })
                            }
                        );


                    console.log(
                        "Admin registration:",
                        response
                    );


                    /* =====================================
                       SUCCESS
                       ===================================== */

                    showMessage(
                        "Admin account created successfully. Redirecting to login...",
                        "success"
                    );


                    form.reset();


                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1200
                    );


                } catch (error) {

                    console.error(
                        "Admin registration error:",
                        error
                    );


                    showMessage(
                        error.message ||
                        "Admin registration failed.",
                        "error"
                    );


                    button.disabled = false;

                    button.textContent =
                        "Create Admin Account";
                }

            }
        );


        /* =============================================
           SHOW MESSAGE
           ============================================= */

        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text;


            message.className =
                `message ${type}`;
        }

    }
);