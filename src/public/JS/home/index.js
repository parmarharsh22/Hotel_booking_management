const form = document.getElementById("search-form");

//Dates logic
const today = new Date();

const minDate = today.toISOString().split("T")[0];

const maxDateObj = new Date();
maxDateObj.setMonth(maxDateObj.getMonth() + 6);
const maxDate = maxDateObj.toISOString().split("T")[0];

const checkinInput = document.getElementById("checkin-input");
const checkoutInput = document.getElementById("checkout-input");

checkinInput.min = minDate;
checkinInput.max = maxDate;

checkoutInput.min = minDate;
checkoutInput.max = maxDate;

window.addError = function (inputId, message) {
    const inputField = document.getElementById(inputId);
    const parentWrapper = inputField.closest('.group');


    if (parentWrapper.querySelector(".error-span")) return;

    const errorSpan = document.createElement("span");
    errorSpan.className = "error-span text-red-500 text-[11px] font-medium block mt-1";
    errorSpan.textContent = message;

    parentWrapper.appendChild(errorSpan);
};

window.removeError = function () {
    const activeErrors = document.querySelectorAll(".error-span");
    activeErrors.forEach(span => span.remove());
};

form.addEventListener("submit", async (e) => {
    removeError();

    let hasErrors = false;

    const locationInput = document.getElementById("location-input");
    const checkinInput = document.getElementById("checkin-input");
    const checkoutInput = document.getElementById("checkout-input");
    const roomsInput = document.getElementById("rooms-input");
    const adultsInput = document.getElementById("adults-input");
    const childInput = document.getElementById("child-input");

    const locationVal = locationInput.value.trim();
    const checkinVal = checkinInput.value;
    const checkoutVal = checkoutInput.value;
    const roomsVal = parseInt(roomsInput.value, 10);
    const adultsVal = parseInt(adultsInput.value, 10);
    const childVal = parseInt(childInput.value, 10);

    if (!locationVal) { addError("location-input", "Required field"); hasErrors = true; }
    if (!checkoutVal) { addError("checkout-input", "Select check-out"); hasErrors = true; }
    if (isNaN(roomsVal)) { addError("rooms-input", "Enter rooms count"); hasErrors = true; }
    if (isNaN(adultsVal)) { addError("adults-input", "Enter adults count"); hasErrors = true; }
    if (isNaN(childVal)) { addError("child-input", "Enter childs count"); hasErrors = true; }

    if (locationVal) {
        const locationRegex = /^[A-Za-z\s,\-]*$/;
        if (!locationRegex.test(locationVal)) {
            addError("location-input", "Type at least 3 characters");
            hasErrors = true;
        }
    }

    if (checkinVal) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxBookingDate = new Date();
        maxBookingDate.setMonth(maxBookingDate.getMonth() + 6);
        maxBookingDate.setHours(0, 0, 0, 0);

        const selectedCheckin = new Date(checkinVal);

        if (selectedCheckin < today) {
            addError("checkin-input", "Check-in cannot be before today");
            hasErrors = true;
        }

        if (selectedCheckin > maxBookingDate) {
            addError("checkin-input", "Bookings allowed only 6 months ahead");
            hasErrors = true;
        }
    }

    if (checkinVal && checkoutVal) {
        const checkinDate = new Date(checkinVal);
        const checkoutDate = new Date(checkoutVal);

        if (checkoutDate <= checkinDate) {
            addError("checkout-input", "Check-out must be after check-in");
            hasErrors = true;
        }
    }
    if (!isNaN(roomsVal) && roomsVal < 1) { addError("rooms-input", "Minimum 1 room required"); hasErrors = true; }
    if (!isNaN(adultsVal) && adultsVal < 1) { addError("adults-input", "Minimum 1 adult required"); hasErrors = true; }
    // if (!isNaN(childVal) && childVal < 1) { addError("child-input", "Minimum 1 child required"); hasErrors = true; }

    if (hasErrors) {
        e.preventDefault();
    }
});


