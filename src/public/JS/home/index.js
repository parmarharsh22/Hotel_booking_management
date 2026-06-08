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
    const guestsInput = document.getElementById("guests-input");

    const locationVal = locationInput.value.trim();
    const checkinVal = checkinInput.value;
    const checkoutVal = checkoutInput.value;
    const roomsVal = parseInt(roomsInput.value, 10);
    const guestsVal = parseInt(guestsInput.value, 10);

    if (!locationVal) { addError("location-input", "Required field"); hasErrors = true; }
    if (!checkoutVal) { addError("checkout-input", "Select check-out"); hasErrors = true; }
    if (isNaN(roomsVal)) { addError("rooms-input", "Enter rooms count"); hasErrors = true; }
    if (isNaN(guestsVal)) { addError("guests-input", "Enter guests count"); hasErrors = true; }

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
    if (!isNaN(guestsVal) && guestsVal < 1) { addError("guests-input", "Minimum 1 guest required"); hasErrors = true; }

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
            dropdown.appendChild(opt);
        })

    } catch (err) {
        console.error("Error occurred!", err);
    }
};

document.querySelectorAll('input, select').forEach(element => {
    element.addEventListener('focus', () => {
        element.closest('.group').classList.add('bg-primary-container/5');
    });
    element.addEventListener('blur', () => {
        element.closest('.group').classList.remove('bg-primary-container/5');
    });
});
async function openProfileModal() {
    const modal = document.getElementById("profileModal");
    try{
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
        inpemail.value =`${data.email}`;
        dob.value = new Date(data.dob).toISOString().split("T")[0];
        phone.value = `${data.phone}`;
        gender.value = `${data.gender}`;
        state.value = `${data.state}`;
        city.value = `${data.city}`;
        address.value = `${data.address}`;
        

    
    }catch(err){
        console.log("error occured ",err);
    }
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.body.style.overflow = "hidden";
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    modal.classList.remove("flex");
    modal.classList.add("hidden");

    document.body.style.overflow = "auto";
}