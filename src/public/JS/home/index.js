console.log('Hiii');

const form = document.getElementById("search-form");
console.log(form);

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

form.addEventListener("submit",async (e) => {
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
    if (!checkinVal) { addError("checkin-input", "Select check-in"); hasErrors = true; }
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

    if (checkinVal && checkoutVal) {
        const d1 = new Date(checkinVal);
        const d2 = new Date(checkoutVal);
        if (d1 >= d2) {
            addError("checkin-input", "Must be before check-out");
            addError("checkout-input", "Must be after check-in");
            hasErrors = true;
        }
    }
    if (!isNaN(roomsVal) && roomsVal < 1) { addError("rooms-input", "Minimum 1 room required"); hasErrors = true; }
    if (!isNaN(guestsVal) && guestsVal < 1) { addError("guests-input", "Minimum 1 guest required"); hasErrors = true; }

    if (hasErrors) {
        e.preventDefault();
        console.log('Prevented form submission');
    } else {
        
        e.preventDefault();
        console.log("Success! Processing form structure transmission values.");

        const formData = new FormData(form);
        const plainObject=Object.fromEntries(formData.entries())

        console.log(plainObject);
        try {
            const response=await fetch('/rooms/searchHotels',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(plainObject)
            })
            
        } catch (error) {
            
        }
    }
});
