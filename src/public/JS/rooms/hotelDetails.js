/*
|--------------------------------------------------------------------------
| DOM Elements
|--------------------------------------------------------------------------
*/

const roomSelects = document.querySelectorAll(".room-select");

const totalPriceEl = document.getElementById("totalPrice");

const selectedRoomsEl = document.getElementById("selectedRooms");

const showAdults = document.getElementById("show-adults");

const showChildren = document.getElementById("show-children");

const continueToBookBtn = document.getElementById("continue-to-book-btn");

/*
|--------------------------------------------------------------------------
| Server Data
|--------------------------------------------------------------------------
*/

const payloadText = document.getElementById("server-payload").textContent;

const serverData = JSON.parse(payloadText);

/*
|--------------------------------------------------------------------------
| Search Requirements
|--------------------------------------------------------------------------
*/

const requestedAdults = parseInt(serverData.adults);

const requestedChildren = parseInt(serverData.children);

const checkIn = new Date(serverData.checkIn + "T00:00:00");

const checkOut = new Date(serverData.checkOut + "T00:00:00");

/*
|--------------------------------------------------------------------------
| Nights Calculation
|--------------------------------------------------------------------------
*/

const millisecondsPerDay = 1000 * 60 * 60 * 24;

const totalNights = Math.max(
  1,
  Math.round((checkOut - checkIn) / millisecondsPerDay),
);

/*
|--------------------------------------------------------------------------
| Global State
|--------------------------------------------------------------------------
*/

let selectedAdults = 0;

let selectedChildren = 0;

let total = 0;

/*
|--------------------------------------------------------------------------
| Update Booking Summary
|--------------------------------------------------------------------------
*/

function updateSummary() {
  total = 0;

  selectedAdults = 0;

  selectedChildren = 0;

  let html = "";

  roomSelects.forEach((select) => {
    const quantity = parseInt(select.value);

    const price = parseFloat(select.dataset.price);

    if (quantity > 0) {
      const roomCard = select.closest(".bg-white");

      const roomName = roomCard.querySelector("h3").innerText;

      const roomType = select.dataset.roomType;

      const adultsPerRoom = parseInt(
        document.getElementById(`${roomType}-adults-count`).textContent,
      );

      const childrenPerRoom = parseInt(
        document.getElementById(`${roomType}-children-count`).textContent,
      );

      /*
            -------------------------
            Price Calculation
            -------------------------
            */

      const roomTotal = quantity * price * totalNights;

      total += roomTotal;

      /*
            -------------------------
            Capacity Calculation
            -------------------------
            */

      selectedAdults += quantity * adultsPerRoom;

      selectedChildren += quantity * childrenPerRoom;

      /*
            -------------------------
            Selected Room HTML
            -------------------------
            */

      html += `
                <div class="flex justify-between mb-2">

                    <span>
                        ${roomName}
                        x ${quantity}
                        (${totalNights} nights)
                    </span>


                    <span>
                        ₹${roomTotal.toLocaleString()}
                    </span>

                </div>
            `;
    }
  });

  /*
    -------------------------
    Update UI
    -------------------------
    */

  selectedRoomsEl.innerHTML = html || "No rooms selected";

  totalPriceEl.innerText = `₹${total.toLocaleString()}`;

  showAdults.innerText = selectedAdults;

  showChildren.innerText = selectedChildren;
}
/*
|--------------------------------------------------------------------------
| Capacity Mismatch Alert
|--------------------------------------------------------------------------
*/

function getAlertMessageDiv() {
  const div = document.createElement("div");

  div.className = "alert-message";

  div.innerHTML = `
        <div class="
            mt-4
            flex
            items-start
            gap-3
            bg-red-50
            border-l-4
            border-red-500
            p-4
            rounded-r-md
            shadow-sm
        ">

            <span class="
                text-base
                leading-none
                shrink-0
                mt-0.5
            ">
                🛑
            </span>


            <div class="
                text-xs
                sm:text-sm
                text-red-800
                leading-relaxed
                font-medium
            ">

                <span class="
                    font-bold
                    block
                    text-red-900
                    mb-1
                ">
                    Capacity Mismatch
                </span>


                Selected rooms can accommodate:

                <strong>
                    ${selectedAdults} Adults,
                    ${selectedChildren} Children
                </strong>


                <br>


                Your search requires:

                <strong>
                    ${requestedAdults} Adults,
                    ${requestedChildren} Children
                </strong>

            </div>

        </div>
    `;

  return div;
}

/*
|--------------------------------------------------------------------------
| Validate Room Capacity
|--------------------------------------------------------------------------
*/

function validateCapacity() {
  /*
    Remove old alerts
    */

  document
    .querySelectorAll(".alert-message")
    .forEach((alert) => alert.remove());

  const isValid =
    selectedAdults >= requestedAdults && selectedChildren >= requestedChildren;

  if (isValid) {
    continueToBookBtn.classList.remove(
      "opacity-50",
      "pointer-events-none",
      "cursor-not-allowed",
    );

    return true;
  }

  continueToBookBtn.classList.add(
    "opacity-50",
    "pointer-events-none",
    "cursor-not-allowed",
  );

  continueToBookBtn.insertAdjacentElement("afterend", getAlertMessageDiv());

  return false;
}

/*
|--------------------------------------------------------------------------
| Room Selection Events
|--------------------------------------------------------------------------
*/

roomSelects.forEach((select) => {
  select.addEventListener("change", () => {
    updateSummary();

    validateCapacity();
  });
});

/*
|--------------------------------------------------------------------------
| A's Booking Flow (Preserved)
|--------------------------------------------------------------------------
*/

async function createHold() {
  /*
    Refresh calculations before booking
    */

  updateSummary();

  if (!validateCapacity()) {
    return;
  }

  const rooms = [];

  roomSelects.forEach((select) => {
    const quantity = parseInt(select.value);

    if (quantity > 0) {
      rooms.push({
        room_type_id: parseInt(select.dataset.roomId),

        qty: quantity,
      });
    }
  });

  if (rooms.length === 0) {
    alert("Please select at least one room.");

    return;
  }

  try {
    const response = await fetch("/bookings/hold", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        hotel_id: serverData.hotelId,

        checkin_date: serverData.checkIn,

        checkout_date: serverData.checkOut,

        adults: serverData.adults,

        children: serverData.children,

        rooms,
      }),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = `/bookings/payment-page?hold_id=${data.hold_id}`;
    } else {
      alert(data.error || "Failed to hold rooms. Please try again.");
    }
  } catch (error) {
    console.error("Booking Hold Error:", error);

    alert("Network error. Please try again.");
  }
}

/*
|--------------------------------------------------------------------------
| Initial Page Load
|--------------------------------------------------------------------------
*/

updateSummary();

validateCapacity();
