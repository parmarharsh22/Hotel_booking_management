document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const roleInput = document.getElementById("role");
    const passwordToggleBtn =
        document.querySelector('button[type="button"]');
    const submitBtn =
        document.querySelector('button[type="submit"]');

    // PASSWORD TOGGLE

    passwordToggleBtn?.addEventListener("click", () => {

        const icon =
            passwordToggleBtn.querySelector("span");

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            if (icon) {
                icon.textContent =
                    "visibility_off";
            }

        } else {

            passwordInput.type = "password";

            if (icon) {
                icon.textContent =
                    "visibility";
            }
        }
    });

    // ==========================
    // EMAIL VALIDATION
    // ==========================

    const validateEmail = (email) => {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);
    };

    // ==========================
    // FORM VALIDATION
    // ==========================

    const validateForm = () => {

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value.trim();

        const role =
            roleInput.value.trim();

        // Email Required

        if (!email) {

            showToast(
                "Email is required",
                "error"
            );

            emailInput.focus();

            return false;
        }

        // Email Format

        if (!validateEmail(email)) {

            showToast(
                "Please enter a valid email address",
                "error"
            );

            emailInput.focus();

            return false;
        }

        // Email Length

        if (email.length > 100) {

            showToast(
                "Email cannot exceed 100 characters",
                "error"
            );

            emailInput.focus();

            return false;
        }

        // Password Required

        if (!password) {

            showToast(
                "Password is required",
                "error"
            );

            passwordInput.focus();

            return false;
        }

        // Password Length

        if (password.length < 8) {

            showToast(
                "Password must be at least 8 characters",
                "error"
            );

            passwordInput.focus();

            return false;
        }

        if (password.length > 64) {

            showToast(
                "Password is too long",
                "error"
            );

            passwordInput.focus();

            return false;
        }

        // Role Validation

        const allowedRoles = [
            "GUEST",
            "FRONT_DESK",
            "ADMIN"
        ];

        if (
            !allowedRoles.includes(role)
        ) {

            showToast(
                "Invalid role selected",
                "error"
            );

            return false;
        }

        // Google reCAPTCHA

        const captchaResponse =
            grecaptcha.getResponse();

        if (!captchaResponse) {

            showToast(
                "Please complete the captcha verification",
                "error"
            );

            return false;
        }

        return true;
    };


    form.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            submitBtn.disabled = true;

            submitBtn.innerHTML = `
                VERIFYING...
            `;

            form.submit();
        }
    );

    emailInput.addEventListener(
        "input",
        () => {

            emailInput.value =
                emailInput.value.trimStart();
        }
    );

});