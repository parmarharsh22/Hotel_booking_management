function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling;

    if (input.type === "password") {
        input.type = "text";
        icon.innerText = "visibility_off";
    } else {
        input.type = "password";
        icon.innerText = "visibility";
    }
}

const inputs = document.querySelectorAll(
    'input:not([type="checkbox"]):not([type="file"])'
);

inputs.forEach(input => {
    input.addEventListener("focus", () => {
        input.parentElement.classList.add("scale-[1.01]");
    });

    input.addEventListener("blur", () => {
        input.parentElement.classList.remove("scale-[1.01]");
    });
});

function showError(inputElement, message) {

    const fieldContainer = inputElement.closest('.space-y-1\\.5');

    let errorSpan = fieldContainer.querySelector('.input-error');

    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'input-error text-red-600 text-sm mt-1 block';
        fieldContainer.appendChild(errorSpan);
    }

    errorSpan.textContent = message;

    inputElement.classList.add('border-error');
}

function openTermsModal() {
    document.getElementById('termsModal').classList.remove('hidden');
    document.getElementById('termsModal').classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
    document.getElementById('termsModal').classList.remove('flex');
    document.getElementById('termsModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function acceptTerms() {
    document.getElementById('terms').checked = true;
    closeTermsModal();
}

function clearError(inputElement) {

    if (!inputElement) {
        console.warn("clearError(): inputElement is null");
        return;
    }

    const parent = inputElement.parentElement;

    if (!parent) {
        console.warn("clearError(): parentElement not found");
        return;
    }

    const errorSpan = parent.querySelector(".input-error");

    if (errorSpan) {
        errorSpan.remove();
    }

    inputElement.classList.remove("border-error");
}

/* ===========================================
   DOM Elements
=========================================== */

const firstName = document.getElementById('first_name');
const lastName = document.getElementById('last_name');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm_password');
const terms = document.getElementById('terms');
const photo = document.getElementById('photo');
const state = document.getElementById("state");
const city = document.getElementById("city");

const form = document.getElementById("registrationForm");

/* ===========================================
   Regex
=========================================== */

const nameRegex = /^[A-Za-z\s'-]{3,100}$/;

const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const phoneRegex =
    /^[6-9]\d{9}$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* ===========================================
   Submit Validation
=========================================== */

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    let isValid = true;

    if (!nameRegex.test(firstName.value.trim())) {

        showError(
            firstName,
            "First name must contain at least 3 letters"
        );

        isValid = false;

    } else {
        clearError(firstName);
    }

    /* Last Name */

    if (!nameRegex.test(lastName.value.trim())) {

        showError(
            lastName,
            "Last name must contain at least 3 letters"
        );

        isValid = false;

    } else {
        clearError(lastName);
    }

    /* Email */

    if (!emailRegex.test(email.value.trim())) {

        showError(
            email,
            "Please enter a valid email address"
        );

        isValid = false;

    } else {
        clearError(email);
    }

    /* Phone */

    if (
        phone.value.trim() !== "" &&
        !phoneRegex.test(phone.value.trim())
    ) {

        showError(
            phone,
            "Enter a valid 10 digit Indian mobile number"
        );

        isValid = false;

    } else {
        clearError(phone);
    }

    /* Password */

    if (!passwordRegex.test(password.value)) {

        showError(
            password,
            "Min 8 chars, uppercase, lowercase, number and special character required"
        );

        isValid = false;

    } else {
        clearError(password);
    }

    /* Confirm Password */

    if (password.value !== confirmPassword.value) {

        showError(
            confirmPassword,
            "Passwords do not match"
        );

        isValid = false;

    } else {
        clearError(confirmPassword);
    }

    /* Profile Photo */

    if (photo && photo.files.length > 0) {

        const file = photo.files[0];

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        const maxSize = 5 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {

            showError(
                photo,
                "Only JPG, JPEG, PNG and WEBP files are allowed"
            );

            isValid = false;

        } else {
            clearError(photo);
        }

        if (file.size > maxSize) {

            showError(
                photo,
                "File size cannot exceed 5 MB"
            );

            isValid = false;

        }
    }

    /* Terms */

    if (!terms.checked) {

        alert(
            "Please accept Terms & Conditions before continuing."
        );

        isValid = false;
    }

    /* State and city */
    if (!state.value) {
        showError(state, "Please select a state");
        isValid = false;
    } else {
        clearError(state);
    }
    if (!city.value) {
        showError(city, "Please select a city");
        isValid = false;
    } else {
        clearError(city);
    }

    /* Stop Submission */

    if (!isValid) {
        return;
    }

    /* Success Animation */

    const btn =
        document.querySelector('button[type="submit"], input[type="submit"]');

    if (btn) {

        const originalContent =
            btn.tagName === "BUTTON"
                ? btn.innerHTML
                : btn.value;

        btn.disabled = true;

        if (btn.tagName === "BUTTON") {

            btn.innerHTML =
                '<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...';

        } else {

            btn.value = "Processing...";
        }

        setTimeout(async () => {

            if (btn.tagName === "BUTTON") {

                btn.innerHTML =
                    '<span class="material-symbols-outlined">check_circle</span> Registration Successful';

            } else {

                btn.value = "Registration Successful";
            }
            console.log("Validation Passed");

            try {

                const response = await fetch(
                    "/checkEmail",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email.value.trim()
                        })
                    }
                );

                const data = await response.json();

                if (data.exists) {

                    showError(
                        email,
                        "An account with this email already exists"
                    );
                    console.log("Email invalid");
                    return;
                }

                form.submit();

            }
            catch (error) {

                console.error(
                    "Email validation failed",
                    error
                );

                alert(
                    "Unable to verify email at the moment."
                );
            }

        }, 1000);
    }
});

