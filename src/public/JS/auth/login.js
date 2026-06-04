function showToast(message, type = "success") {

    const colors = {
        success: "#28a745",
        error: "#dc3545",
        warning: "#ffc107",
        info: "#0dcaf0"
    };

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        stopOnFocus: true,
        style: {
            background: colors[type] || colors.success
        }
    }).showToast();
}