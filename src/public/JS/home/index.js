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
        locations.result.forEach(location=>{
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