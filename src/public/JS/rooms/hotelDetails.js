const roomSelects = document.querySelectorAll(".room-select");
const totalPriceEl = document.getElementById("totalPrice");
const selectedRoomsEl = document.getElementById("selectedRooms");
const showAdults = document.getElementById('show-adults');
const showChildren = document.getElementById('show-children');
const continueToBookBtn = document.getElementById('continue-to-book-btn');

const payloadText = document.getElementById('server-payload').textContent;
const serverData = JSON.parse(payloadText);

const checkIn = new Date(serverData.checkIn);
const checkOut = new Date(serverData.checkOut);
const requestedAdults = parseInt(serverData.adults);
const requestedChildren = parseInt(serverData.children);

const timeDifference = checkOut - checkIn;
const millisecondsPerDay = 1000 * 60 * 60 * 24;
const totalNights = Math.round(timeDifference / millisecondsPerDay);

let selectedAdults = 0;
let selectedChildren = 0;
let total=0;

function updateSummary() {
  total = 0;
  selectedAdults = 0;
  selectedChildren = 0;
  let html = "";

  roomSelects.forEach((select) => {
    const qty = parseInt(select.value);
    const price = parseFloat(select.dataset.price);

    if (qty > 0) {
      const roomCard = select.closest(".bg-white");
      const roomName = roomCard.querySelector("h3").innerText;
      const typeName = select.dataset.roomType;
      const adultsCount = parseInt(document.getElementById(`${typeName}-adults-count`).textContent);
      const childrenCount = parseInt(document.getElementById(`${typeName}-children-count`).textContent);

      total += qty * price * totalNights;
      selectedAdults += qty * adultsCount;
      selectedChildren += qty * childrenCount;

      html += `
        <div class="flex justify-between mb-2">
            <span>${roomName} x ${qty} (${totalNights} nights)</span>
            <span>₹${(qty * price * totalNights).toLocaleString()}</span>
        </div>
      `;
    }
  });

  showAdults.innerHTML = selectedAdults;
  showChildren.innerHTML = selectedChildren;
  selectedRoomsEl.innerHTML = html || "No rooms selected";
  totalPriceEl.innerText = `₹${total.toLocaleString()}`;
}

function getAlertMessageDiv()
{
  const div = document.createElement('div');
  div.className = "alert-message"; 
  
  div.innerHTML = `
    <div class="mt-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm transition-all duration-300 animate-pulse-once">
      <span class="text-base leading-none shrink-0 mt-0.5" aria-hidden="true">🛑</span>
      <div class="text-xs sm:text-sm text-red-800 leading-relaxed font-medium">
        <span class="font-bold block text-red-900 mb-0.5">Capacity Mismatch</span>
        Selected rooms have space for <span class="underline decoration-red-300 font-semibold">${selectedAdults} Adults, ${selectedChildren} Children</span>. 
        Your search was for <span class="font-semibold">${requestedAdults} Adults, ${requestedChildren} Children</span>.
      </div>
    </div>
  `;

  return div;
}

function validateCapacity() {
  const elements = document.querySelectorAll('.alert-message');
  elements.forEach((div) => div.remove());
  
  if (selectedAdults >= requestedAdults && selectedChildren >= requestedChildren) {
    continueToBookBtn.classList.remove('opacity-50', 'pointer-events-none', 'cursor-none');
  }else{
    const div = getAlertMessageDiv();
    
    continueToBookBtn.insertAdjacentElement('afterend', div);
    continueToBookBtn.classList.add('opacity-50', 'pointer-events-none', 'cursor-none');
  }
}

continueToBookBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  
  validateCapacity();

  if (selectedAdults < requestedAdults || selectedChildren < requestedChildren) {
    const div = getAlertMessageDiv();
    
    continueToBookBtn.insertAdjacentElement('afterend', div);
    continueToBookBtn.classList.add('opacity-50', 'pointer-events-none', 'cursor-none');
  } else {

    let selections=[];

    roomSelects.forEach((select)=>{
      const qty=parseInt(select.value);

      if(qty>0)
      {
        const roomTypeId=parseInt(select.dataset.roomTypeId);

        const typeName = select.dataset.roomType;

        selections.push({
          typeName:typeName,
          roomTypeId:roomTypeId,
          quantity:qty
        })
      }
    })

    const bookingData={
      hotelId:serverData.hotelId,
      checkIn:serverData.checkIn,
      checkOut:serverData.checkOut,
      adults:serverData.adults,
      children:serverData.children,
      selections:selections
    };

    const response=await fetch ('/rooms/bookingHold',{
      'headers':{'Content-Type':'application/json'},
      method:'POST',
      body:JSON.stringify(bookingData)
    })

    if(response.redirected)
    {
      window.location.href=response.url;
      return;
    }

    const data=await response.json();

    if(!response.ok)
    {
      alert(data.message)
      return;
    }

    window.location.href='/rooms/payment';
  }
});

roomSelects.forEach((select) => {
  select.addEventListener("change", () => {
    updateSummary();
    validateCapacity();
  });
});

// Initial runs on page load
updateSummary();
validateCapacity();