//load date dynamically on load
checkinInput.addEventListener("change", () => {
    const selectedCheckin = checkinInput.value;

    checkoutInput.min = selectedCheckin;

    if (
        checkoutInput.value &&
        new Date(checkoutInput.value) <= new Date(selectedCheckin)
    ) {
        checkoutInput.value = "";
    }
});


window.onload = async () => {
    try {
        const response = await fetch("/getLocations");
        const locations = await response.json();
        const dropdown = document.getElementById("location-input");
        locations.result.forEach(location => {
            const opt = document.createElement("option");
            opt.textContent = location.city;
            opt.value = location.city;
            opt.classList.add('bg-black')
            dropdown.appendChild(opt);
        })

    } catch (err) {
        console.error("Error occurred!", err);
    }
};

document.querySelectorAll('input, select, textarea').forEach(element => {

    element.addEventListener('focus', () => {
        element.parentElement.classList.add('ring-1', 'ring-amber-500');
    });

    element.addEventListener('blur', () => {
        element.parentElement.classList.remove('ring-1', 'ring-amber-500');
    });

});

async function openProfileModal() {
    const modal = document.getElementById("profileModal");
    try {
        const response = await fetch("/authen/fetchUserDetails");
        const data = await response.json();

        console.log(data);

        const imgInput = document.getElementById("avatarPreview");
        const first_name = document.getElementById("first_name");
        const last_name = document.getElementById("last_name");
        const inpemail = document.getElementById("email");
        const phone = document.getElementById("phone");
        const dob = document.getElementById("dob");
        const gender = document.getElementById("gender");
        const address = document.getElementById("address");
        const city = document.getElementById("city");
        const state = document.getElementById("state");

        imgInput.src = `/uploads/profile-photos/${data.photo_url}`;
        first_name.value = `${data.first_name}`;
        last_name.value = `${data.last_name}`;
        inpemail.value = `${data.email}`;
        dob.value = new Date(data.dob).toISOString().split("T")[0];
        phone.value = `${data.phone}`;
        gender.value = `${data.gender}`;
        // state.innerHTML = `<option>${data.state}</option>`;
        // city.innerHTML = `<option>${data.city}</option>`;
        state.value = data.state;
        await loadCities();
        city.value = data.city;
        address.value = `${data.address}`;

    } catch (err) {
        console.log("error occured ", err);
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.body.style.overflow = "hidden";
}

window.closeProfileModal = function () {
    const modal = document.getElementById("profileModal");

    modal.classList.remove("flex");
    modal.classList.add("hidden");

    document.body.style.overflow = "auto";
};

const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");

window.addEventListener("DOMContentLoaded", loadStates);

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

        const data = await response.json();

        data.data.states.forEach(state => {

            const option =
                document.createElement("option");

            option.value = state.name;
            option.textContent = state.name;

            stateSelect.appendChild(option);
        });

    } catch (err) {
        console.error(err);
    }
}

stateSelect.addEventListener(
    "change",
    loadCities
);

async function loadCities() {

    citySelect.innerHTML =
        '<option value="">Loading...</option>';

    try {

        const response = await fetch(
            "https://countriesnow.space/api/v0.1/countries/state/cities",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    country: "India",
                    state: stateSelect.value
                })
            }
        );

        const data = await response.json();

        citySelect.innerHTML =
            '<option value="">Select City</option>';

        data.data.forEach(city => {

            const option =
                document.createElement("option");

            option.value = city;
            option.textContent = city;

            citySelect.appendChild(option);
        });

    } catch (err) {

        console.error(err);

        citySelect.innerHTML =
            '<option value="">Unable to load cities</option>';
    }
}

const avatarInput =
    document.getElementById("avatarInput");

const avatarPreview =
    document.getElementById("avatarPreview");

avatarInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) return;

        avatarPreview.src =
            URL.createObjectURL(file);
    }
);