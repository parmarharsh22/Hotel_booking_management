const roomSelects = document.querySelectorAll(".room-select");

const totalPriceEl = document.getElementById("totalPrice");
const selectedRoomsEl = document.getElementById("selectedRooms");

const show_adults=document.getElementById('show-adults');
const show_children=document.getElementById('show-children');

const payloadText=document.getElementById('server-payload').textContent;
const serverData=JSON.parse(payloadText);

const checkIn=new Date(serverData.checkIn);
const checkOut=new Date(serverData.checkOut);
const requestedAdults=parseInt(serverData.adults);
const requestedChildren=parseInt(serverData.children);

const timeDifference = checkOut - checkIn;

const millisecondsPerDay = 1000 * 60 * 60 * 24;
const totalNights = Math.round(timeDifference / millisecondsPerDay);

let selectedAdults=0;
let selectedChildren=0;

function updateSummary() {
  let total = 0;
  selectedAdults=0;
  selectedChildren=0;
  let html = "";

  roomSelects.forEach((select) => {
    const qty = parseInt(select.value);
    const price = parseFloat(select.dataset.price);

    if (qty > 0) {
      const roomCard = select.closest(".bg-white");

      const roomName = roomCard.querySelector("h3").innerText;

      const typeName=select.id;
      const adultsCount=parseInt(document.getElementById(`${typeName}-adults-count`).textContent);
      const childrenCount=parseInt(document.getElementById(`${typeName}-children-count`).textContent)

      total += qty * price * totalNights;

      selectedAdults+=qty*adultsCount;
      selectedChildren+=qty*childrenCount;

      html += `
                <div class="flex justify-between mb-2">
                    <span>${roomName} x ${qty} (${totalNights} nights)</span>
                    <span>₹${qty * price * totalNights}</span>
                </div>
            `;
    }
  });

  show_adults.innerHTML=selectedAdults;
  show_children.innerHTML=selectedChildren;

  selectedRoomsEl.innerHTML = html || "No rooms selected";

  totalPriceEl.innerText = `₹${total.toLocaleString()}`;
}

roomSelects.forEach((select) => {
  select.addEventListener("change", updateSummary);
});

updateSummary();

const continue_to_book_btn=document.getElementById('continue-to-book-btn');

continue_to_book_btn.addEventListener('click',(e)=>{
  e.preventDefault();

  if(selectedAdults<requestedAdults || selectedChildren<requestedChildren)
  {
    const div=document.createElement('div');
    
   // Replace your existing innerHTML line with this formatted design
    div.innerHTML = `
      <div class="mt-4 flex items-start gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md shadow-sm transition-all duration-300 animate-pulse-once">
        <!-- Red Alert Icon -->
        <span class="text-base leading-none shrink-0 mt-0.5" aria-hidden="true">🛑</span>
        
        <!-- Warning Message Content -->
        <div class="text-xs sm:text-sm text-red-800 leading-relaxed font-medium">
          <span class="font-bold block text-red-900 mb-0.5">Capacity Mismatch</span>
          Selected rooms have space for <span class="underline decoration-red-300 font-semibold">${selectedAdults} Adults, ${selectedChildren} Child</span>. 
          Your search was for <span class="font-semibold">${requestedAdults} Adults, ${requestedChildren} Children</span>.
        </div>
      </div>
    `;

    continue_to_book_btn.insertAdjacentElement('afterend',div)
    continue_to_book_btn.classList.add('opacity-50','pointer-events-none','cursor-none')
  }
})