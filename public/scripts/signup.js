const passwordInput = document.getElementById("password");
const passwordConfirmInput = document.getElementById("password-confirm");
const errorSpan = document.querySelector(".confirm-password-error");

passwordConfirmInput.addEventListener("input", (event) => {
    if(passwordInput.value === passwordConfirmInput.value) {
        passwordConfirmInput.setCustomValidity("");
        errorSpan.textContent = "";
    }
    else {
        errorSpan.textContent = "password does not match";
        passwordConfirmInput.setCustomValidity("Password doesn't match");
    }
})