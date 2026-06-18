const form = document.getElementById("forgotPasswordForm");
const email = document.getElementById("email");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailValue = email.value.trim();

    if (!validateEmail(emailValue)) {
        return;
    }

    const exists = await checkEmail(emailValue);

    if (!exists) {
        showToast(
            "No account found with this email address",
            "error"
        );
        return;
    }

    form.submit();
});

function validateEmail(emailValue) {
    if (!emailValue) {
        showToast(
            "Please enter your email address",
            "error"
        );

        email.focus();
        return false;
    }

    const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(emailValue)) {
        showToast(
            "Please enter a valid email address",
            "error"
        );

        email.focus();
        return false;
    }

    return true;
}

async function checkEmail(emailValue) {
    try {
        const resp = await fetch("/checkEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailValue
            })
        });

        if (!resp.ok) {
            return false;
        }

        const data = await resp.json();

        return data.exists;
    } catch (err) {
        showToast(
            "Unable to verify email",
            "error"
        );

        return false;
    }
}