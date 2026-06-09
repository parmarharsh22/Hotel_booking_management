const form2 = document.getElementById("profileForm");
if (form2) {
    form2.addEventListener("submit", function (e) {

        let isValid = true;

        clearAllErrors();

        const firstName = document.getElementById("first_name");
        const lastName = document.getElementById("last_name");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const dob = document.getElementById("dob");
        const gender = document.getElementById("gender");
        const address = document.getElementById("address");
        const state = document.getElementById("state");
        const city = document.getElementById("city");
        const avatar = document.getElementById("avatarInput");

        const nameRegex = /^[A-Za-z\s]{2,50}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!nameRegex.test(firstName.value.trim())) {
            showError(firstName, "Enter a valid first name");
            isValid = false;
        }

        if (!nameRegex.test(lastName.value.trim())) {
            showError(lastName, "Enter a valid last name");
            isValid = false;
        }

        if (!phoneRegex.test(phone.value.trim())) {
            showError(phone, "Enter a valid mobile number");
            isValid = false;
        }

        if (!dob.value) {

            showError(dob, "Date of birth is required");
            isValid = false;

        } else {

            const birthDate = new Date(dob.value);
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();

            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 &&
                    today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            if (age < 18) {
                showError(dob, "You must be at least 18 years old");
                isValid = false;
            }
        }

        if (!gender.value) {
            showError(gender, "Please select a gender");
            isValid = false;
        }

        if (address.value.trim().length < 10) {
            showError(address, "Address must be at least 10 characters");
            isValid = false;
        }

        if (!state.value) {
            showError(state, "Please select a state");
            isValid = false;
        }

        if (!city.value) {
            showError(city, "Please select a city");
            isValid = false;
        }

        if (avatar.files.length > 0) {

            const file = avatar.files[0];

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {
                showError(
                    avatar.parentElement,
                    "Only JPG, PNG and WEBP files are allowed"
                );
                isValid = false;
            }

            if (file.size > 5 * 1024 * 1024) {
                showError(
                    avatar.parentElement,
                    "Image size cannot exceed 5MB"
                );
                isValid = false;
            }
        }

        if (!isValid) {
            e.preventDefault();
        }
    });
    function showError(element, message) {

        clearError(element);

        const error = document.createElement("p");

        error.className =
            "text-red-500 text-sm mt-1 validation-error";

        error.textContent = message;

        element.parentElement.appendChild(error);

        element.classList.add(
            "border-red-500",
            "focus:ring-red-500"
        );
    }

    function clearError(element) {

        const existingError =
            element.parentElement.querySelector(
                ".validation-error"
            );

        if (existingError) {
            existingError.remove();
        }

        element.classList.remove(
            "border-red-500",
            "focus:ring-red-500"
        );
    }

    function clearAllErrors() {

        document
            .querySelectorAll(".validation-error")
            .forEach(error => error.remove());

        document
            .querySelectorAll(".border-red-500")
            .forEach(element => {
                element.classList.remove(
                    "border-red-500",
                    "focus:ring-red-500"
                );
            });
    }
}
