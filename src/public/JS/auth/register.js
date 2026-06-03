console.log("hiiiiiiiii12345");


function togglePassword(id) {
    const input = document.getElementById(id);
    const icon = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        input.type = 'password';
        icon.innerText = 'visibility';
    }
}

// Add subtle focus animation to inputs
const inputs = document.querySelectorAll('input:not([type="checkbox"])');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('scale-[1.01]');
    });
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('scale-[1.01]');
    });
});

function showError(inputElement, message) {
    // Check if an error span already exists
    let errorSpan = inputElement.parentElement.querySelector(".input-error");

    if (!errorSpan) {
        // Create the span dynamically
        errorSpan = document.createElement("span");
        errorSpan.className = "input-error text-red-600 text-sm mt-1 block";
        inputElement.parentElement.appendChild(errorSpan);
    }

    // Set the message
    errorSpan.textContent = message;

    // Add red border to input
    inputElement.classList.add("border-error");
}

function clearError(inputElement) {
    const errorSpan = inputElement.parentElement.querySelector(".input-error");
    if (errorSpan) {
        errorSpan.remove();
    }
    inputElement.classList.remove("border-error");
}

const firstName=document.getElementById('firstName');
const lastName=document.getElementById('lastName');
const email=document.getElementById('email');
const phone=document.getElementById('phone');
const password=document.getElementById('password');
const confirmPassword=document.getElementById('confirmPassword');
const terms=document.getElementById('terms');

const nameRegex = /^[A-Za-z]{3,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Form Submission visual feedback
document.getElementById('registrationForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    console.log('Hiiiiiiii');
    const btn = this.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...';

    setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Welcome to LuxeStay';
        btn.classList.replace('bg-secondary', 'bg-status-available');

        // Reset for demo purposes after 2 seconds
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            btn.classList.replace('bg-status-available', 'bg-secondary');
        }, 2000);
    }, 1500);


    if(!firstName || nameRegex.test(firstName.value.trim()))
    {
        showError(firstName,'Should be atleast 3 characters')
    }


});