const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");

/*
|--------------------------------------------------------------------------
| Load Indian States
|--------------------------------------------------------------------------
*/

async function loadStates() {

    try {

        const response = await fetch(
            "https://countriesnow.space/api/v0.1/countries/states",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    country: "India"
                })
            }
        );

        const result = await response.json();

        if (!result.data || !result.data.states) return;

        stateSelect.innerHTML =
            '<option value="">Select State</option>';

        result.data.states
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(state => {

                const option = document.createElement("option");

                option.value = state.name;
                option.textContent = state.name;

                stateSelect.appendChild(option);
            });

    } catch (error) {

        console.error("Error loading states:", error);

    }

}

/*
|--------------------------------------------------------------------------
| Load Cities
|--------------------------------------------------------------------------
*/

async function loadCities(stateName) {

    try {

        citySelect.innerHTML =
            '<option value="">Loading Cities...</option>';

        citySelect.disabled = true;

        const response = await fetch(
            "https://countriesnow.space/api/v0.1/countries/state/cities",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    country: "India",
                    state: stateName
                })
            }
        );

        const result = await response.json();

        citySelect.innerHTML =
            '<option value="">Select City</option>';

        result.data
            .sort((a, b) => a.localeCompare(b))
            .forEach(city => {

                const option = document.createElement("option");

                option.value = city;
                option.textContent = city;

                citySelect.appendChild(option);

            });

        citySelect.disabled = false;

    } catch (error) {

        console.error("Error loading cities:", error);

        citySelect.innerHTML =
            '<option value="">Unable to load cities</option>';

    }

}

/*
|--------------------------------------------------------------------------
| State Change Event
|--------------------------------------------------------------------------
*/

stateSelect.addEventListener("change", function () {

    const selectedState = this.value;

    citySelect.innerHTML =
        '<option value="">Select City</option>';

    citySelect.disabled = true;

    if (!selectedState) return;

    loadCities(selectedState);

});

document.addEventListener("DOMContentLoaded", () => {

    loadStates();

});

// Dynamically show the selected photo of the user
const photoInput = document.getElementById("photo");
const previewContainer = document.getElementById("photoPreviewContainer");
const previewImage = document.getElementById("photoPreview");
const fileName = document.getElementById("fileName");

if (photoInput) {
    photoInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            previewContainer.classList.add("hidden");
            return;
        }

        fileName.textContent = file.name;

        const reader = new FileReader();

        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewContainer.classList.remove("hidden");
        };

        reader.readAsDataURL(file);

    });

}