const payloadText=document.getElementById('server-payload').textContent;
const serverData=JSON.parse(payloadText);
const detailsBtn=document.querySelectorAll('.view-hotel-details');

detailsBtn.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
        const hotelId=e.currentTarget.dataset.hotelId;
        const hotelName=e.currentTarget.dataset.hotelName;
        window.location=`/rooms/hotelDetails/${hotelId}?location=${serverData.location}&checkIn=${serverData.checkIn}&checkOut=${serverData.checkOut}&hotelName=${hotelName}&rooms=${serverData.rooms}&adults=${serverData.adults}&children=${serverData.children}`   
    })
})