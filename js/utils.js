export function showToast(msg, type) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = `toast ${type}`;
    }, 2000);
}
