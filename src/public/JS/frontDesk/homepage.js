document.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
        row.classList.add('scale-[0.995]');
        setTimeout(() => row.classList.remove('scale-[0.995]'), 150);
    });
});


function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
