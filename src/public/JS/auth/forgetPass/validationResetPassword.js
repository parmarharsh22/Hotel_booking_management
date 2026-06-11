const form = document.getElementById("resetPasswordForm");
const submitBtn = document.getElementById("submitbtn");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    clearErrors();

    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmpassword");
    const otp = document.getElementById("otp");

    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();
    const otpValue = otp.value.trim();

    if (!passwordValue || !confirmPasswordValue || !otpValue) {
        showToast("All fields are required", "error");
        return;
    }

    const passwordRegex =
        /^(?=.*[A-Z])(?=.*[\$\@\*\%\#\!]).{8,}$/;

    if (!passwordRegex.test(passwordValue)) {
        password.classList.add("border-red-500");
        showToast(
            "Password must contain 1 uppercase letter, 1 special character and be at least 8 characters long",
            "error"
        );
        password.focus();
        return;
    }

    if (passwordValue !== confirmPasswordValue) {
        confirmPassword.classList.add("border-red-500");
        showToast("Passwords do not match", "error");
        confirmPassword.focus();
        return;
    }

    if (!/^\d{4}$/.test(otpValue)) {
        otp.classList.add("border-red-500");
        showToast("OTP must be a 4-digit number", "error");
        otp.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Verifying OTP...";

    const isOtpValid = await checkOtp(otpValue);

    if (!isOtpValid) {
        otp.classList.add("border-red-500");

        showToast(
            "Invalid or expired OTP",
            "error"
        );

        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            Reset Password
            <span class="material-symbols-outlined">
                arrow_forward
            </span>
        `;

        otp.focus();
        return;
    }

    submitBtn.innerHTML = "Processing...";

    form.submit();
});

function clearErrors() {
    document
        .querySelectorAll("input")
        .forEach(input => {
            input.classList.remove("border-red-500");
        });
}

async function checkOtp(otp) {
    try {
        const response = await fetch("/checkOtp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ otp })
        });

        return response.ok;
    } catch (err) {
        showToast(
            "Unable to verify OTP. Please try again.",
            "error"
        );

        return false;
    }
}