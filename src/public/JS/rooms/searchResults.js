console.log('Hii');

const detailsBtn=document.querySelectorAll('.view-hotel-details');
console.log(detailsBtn);
detailsBtn.forEach(btn=>{
    btn.addEventListener('click',(e)=>{
        const hotelId=e.currentTarget.dataset.hotelId;
        console.log(hotelId);
    })
})