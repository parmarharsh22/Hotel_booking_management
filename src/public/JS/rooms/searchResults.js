const payloadText=document.getElementById('server-payload').textContent;
const serverData=JSON.parse(payloadText);
const detailsBtn=document.querySelectorAll('.view-hotel-details');

detailsBtn.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
        const hotelId=e.currentTarget.dataset.hotelId;
        const hotelName=e.currentTarget.dataset.hotelName;
        const params = new URLSearchParams({
                          location: serverData.location,
                          checkIn: serverData.checkIn,
                          checkOut: serverData.checkOut,
                          hotelName: hotelName,
                          rooms: serverData.rooms,
                          adults: serverData.adults,
                          children: serverData.children,
                          price_filter:serverData.price_filter,
                          roomTypes_filter: JSON.stringify(serverData.roomTypes_filter||[]), 
                          amenities_filter: JSON.stringify(serverData.amenities_filter||[]), 
                        });
        window.location.href=`/rooms/hotelDetails/${hotelId}?${params.toString()}`   
    })
})

let isAscending = true;

document.getElementById('sortToggle').addEventListener('click', (e) => {
    const container = document.getElementById('hotelContainer');
    const cards = Array.from(container.querySelectorAll('.hotel-card'));
    const icon = document.getElementById('sortIcon');

    // 1. Sort the items in memory
    cards.sort((a, b) => {
        const priceA = parseFloat(a.getAttribute('data-price')) || 0;
        const priceB = parseFloat(b.getAttribute('data-price')) || 0;
        return isAscending ? priceB - priceA : priceA - priceB; 
    });

    // 2. Wipe the container and drop them back in sorted order
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));

    // 3. Rotate the arrow icon visually (0deg down, 180deg up)
    icon.style.transform = isAscending ? 'rotate(180deg)' : 'rotate(0deg)';

    // 4. Flip the toggle direction state for the next click
    isAscending = !isAscending;
});